import assert from "node:assert/strict";
import test from "node:test";
import { auditContinuationBridgeEnabled, brandBrainIngestUrl, CHECKOUT_SESSION_COOKIE_NAME, validateCheckoutReturn } from "../src/affiliate-checkout-return.ts";

const attemptId = "11111111-1111-4111-8111-111111111111";
const normal = { environment: "production", planId: "plan_GQTDPXnvijugf",
  purchaseUrl: "https://frameleads.io/checkout/core", affiliateLinked: false };
const verified = { ...normal, purchaseUrl: "https://whop.com/checkout/ch_verifiedConfiguration/",
  affiliateLinked: true, attemptId };

test("nonaffiliate CORE and ENTERPRISE continuation targets current FrameLeads native checkout", () => {
  assert.deepEqual(validateCheckoutReturn(normal, "CORE", "production"), { url: normal.purchaseUrl, affiliateLinked: false });
  assert.deepEqual(validateCheckoutReturn({ ...normal, planId: "plan_uGDGf5WKW7hlE",
    purchaseUrl: "https://frameleads.io/checkout/enterprise" }, "ENTERPRISE", "production"),
    { url: "https://frameleads.io/checkout/enterprise", affiliateLinked: false });
});
test("trusted provider-created affiliate checkout configuration is the only payable external redirect", () => {
  assert.deepEqual(validateCheckoutReturn(verified, "CORE", "production"),
    { url: verified.purchaseUrl, affiliateLinked: true });
  for (const url of [
    "https://whop.com/checkout/plan_GQTDPXnvijugf", "https://whop.com/checkout/ch_verifiedConfiguration/?a=partner",
    "https://evil.com/checkout/ch_verifiedConfiguration", "http://whop.com/checkout/ch_verifiedConfiguration",
    "https://whop.com.evil.test/checkout/ch_verifiedConfiguration", "https://whop.com@evil.test/checkout/ch_verifiedConfiguration",
    "https://whop.com/checkout/ch_verifiedConfiguration#ref", "https://frameleads.io/checkout/core",
  ]) assert.equal(validateCheckoutReturn({ ...verified, purchaseUrl: url }, "CORE", "production"), null, url);
  assert.equal(validateCheckoutReturn({ ...verified, attemptId: undefined }, "CORE", "production"), null);
  assert.equal(validateCheckoutReturn({ ...verified, affiliateLinked: "true" }, "CORE", "production"), null);
});
test("invalid environments, wrong plans, stale plan IDs and query-based grants fail closed", () => {
  const invalid = [
    { ...normal, planId: "plan_sAEhr77rTrhX4" },
    { ...normal, planId: "plan_uGDGf5WKW7hlE" },
    { ...normal, purchaseUrl: "https://frameleads.io/checkout/core?a=partner" },
    { ...normal, purchaseUrl: "https://www.frameleads.io/checkout/core" },
    { ...normal, purchaseUrl: "https://whop.com/checkout/plan_GQTDPXnvijugf" },
    { ...normal, environment: "sandbox" },
  ];
  for (const value of invalid) assert.equal(validateCheckoutReturn(value, "CORE", "production"), null);
});
test("sandbox is strictly isolated from production and requires explicitly configured sandbox plan", () => {
  const data = { environment: "sandbox", planId: "plan_kgrX8LpuAH2Ba",
    purchaseUrl: "https://sandbox.whop.com/checkout/ch_sandbox/", affiliateLinked: false };
  assert.deepEqual(validateCheckoutReturn(data, "CORE", "sandbox", "plan_kgrX8LpuAH2Ba"),
    { url: data.purchaseUrl, affiliateLinked: false });
  assert.equal(validateCheckoutReturn(data, "CORE", "sandbox"), null);
  assert.equal(validateCheckoutReturn({ ...data, purchaseUrl: "https://whop.com/checkout/ch_sandbox/" }, "CORE", "sandbox", "plan_kgrX8LpuAH2Ba"), null);
  assert.equal(validateCheckoutReturn(data, "ENTERPRISE", "sandbox", "plan_kgrX8LpuAH2Ba"), null);
});
test("Bridge is off by default and cannot cross Preview/Sandbox or Production/Live", () => {
  assert.equal(auditContinuationBridgeEnabled({}), false);
  const enabled = { FRAMELEADS_AFFILIATE_CONTINUATION_BRIDGE_ENABLED: "true",
    AUDIT_CHECKOUT_CONTINUATION_ENABLED: "true", VERCEL_ENV: "preview", WHOP_ENVIRONMENT: "sandbox" };
  assert.equal(auditContinuationBridgeEnabled(enabled), true);
  assert.equal(auditContinuationBridgeEnabled({ ...enabled, WHOP_ENVIRONMENT: "production" }), false);
  assert.equal(auditContinuationBridgeEnabled({ ...enabled, AUDIT_CHECKOUT_CONTINUATION_ENABLED: "false" }), false);
  assert.equal(auditContinuationBridgeEnabled({ ...enabled, VERCEL_ENV: "production", WHOP_ENVIRONMENT: "production" }), true);
});
test("Only exact trusted endpoint and long secret are accepted", () => {
  const secret = "x".repeat(32);
  assert.equal(brandBrainIngestUrl("https://brain.example.com/api/marketing/audit-lead/ingest", secret)?.pathname,
    "/api/marketing/audit-lead/ingest");
  for (const raw of ["http://brain.example.com/api/marketing/audit-lead/ingest",
    "https://brain.example.com/api/marketing/checkout/initialize",
    "https://brain.example.com/api/marketing/audit-lead/ingest?x=1",
    "https://name:pass@brain.example.com/api/marketing/audit-lead/ingest"])
    assert.equal(brandBrainIngestUrl(raw, secret), null);
  assert.equal(brandBrainIngestUrl("https://brain.example.com/api/marketing/audit-lead/ingest", "short"), null);
  assert.match(CHECKOUT_SESSION_COOKIE_NAME, /^__Host-/);
});
