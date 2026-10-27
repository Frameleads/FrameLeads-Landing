import assert from "node:assert/strict";
import { test } from "node:test";
import { embeddedCheckoutPolicy } from "../src/checkout-embed-policy.ts";

const preview = {
  VERCEL_ENV: "preview",
  WHOP_ENVIRONMENT: "sandbox",
  WHOP_SANDBOX_COMPANY_ID: "biz_SandboxCompany",
  FRAMELEADS_WHOP_SANDBOX_RETURN_URL: "https://frameleads-git-checkout-preview.vercel.app/login?source=whop-checkout",
  WHOP_MICRO_SANDBOX_PLAN_ID: "plan_sandboxMicro",
  WHOP_CORE_SANDBOX_PLAN_ID: "plan_sandboxCore",
  WHOP_ENTERPRISE_SANDBOX_PLAN_ID: "plan_sandboxEnterprise",
  WHOP_MICRO_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_sandboxMicro",
  WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_sandboxCore",
  WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_sandboxEnterprise",
  FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "true",
  FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED: "false",
} as const;
test("verified Sandbox plans retain provider-hosted fallback when embedding is disabled", () => {
  for (const [tier, planId] of [
    ["micro-pilot", "plan_sandboxMicro"],
    ["core", "plan_sandboxCore"],
    ["enterprise", "plan_sandboxEnterprise"],
  ] as const) {
    const policy = embeddedCheckoutPolicy(tier, preview);
    assert.equal(policy.available, false);
    assert.equal(policy.reason, "disabled");
    assert.equal(policy.planId, undefined);
    assert.equal(policy.hostedFallback, "https://sandbox.whop.com/checkout/" + planId);
  }
});
test("unverified and missing Sandbox settings cannot expose hosted payment fallback", () => {
  assert.equal(embeddedCheckoutPolicy("micro-pilot", {
    ...preview, FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "false"
  }).hostedFallback, undefined);
  assert.equal(embeddedCheckoutPolicy("core", {
    ...preview, WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL: undefined
  }).hostedFallback, undefined);
  assert.equal(embeddedCheckoutPolicy("enterprise", {
    ...preview, VERCEL_ENV: "production"
  }).hostedFallback, undefined);
});
