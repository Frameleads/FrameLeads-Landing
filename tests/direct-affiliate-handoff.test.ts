import assert from "node:assert/strict";
import test from "node:test";
import { prepareDirectAffiliateHandoff } from "../src/direct-affiliate-handoff.ts";
import { nativeAffiliateEmbedEnabled, readAffiliateNativeSession } from "../src/affiliate-native-session.ts";

const time = Date.UTC(2026, 9, 29, 10, 0, 0);
const data = {
  affiliateLinked: true,
  planId: "plan_kgrX8LpuAH2Ba",
  environment: "sandbox",
  purchaseUrl: "https://sandbox.whop.com/checkout/ch_sandboxProof/",
  attemptId: "11111111-1111-4111-8111-111111111111",
  embeddedSessionId: "ch_sandboxProof",
};
const config = {
  FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED: "true",
  FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED: "true",
  AFFILIATE_REFERRAL_PRIVACY_APPROVED: "true",
  AFFILIATE_CONSENT_EVIDENCE_ENABLED: "true",
  WHOP_AFFILIATE_CHECKOUT_ENABLED: "true",
  VERCEL_ENV: "preview",
  WHOP_ENVIRONMENT: "sandbox",
  FRAMELEADS_AFFILIATE_NATIVE_COOKIE_KEY: "a".repeat(64),
};

test("a server-verified direct buyer receives a native Core checkout without any Audit flag", () => {
  assert.equal(nativeAffiliateEmbedEnabled(config), true);
  const handoff = prepareDirectAffiliateHandoff(data, config, time);
  assert.ok(handoff);
  assert.equal(handoff.redirectPath, "/checkout/affiliate/core");
  assert.equal(handoff.verifiedFallbackUrl, data.purchaseUrl);
  assert.deepEqual(readAffiliateNativeSession(handoff.cookieValue, config.FRAMELEADS_AFFILIATE_NATIVE_COOKIE_KEY, time + 1000), {
    version: 1, offer: "CORE", environment: "sandbox",
    planId: data.planId, checkoutConfigurationId: data.embeddedSessionId,
    hostedFallback: data.purchaseUrl, issuedAt: time, expiresAt: time + 600_000,
  });
  assert.equal(handoff.cookieValue.includes(data.attemptId), false);
});

test("no consent or feature flag means no native checkout or attempt", () => {
  assert.equal(prepareDirectAffiliateHandoff(data, {}, time), null);
  for (const flag of [
    "FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED",
    "FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED",
    "AFFILIATE_REFERRAL_PRIVACY_APPROVED",
    "AFFILIATE_CONSENT_EVIDENCE_ENABLED",
    "WHOP_AFFILIATE_CHECKOUT_ENABLED",
  ]) {
    assert.equal(prepareDirectAffiliateHandoff(data, { ...config, [flag]: "false" }, time), null, flag);
  }
  assert.equal(prepareDirectAffiliateHandoff(data, { ...config, VERCEL_ENV: "production" }, time), null);
  assert.equal(prepareDirectAffiliateHandoff(data, { ...config, WHOP_ENVIRONMENT: "production" }, time), null);
});

test("different plan, merchant environment, configuration, URL or attempt cannot cross the trust boundary", () => {
  const invalid = [
    { affiliateLinked: false },
    { affiliateLinked: "true" },
    { planId: "plan_GQTDPXnvijugf" },
    { planId: "plan_other" },
    { environment: "production" },
    { embeddedSessionId: "plan_kgrX8LpuAH2Ba" },
    { embeddedSessionId: "ch_other" },
    { purchaseUrl: "https://sandbox.whop.com/checkout/ch_other/" },
    { purchaseUrl: "https://whop.com/checkout/ch_sandboxProof/" },
    { purchaseUrl: "https://sandbox.whop.com/checkout/ch_sandboxProof/?a=ref" },
    { purchaseUrl: "https://sandbox.whop.com.evil.test/checkout/ch_sandboxProof/" },
    { purchaseUrl: "http://sandbox.whop.com/checkout/ch_sandboxProof/" },
    { attemptId: "not-a-uuid" },
    { attemptId: "11111111-1111-1111-1111-111111111111" },
  ];
  for (const values of invalid) {
    assert.equal(prepareDirectAffiliateHandoff({ ...data, ...values }, config, time), null, JSON.stringify(values));
  }
  assert.equal(prepareDirectAffiliateHandoff({ ...data, affiliateCode: "partner" }, config, time), null);
  assert.equal(prepareDirectAffiliateHandoff({ ...data, email: "buyer@example.test" }, config, time), null);
});
