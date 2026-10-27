import assert from "node:assert/strict";
import test from "node:test";
import { AFFILIATE_NATIVE_COOKIE, nativeAffiliateEmbedEnabled, readAffiliateNativeSession, sealAffiliateNativeSession } from "../src/affiliate-native-session.ts";

const key = "a".repeat(64);
const data = { offer: "CORE" as const, environment: "sandbox" as const,
  planId: "plan_sandboxCore", checkoutConfigurationId: "ch_validSession",
  hostedFallback: "https://sandbox.whop.com/checkout/ch_validSession/" };
const timestamp = Date.UTC(2026, 9, 27, 19, 0);
test("AES-GCM affiliate cookie round-trips only the server-issued provider session", () => {
  const token = sealAffiliateNativeSession(data, key, timestamp);
  assert.ok(token && token.startsWith("v1."));
  assert.deepEqual(readAffiliateNativeSession(token, key, timestamp+1000), {
    ...data, version: 1, issuedAt: timestamp, expiresAt: timestamp+600_000,
  });
  assert.equal(token.includes("partner_alpha"), false);
  assert.match(AFFILIATE_NATIVE_COOKIE, /^__Host-/);
});
test("Tampered, wrong-key, expired, unsupported, or provider-open-redirect cookie fails closed", () => {
  const token = sealAffiliateNativeSession(data, key, timestamp)!;
  assert.equal(readAffiliateNativeSession(token+"extra", key, timestamp), null);
  assert.equal(readAffiliateNativeSession(token, "b".repeat(64), timestamp), null);
  assert.equal(readAffiliateNativeSession(token, key, timestamp+600_000), null);
  assert.equal(readAffiliateNativeSession(token, key, timestamp-1), null);
  assert.equal(sealAffiliateNativeSession({ ...data, hostedFallback: "https://whop.com/checkout/ch_validSession" }, key, timestamp), null);
  assert.equal(sealAffiliateNativeSession({ ...data, hostedFallback: "https://sandbox.whop.com/checkout/ch_validSession/?a=x" }, key, timestamp), null);
  assert.equal(sealAffiliateNativeSession({ ...data, checkoutConfigurationId: "plan_untrusted" }, key, timestamp), null);
  assert.equal(sealAffiliateNativeSession(data, "weak", timestamp), null);
  assert.equal(readAffiliateNativeSession("invalid", key, timestamp), null);
});
test("Native affiliate session bridge stays disabled across mismatched environments and default-off flags", () => {
  assert.equal(nativeAffiliateEmbedEnabled({}), false);
  const sandbox = { FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED: "true",
    FRAMELEADS_AFFILIATE_CONTINUATION_BRIDGE_ENABLED: "true",
    AUDIT_CHECKOUT_CONTINUATION_ENABLED: "true", VERCEL_ENV: "preview", WHOP_ENVIRONMENT: "sandbox" };
  assert.equal(nativeAffiliateEmbedEnabled(sandbox), true);
  assert.equal(nativeAffiliateEmbedEnabled({ ...sandbox, VERCEL_ENV: "production" }), false);
  assert.equal(nativeAffiliateEmbedEnabled({ ...sandbox, WHOP_ENVIRONMENT: "production" }), false);
  assert.equal(nativeAffiliateEmbedEnabled({ ...sandbox, FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED: "false" }), false);
});
