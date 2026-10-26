import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { checkoutTier, embeddedCheckoutPolicy, tierInformation, referralCheckoutDecision, hostedCheckoutWithAffiliate, WHOP_EMBED_LOADER, WHOP_CHECKOUT_RETURN_URL } from "../src/checkout-embed-policy.ts";

test("supports all three FrameLeads tiers with existing offer and plan mappings", () => {
  assert.equal(checkoutTier("micro-pilot"), true);
  assert.equal(checkoutTier("core"), true);
  assert.equal(checkoutTier("enterprise"), true);
  assert.equal(checkoutTier("anything-else"), false);
  assert.equal(tierInformation("micro-pilot").productionPlanId, "plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").hostedCheckout, "https://whop.com/checkout/plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").displayedPrice, "$10");
  assert.equal(tierInformation("micro-pilot").billingInterval, "one-time");
  assert.equal(tierInformation("micro-pilot").recurring, false);
  assert.equal(tierInformation("micro-pilot").monthlyQuota, 25);
  assert.equal(tierInformation("micro-pilot").usageLabel, "25 total prospects");
  assert.equal(tierInformation("micro-pilot").benefits[0], "25 total prospects");
  assert.equal(tierInformation("core").productionPlanId, "plan_GQTDPXnvijugf");
  assert.equal(tierInformation("core").hostedCheckout, "https://whop.com/checkout/plan_GQTDPXnvijugf");
  assert.equal(tierInformation("enterprise").productionPlanId, "plan_uGDGf5WKW7hlE");
  assert.equal(tierInformation("enterprise").hostedCheckout, "https://whop.com/checkout/plan_uGDGf5WKW7hlE");
  assert.equal(tierInformation("core").displayedPrice, "$149");
  assert.equal(tierInformation("enterprise").displayedPrice, "$499");
  assert.equal(tierInformation("core").billingInterval, "month");
  assert.equal(tierInformation("enterprise").billingInterval, "month");
});

test("homepage and all checkout tiers present the finalized prices without stale monthly amounts", () => {
  const homepage = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.match(homepage, /\$149/);
  assert.match(homepage, /\$499/);
  assert.doesNotMatch(homepage, /\$147|\$697/);
  assert.equal(tierInformation("micro-pilot").displayedPrice, "$10");
  assert.equal(tierInformation("micro-pilot").usageLabel, "25 total prospects");
});

test("Whop native loader and existing SaaS login return target are fixed", () => {
  assert.equal(WHOP_EMBED_LOADER, "https://js.whop.com/static/checkout/loader.js");
  assert.equal(WHOP_CHECKOUT_RETURN_URL, "https://app.frameleads.io/login?source=whop-checkout");
});

test("production native form keeps its exact plan gate and existing hosted fallback", () => {
  assert.deepEqual(embeddedCheckoutPolicy("core", {}), { available: false, reason: "preview_only" });
  const enabled = { FRAMELEADS_WHOP_NATIVE_CHECKOUT_ENABLED: "true", WHOP_ENVIRONMENT: "production", VERCEL_ENV: "production", FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED: "true", WHOP_MICRO_PLAN_ID: "plan_8qLWfJZHQUYZf", WHOP_CORE_PLAN_ID: "plan_GQTDPXnvijugf", WHOP_ENTERPRISE_PLAN_ID: "plan_uGDGf5WKW7hlE" };
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, FRAMELEADS_WHOP_NATIVE_CHECKOUT_ENABLED: undefined }), {
    available: false, reason: "disabled", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED: undefined }), {
    available: false, reason: "terms_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, WHOP_CORE_PLAN_ID: "plan_wrong" }), {
    available: false, reason: "plan_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", enabled), { available: true, environment: "production", planId: "plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL, hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf" });
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).available, true);
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).planId, "plan_uGDGf5WKW7hlE");
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).hostedFallback, "https://whop.com/checkout/plan_uGDGf5WKW7hlE");
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", enabled), { available: true, environment: "production", planId: "plan_8qLWfJZHQUYZf", returnUrl: WHOP_CHECKOUT_RETURN_URL, hostedFallback: "https://whop.com/checkout/plan_8qLWfJZHQUYZf" });
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...enabled, WHOP_MICRO_PLAN_ID: "plan_other" }), {
    available: false, reason: "plan_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_8qLWfJZHQUYZf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, WHOP_ENVIRONMENT: "sandbox" }), { available: false, reason: "wrong_environment" });
});

