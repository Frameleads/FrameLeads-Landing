import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { checkoutTier, embeddedCheckoutPolicy, tierInformation, WHOP_EMBED_LOADER } from "../src/checkout-embed-policy.ts";

const sandbox = {
  FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED: "true",
  WHOP_ENVIRONMENT: "sandbox",
  VERCEL_ENV: "preview",
  WHOP_SANDBOX_CORE_PLAN_ID: "plan_kgrX8LpuAH2Ba",
  WHOP_SANDBOX_ACCOUNT_ID: "biz_6YudF3G7nc8Wdw",
  WHOP_SANDBOX_PRODUCT_ID: "prod_2RDEl6d8jhM9W",
  WHOP_SANDBOX_RETURN_URL: "https://preview-checkout.example/checkout/complete",
};

test("supports only the two approved FrameLeads tiers", () => {
  assert.equal(checkoutTier("core"), true);
  assert.equal(checkoutTier("enterprise"), true);
  assert.equal(checkoutTier("anything-else"), false);
  assert.equal(tierInformation("core").productionPlanId, "plan_sAEhr77rTrhX4");
  assert.equal(tierInformation("enterprise").productionPlanId, "plan_jdy5Z44fMKMAz");
});

test("Whop native loader is pinned to the documented provider origin", () => {
  assert.equal(WHOP_EMBED_LOADER, "https://js.whop.com/static/checkout/loader.js");
});

test("disabled by default; never enables production payments", () => {
  assert.deepEqual(embeddedCheckoutPolicy("core", {}), { available: false, reason: "disabled" });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, VERCEL_ENV: "production" }), { available: false, reason: "production_not_approved" });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_ENVIRONMENT: "production" }), { available: false, reason: "wrong_environment" });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_ENVIRONMENT: undefined }), { available: false, reason: "wrong_environment" });
});

test("Sandbox Core uses only established disposable identities", () => {
  const value = embeddedCheckoutPolicy("core", sandbox);
  assert.equal(value.available, true);
  if (value.available) {
    assert.equal(value.planId, "plan_kgrX8LpuAH2Ba");
    assert.equal(value.environment, "sandbox");
    assert.equal(value.hostedFallback, null);
    assert.equal(value.returnUrl, sandbox.WHOP_SANDBOX_RETURN_URL);
  }
  assert.deepEqual(embeddedCheckoutPolicy("enterprise", sandbox), { available: false, reason: "sandbox_plan_missing" });
});

test("fails closed on mismatched account/plan and unsafe sandbox returns", () => {
  for (const change of [
    { WHOP_SANDBOX_CORE_PLAN_ID: "plan_sAEhr77rTrhX4" },
    { WHOP_SANDBOX_ACCOUNT_ID: "biz_WRONG" },
    { WHOP_SANDBOX_PRODUCT_ID: "prod_WRONG" },
    { WHOP_SANDBOX_RETURN_URL: "https://frameleads.io/checkout/complete" },
    { WHOP_SANDBOX_RETURN_URL: "https://fake.example/checkout/complete?token=bad" },
    { WHOP_SANDBOX_RETURN_URL: "http://fake.example/checkout/complete" },
  ]) assert.equal(embeddedCheckoutPolicy("core", { ...sandbox, ...change }).available, false);
});

test("embedded component contains no browser-provided payable affiliate or purchase signal", () => {
  const component = fs.readFileSync(new URL("../src/components/EmbeddedWhopCheckout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(component, /data-whop-affiliate\s*=/);
  assert.doesNotMatch(component, /track\(\s*["']purchase/i);
  assert.match(component, /getPrivacyConsent/);
  assert.match(component, /observeMeasurement\("CHECKOUT_INITIATED"\)/);
});
