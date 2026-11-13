import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { embeddedCheckoutPolicy } from "../src/checkout-embed-policy.ts";

const values = Object.freeze({
  VERCEL_ENV: "preview",
  WHOP_ENVIRONMENT: "sandbox",
  WHOP_SANDBOX_COMPANY_ID: "biz_6YudF3G7nc8Wdw",
  WHOP_CORE_SANDBOX_PLAN_ID: "plan_kgrX8LpuAH2Ba",
  WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_kgrX8LpuAH2Ba",
  FRAMELEADS_WHOP_SANDBOX_RETURN_URL:
    "https://frameleads-landing-example-frameleads.vercel.app/login?source=whop-checkout",
  FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "true",
  FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED: "true",
  FRAMELEADS_WHOP_SANDBOX_CORE_ONLY_TEST_ENABLED: "true",
});

test("only the approved $5 Core Sandbox plan is enabled with explicit Preview-only safeguards", () => {
  const core = embeddedCheckoutPolicy("core", values);
  assert.equal(core.available, true);
  assert.equal(core.environment, "sandbox");
  assert.equal(core.planId, values.WHOP_CORE_SANDBOX_PLAN_ID);
  assert.equal(core.hostedFallback, values.WHOP_CORE_SANDBOX_CHECKOUT_URL);
  assert.equal(core.returnUrl, values.FRAMELEADS_WHOP_SANDBOX_RETURN_URL);
  for (const tier of ["micro-pilot", "enterprise"] as const) {
    const unavailable = embeddedCheckoutPolicy(tier, values);
    assert.equal(unavailable.available, false);
    assert.equal(unavailable.reason, "sandbox_unconfigured");
    assert.equal(unavailable.hostedFallback, undefined);
  }
});

test("test flag can never authorize production Checkout even with Preview-looking values", () => {
  for (const v of [
    { ...values, VERCEL_ENV: "production" },
    { ...values, VERCEL_ENV: "development" },
    { ...values, VERCEL_ENV: undefined },
  ]) {
    assert.equal(embeddedCheckoutPolicy("core", v).available, false);
  }
});

test("Core Sandbox refuses an unapproved plan, production plan or non-sandbox checkout", () => {
  for (const patch of [
    { WHOP_CORE_SANDBOX_PLAN_ID: "plan_GQTDPXnvijugf" },
    { WHOP_CORE_SANDBOX_PLAN_ID: "plan_OLD_SANDBOX_TEST" },
    { WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_kgrX8LpuAH2Ba" },
    { WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_GQTDPXnvijugf" },
    { WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://sandbox.whop.com/checkout/plan_kgrX8LpuAH2Ba?promo=1" },
    { WHOP_SANDBOX_COMPANY_ID: "biz_WrongMerchant" },
    { WHOP_ENVIRONMENT: "production" },
    { FRAMELEADS_WHOP_SANDBOX_RETURN_URL: "https://frameleads.io/login?source=whop-checkout" },
    { FRAMELEADS_WHOP_SANDBOX_RETURN_URL: "https://other-site.vercel.app/login?source=whop-checkout" },
  ]) {
    assert.equal(embeddedCheckoutPolicy("core", { ...values, ...patch }).available, false, JSON.stringify(patch));
  }
});

test("Core Sandbox does not open without independent enable and terms approval", () => {
  assert.equal(embeddedCheckoutPolicy("core", { ...values, FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED: "false" }).available, false);
  assert.equal(embeddedCheckoutPolicy("core", { ...values, FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "false" }).available, false);
  assert.equal(embeddedCheckoutPolicy("core", { ...values, FRAMELEADS_WHOP_SANDBOX_CORE_ONLY_TEST_ENABLED: "false" }).available, false);
});

test("preview labels the test price and never grants access from its return route", () => {
  const summary = readFileSync("src/components/CheckoutOrderSummary.tsx", "utf8");
  const returnPage = readFileSync("src/app/login/page.tsx", "utf8");
  const checkout = readFileSync("src/app/checkout/[plan]/page.tsx", "utf8");
  assert.ok(summary.includes('sandboxCoreTest ? "$5" : details.displayedPrice'));
  assert.ok(summary.includes('Sandbox test only — not a production purchase'));
  assert.ok(checkout.includes('sandboxCoreTest={sandboxCoreTest}'));
  assert.ok(returnPage.includes('process.env.VERCEL_ENV !== "preview"'));
  assert.ok(returnPage.includes('No production account access is granted here.'));
  assert.doesNotMatch(returnPage, /grantEntitlement|createMembership|paymentSucceeded|track\(["']Purchase/);
});