test("Preview Sandbox requires its own company, all tier plans, safe hosted URLs and SaaS Preview return", () => {
  const sandbox = {
    VERCEL_ENV: "preview",
    WHOP_ENVIRONMENT: "sandbox",
    FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED: "true",
    FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "true",
    WHOP_SANDBOX_COMPANY_ID: "biz_SandboxTest",
    FRAMELEADS_WHOP_SANDBOX_RETURN_URL: "https://frameleads-git-checkout-preview.vercel.app/login?source=whop-checkout",
    WHOP_MICRO_SANDBOX_PLAN_ID: "plan_sandboxMicro",
    WHOP_CORE_SANDBOX_PLAN_ID: "plan_sandboxCore",
    WHOP_ENTERPRISE_SANDBOX_PLAN_ID: "plan_sandboxEnterprise",
    WHOP_MICRO_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxMicro",
    WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxCore",
    WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxEnterprise",
  };
  for (const [tier, key, id, url] of [
    ["micro-pilot", "WHOP_MICRO_SANDBOX_PLAN_ID", "plan_sandboxMicro", "https://whop.com/checkout/plan_sandboxMicro"],
    ["core", "WHOP_CORE_SANDBOX_PLAN_ID", "plan_sandboxCore", "https://whop.com/checkout/plan_sandboxCore"],
    ["enterprise", "WHOP_ENTERPRISE_SANDBOX_PLAN_ID", "plan_sandboxEnterprise", "https://whop.com/checkout/plan_sandboxEnterprise"],
  ] as const) {
    const info = embeddedCheckoutPolicy(tier, sandbox);
    assert.deepEqual(info, {
      available: true,
      environment: "sandbox",
      planId: id,
      hostedFallback: url,
      returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
    });
    assert.equal(info.hostedFallback?.includes(tierInformation(tier).productionPlanId), false);
    assert.equal(sandbox[key], id);
  }
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...sandbox, WHOP_MICRO_SANDBOX_CHECKOUT_URL: undefined }), {
    available: false, reason: "sandbox_unconfigured", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  for (const [tier, key] of [
    ["micro-pilot", "WHOP_MICRO_SANDBOX_CHECKOUT_URL"],
    ["core", "WHOP_CORE_SANDBOX_CHECKOUT_URL"],
    ["enterprise", "WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL"],
  ] as const) {
    const missing = { ...sandbox, [key]: undefined };
    assert.equal(embeddedCheckoutPolicy(tier, missing).available, false, `${tier} fails closed when any tier Sandbox link is missing`);
    assert.equal(embeddedCheckoutPolicy(tier, missing).hostedFallback, undefined);
  }
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...sandbox, FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "false" }), {
    available: false, reason: "sandbox_terms_unverified", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  for (const badReturn of [WHOP_CHECKOUT_RETURN_URL, "http://frameleads-git-checkout-preview.vercel.app/login?source=whop-checkout", "https://frameleads-git-checkout-preview.vercel.app/login"]) {
    assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, FRAMELEADS_WHOP_SANDBOX_RETURN_URL: badReturn }), {
      available: false, reason: "sandbox_unconfigured", environment: "sandbox",
    });
  }
  for (const retiredPlanId of ["plan_sAEhr77rTrhX4", "plan_jdy5Z44fMKMAz", "plan_GQTDPXnvijugf", "plan_uGDGf5WKW7hlE"]) {
    assert.equal(embeddedCheckoutPolicy("core", {
      ...sandbox,
      WHOP_CORE_SANDBOX_PLAN_ID: retiredPlanId,
      WHOP_CORE_SANDBOX_CHECKOUT_URL: `https://whop.com/checkout/${retiredPlanId}`,
    }).available, false, `production or retired plan ${retiredPlanId} cannot be used in Sandbox`);
  }
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://example.com/checkout/plan_sandboxCore" }), {
    available: false, reason: "sandbox_unconfigured", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  assert.equal(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_ENTERPRISE_SANDBOX_PLAN_ID: "plan_sandboxCore" }).available, false, "Sandbox plans must be distinct across tiers");
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, VERCEL_ENV: "production" }), { available: false, reason: "wrong_environment" });
});

