import assert from "node:assert/strict";
import test from "node:test";
import { getPrivacyConsent, hasCurrentAffiliateNoticeConsent, requiresAffiliateNoticeChoice, savePrivacyConsent, subscribePrivacyConsent } from "../src/privacy-consent.ts";
import {
  captureMarketingAttribution,
  initializeMarketingPixels,
  marketingEventNames,
  mergeMarketingAttribution,
  sanitizeMarketingEventProperties,
  trackLeadCaptureIfSuccessful,
  trackMarketingEvent,
  type MarketingEvent,
} from "../src/marketing-events.ts";

function withBrowser<T>(run: (events: MarketingEvent[], storage: Map<string, string>, location: { search: string; pathname: string; hash: string; hostname: string; href: string }, local: Map<string, string>, fireStorageChange: (newValue: string | null) => void) => T): T {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storage = new Map<string, string>();
  const local = new Map<string, string>([["frameleads:privacy-consent:v1", JSON.stringify({ analytics: true, advertising: true, savedAt: "2026-10-13T00:00:00.000Z" })]]);
  const events: MarketingEvent[] = [];
  const listeners = new Map<string, EventListener>();
  const location = { search: "", pathname: "/", hash: "", hostname: "frameleads.io", get href() { return `https://frameleads.io${this.pathname}${this.search}${this.hash}`; } };
  const fakeWindow = {
    location,
    history: { state: null, replaceState: (_state: unknown, _title: string, url: string) => {
      const parsed = new URL(url, "https://frameleads.io");
      location.pathname = parsed.pathname;
      location.search = parsed.search;
      location.hash = parsed.hash;
    } },
    document: { referrer: "" },
    localStorage: {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => local.set(key, value),
      removeItem: (key: string) => local.delete(key),
    },
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    dispatchEvent: (event: Event) => {
      events.push((event as CustomEvent<MarketingEvent>).detail);
      return true;
    },
    addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
    removeEventListener: (type: string) => listeners.delete(type),
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  try {
    return run(events, storage, location, local, (newValue) => listeners.get("storage")?.({ key: "frameleads:privacy-consent:v1", newValue } as StorageEvent as unknown as Event));
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

// One reviewed test notice only. Production requires independently approved public notice text.
process.env.NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED = "true";
process.env.NEXT_PUBLIC_AFFILIATE_CONSENT_NOTICE_VERSION = "affiliate-test-v1";

test("a historical advertising opt-in cannot be silently upgraded to affiliate permission", () => {
  withBrowser((_events, _storage, location) => {
    location.search = "?a=partner_old&utm_source=affiliate";
    assert.equal(hasCurrentAffiliateNoticeConsent(getPrivacyConsent()), false);
    assert.equal(requiresAffiliateNoticeChoice(getPrivacyConsent()), true);
    assert.equal(captureMarketingAttribution(true).affiliateCode, undefined);
    assert.equal(new URL(location.href).searchParams.get("a"), "partner_old",
      "undecided new purpose must not erase a potential referral before choice");
    savePrivacyConsent({ analytics: true, advertising: true }, "decline");
    assert.equal(requiresAffiliateNoticeChoice(getPrivacyConsent()), false);
    assert.equal(hasCurrentAffiliateNoticeConsent(getPrivacyConsent()), false);
    assert.equal(captureMarketingAttribution(true).affiliateCode, undefined);
    savePrivacyConsent({ analytics: true, advertising: true });
    assert.equal(hasCurrentAffiliateNoticeConsent(getPrivacyConsent()), true);
    assert.equal(captureMarketingAttribution(true).affiliateCode, "partner_old");
  });
});

test("notice version rotation requires new affirmative consent before another referral", () => {
  withBrowser((_events, _storage, location) => {
    location.search = "?a=partner_rotate";
    savePrivacyConsent({ analytics: true, advertising: true });
    assert.equal(captureMarketingAttribution(true).affiliateCode, "partner_rotate");
    process.env.NEXT_PUBLIC_AFFILIATE_CONSENT_NOTICE_VERSION = "affiliate-test-v2";
    try {
      assert.equal(captureMarketingAttribution(true).affiliateCode, undefined);
      assert.equal(requiresAffiliateNoticeChoice(getPrivacyConsent()), true);
      savePrivacyConsent({ analytics: true, advertising: true });
      assert.equal(captureMarketingAttribution(true).affiliateCode, "partner_rotate");
    } finally {
      process.env.NEXT_PUBLIC_AFFILIATE_CONSENT_NOTICE_VERSION = "affiliate-test-v1";
    }
  });
});

test("canonical marketing event names are stable and do not include client-side purchase confirmation", () => {
  assert.deepEqual(marketingEventNames, [
    "LANDING_VIEW", "AUDIT_STARTED", "AUDIT_COMPLETED", "LEAD_CAPTURED", "WORKFLOW_MAP_VIEWED",
    "PRODUCT_PROOF_VIEWED", "PRICING_VIEWED", "CORE_CHECKOUT_STARTED", "ENTERPRISE_CHECKOUT_STARTED", "PARTNER_LINK_CLICKED",
  ]);
  assert.ok(!marketingEventNames.includes("PURCHASE_CONFIRMED" as (typeof marketingEventNames)[number]));
});

test("pixel adapters safely do nothing during server rendering when no browser exists", () => {
  assert.doesNotThrow(() => initializeMarketingPixels());
});

test("generic event properties allow attribution but exclude PII and arbitrary fields", () => {
  const properties = sanitizeMarketingEventProperties({
    source: "HERO",
    diagnosis: "FRAGMENTED_REPLY_WORKFLOW",
    plan: "CORE",
    landingPath: "/?email=private@example.com&utm_source=ads",
    email: "private@example.com",
    firstName: "Alex",
    attribution: { utmSource: "ads", referrer: "https://ref.example/path?email=private@example.com", email: "private@example.com" },
  });
  assert.deepEqual(properties, {
    source: "HERO",
    diagnosis: "FRAGMENTED_REPLY_WORKFLOW",
    plan: "CORE",
    attribution: { utmSource: "ads" },
  });
});

test("first-touch session attribution survives later empty URLs and is added to generic events", () => {
  withBrowser((events, storage, location) => {
    location.search = "?utm_source=partner&utm_campaign=launch";
    location.pathname = "/audit";
    const first = captureMarketingAttribution();
    assert.equal(first.utmSource, "partner");
    assert.equal(first.utmCampaign, "launch");
    assert.equal(first.landingPath, "/audit");

    location.search = "?audit=1";
    location.pathname = "/";
    trackMarketingEvent("AUDIT_STARTED", { source: "REPLY_WORKFLOW_AUDIT" });
    assert.equal(events[0].event, "AUDIT_STARTED");
    assert.equal(events[0].properties.attribution?.utmSource, "partner");
    assert.equal(events[0].properties.attribution?.utmCampaign, "launch");
    assert.equal(events[0].properties.landingPath, "/");
    assert.ok(storage.has("frameleads:marketing-attribution:v1"));
  });
});

test("failed capture emits no local capture notification and successful capture emits exactly one", () => {
  withBrowser((events) => {
    assert.equal(trackLeadCaptureIfSuccessful(false, { source: "REPLY_WORKFLOW_AUDIT" }), false);
    assert.equal(events.length, 0);
    assert.equal(trackLeadCaptureIfSuccessful(true, { source: "REPLY_WORKFLOW_AUDIT", diagnosis: "HIGH_CONSEQUENCE_DECISION_WORKFLOW" }), true);
    assert.deepEqual(events.map((event) => event.event), ["LEAD_CAPTURED"]);
    assert.equal(events[0].properties.diagnosis, "HIGH_CONSEQUENCE_DECISION_WORKFLOW");
  });
});

test("checkout click events are distinct from purchase and lead lifecycle events", () => {
  withBrowser((events) => {
    trackMarketingEvent("CORE_CHECKOUT_STARTED", { source: "PRICING", plan: "CORE" });
    trackMarketingEvent("ENTERPRISE_CHECKOUT_STARTED", { source: "PRICING", plan: "ENTERPRISE" });
    assert.deepEqual(events.map((event) => event.event), ["CORE_CHECKOUT_STARTED", "ENTERPRISE_CHECKOUT_STARTED"]);
    assert.deepEqual(events.map((event) => event.properties.plan), ["CORE", "ENTERPRISE"]);
    assert.ok(events.every((event) => event.event !== ("PURCHASE_CONFIRMED" as MarketingEvent["event"])));
  });
});

test("attribution merging never replaces known campaign values with empty values", () => {
  assert.deepEqual(mergeMarketingAttribution(
    { utmSource: "newsletter", utmCampaign: "launch", landingPath: "/" },
    { utmSource: "", utmCampaign: undefined, landingPath: "/audit" },
  ), { utmSource: "newsletter", utmCampaign: "launch", landingPath: "/" });
});

test("advertising withdrawal removes session affiliate data and URL referral while preserving analytics attribution", () => {
  withBrowser((_events, storage, location) => {
    savePrivacyConsent({ analytics: true, advertising: true });
    location.search = "?a=partner_alpha&utm_source=partner&utm_campaign=spring";
    const captured = captureMarketingAttribution(true);
    assert.equal(captured.affiliateCode, "partner_alpha");
    assert.equal(captured.utmSource, "partner");

    savePrivacyConsent({ analytics: true, advertising: false });
    const saved = JSON.parse(storage.get("frameleads:marketing-attribution:v1")!);
    assert.equal(saved.affiliateCode, undefined);
    assert.equal(saved.utmSource, "partner");
    assert.equal(saved.utmCampaign, "spring");
    assert.equal(new URL(location.href).searchParams.has("a"), false);

    savePrivacyConsent({ analytics: true, advertising: true });
    assert.equal(captureMarketingAttribution().affiliateCode, undefined);
    location.search = "?a=partner_beta&utm_source=partner";
    assert.equal(captureMarketingAttribution(true).affiliateCode, "partner_beta");
  });
});

test("analytics-only consent retains allowed UTM attribution but never captures affiliate referrals", () => {
  withBrowser((_events, _storage, location) => {
    savePrivacyConsent({ analytics: true, advertising: false });
    location.search = "?a=partner_alpha&utm_source=partner";
    const attribution = captureMarketingAttribution();
    assert.equal(attribution.affiliateCode, undefined);
    assert.equal(attribution.utmSource, "partner");
  });
});

test("a consent withdrawal in another tab clears this tab's referral and leaves its UTM attribution", () => {
  withBrowser((_events, storage, location, local, fireStorageChange) => {
    savePrivacyConsent({ analytics: true, advertising: true });
    location.search = "?a=partner_alpha&utm_source=partner";
    captureMarketingAttribution(true);
    const unsubscribe = subscribePrivacyConsent(() => {});
    const changedChoice = JSON.stringify({ analytics: true, advertising: false, savedAt: "2026-10-22T12:00:00.000Z" });
    local.set("frameleads:privacy-consent:v1", changedChoice);
    fireStorageChange(changedChoice);
    const saved = JSON.parse(storage.get("frameleads:marketing-attribution:v1")!);
    assert.equal(saved.affiliateCode, undefined);
    assert.equal(saved.utmSource, "partner");
    assert.equal(new URL(location.href).searchParams.has("a"), false);
    unsubscribe();
  });
});

test("undecided first visit keeps the referral URL but neither stores nor returns affiliate attribution before opt-in", () => {
  withBrowser((_events, storage, location, local) => {
    local.delete("frameleads:privacy-consent:v1");
    location.search = "?a=partner_first&utm_source=partner";

    assert.deepEqual(captureMarketingAttribution(), {});
    assert.equal(storage.has("frameleads:marketing-attribution:v1"), false);
    assert.equal(new URL(location.href).searchParams.get("a"), "partner_first");

    savePrivacyConsent({ analytics: true, advertising: true });
    assert.equal(captureMarketingAttribution(true).affiliateCode, "partner_first");
  });
});
