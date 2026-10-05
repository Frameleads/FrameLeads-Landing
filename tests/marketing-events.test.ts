import assert from "node:assert/strict";
import test from "node:test";
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

function withBrowser<T>(run: (events: MarketingEvent[], storage: Map<string, string>, location: { search: string; pathname: string }) => T): T {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storage = new Map<string, string>();
  const events: MarketingEvent[] = [];
  const location = { search: "", pathname: "/" };
  const fakeWindow = {
    location,
    document: { referrer: "" },
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
    dispatchEvent: (event: Event) => {
      events.push((event as CustomEvent<MarketingEvent>).detail);
      return true;
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  try {
    return run(events, storage, location);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

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

test("failed lead capture emits no Lead event and successful capture emits exactly one", () => {
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