test("affiliate referral is kept on Whop hosted checkout only with advertising consent", () => {
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: null, storedReferralPresent: false }), "pending");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: false, storedReferralPresent: false }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: true, storedReferralPresent: false }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: false, advertisingConsent: true, storedReferralPresent: true }), "hosted");
  assert.equal(hostedCheckoutWithAffiliate("https://whop.com/checkout/plan_example", "affiliate_12", true), "https://whop.com/checkout/plan_example?a=affiliate_12");
  assert.equal(hostedCheckoutWithAffiliate("https://whop.com/checkout/plan_example", "affiliate_12", false), "https://whop.com/checkout/plan_example");
  assert.equal(hostedCheckoutWithAffiliate("https://whop.com/checkout/plan_example", "bad code", true), "https://whop.com/checkout/plan_example");
});

test("native form uses Whop fields and contains no custom payment or ledger route", () => {
  const component = fs.readFileSync(new URL("../src/components/EmbeddedWhopCheckout.tsx", import.meta.url), "utf8");
  const page = fs.readFileSync(new URL("../src/app/checkout/[plan]/page.tsx", import.meta.url), "utf8");
  assert.match(component, /data-whop-checkout-plan-id=\{planId\}/);
  assert.match(component, /data-whop-checkout-environment=\{environment\}/);
  assert.match(component, /data-whop-checkout-return-url=\{returnUrl\}/);
  assert.match(component, /if \(!hostedFallback\)/);
  assert.match(component, /observeMeasurement\("CHECKOUT_CLICK"\)/);
  assert.doesNotMatch(component, /track\(\s*["']purchase/i);
  assert.doesNotMatch(component, /data-whop-affiliate\s*=/);
  assert.doesNotMatch(page, /brand.?brain|checkout\/continue|receipt|ledger/i);
  assert.match(page, /hostedFallback=\{config\.hostedFallback \?\? ""\}/);
  assert.match(page, /environment=\{config\.environment \?\? "sandbox"\}/);
  assert.match(page, /embedEnabled=\{config\.available\}/);
  assert.doesNotMatch(component, /data-whop-checkout-(?:billing-interval|recurring)/);
});

test("homepage pricing cards lead through the approved V3 checkout page", () => {
  const page = fs.readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /href="\/checkout\/core"/);
  assert.match(page, /href="\/checkout\/enterprise"/);
  assert.match(fs.readFileSync(new URL("../src/components/ExitIntentPopup.tsx", import.meta.url), "utf8"), /href=\{MICRO_PILOT_URL\}/);
  assert.doesNotMatch(page, /href="https:\/\/whop\.com\/checkout\/plan_(?:sAEhr77rTrhX4|jdy5Z44fMKMAz)"/);
});

test("Micro-Pilot keeps its existing hosted checkout entry and offer unchanged", () => {
  const popup = fs.readFileSync(new URL("../src/components/ExitIntentPopup.tsx", import.meta.url), "utf8");
  assert.match(popup, /\/checkout\/micro-pilot/);
  assert.match(popup, /25 TOTAL PROSPECTS/);
  assert.doesNotMatch(popup, /25 PROSPECTS \/ MONTH/);
  assert.match(popup, /\$10 ONE-TIME/);
  assert.match(popup, /Run the Micro-Pilot — \$10/);
  assert.equal(tierInformation("micro-pilot").hostedCheckout, "https://whop.com/checkout/plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").recurring, false);
});
