import assert from "node:assert/strict";
import test from "node:test";
import {
  DIRECT_AFFILIATE_ACTOR_COOKIE, directConsentBrowserGate,
  directInitializeBrowserGate, parseDirectConsentRequest, validateDirectBrowserOrigin,
} from "../src/direct-affiliate-actor.ts";
import {
  issueDirectActorSession, readDirectActorSession, directActorCookieHeader,
} from "../src/direct-affiliate-actor-session.ts";

const now = 1793300000;
const signingKey = "c".repeat(64);
const config = {
  VERCEL_ENV: "preview",
  WHOP_ENVIRONMENT: "sandbox",
  FRAMELEADS_DIRECT_AFFILIATE_CONSENT_ENDPOINT_ENABLED: "true",
  FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED: "true",
  FRAMELEADS_DIRECT_AFFILIATE_RATE_LIMIT_APPROVED: "true",
  FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED: "true",
  AFFILIATE_REFERRAL_PRIVACY_APPROVED: "true",
  AFFILIATE_CONSENT_EVIDENCE_ENABLED: "true",
  WHOP_AFFILIATE_CHECKOUT_ENABLED: "true",
};
test("partner opt-in is a separate explicit action, never an advertising boolean", () => {
  assert.deepEqual(parseDirectConsentRequest({ action: "accept", affiliateCode: "partner_A" }),
    { action: "accept", affiliateCode: "partner_A" });
  assert.deepEqual(parseDirectConsentRequest({ action: "withdraw" }), { action: "withdraw" });
  for (const input of [
    { advertising: true }, { action: "accept" }, { action: "accept", affiliateCode: "?a=code" },
    { action: "accept", affiliateCode: "a", analytics: true },
    { action: "withdraw", affiliateCode: "a" }, { action: "reject" }, null,
  ]) assert.equal(parseDirectConsentRequest(input), null);
});

test("browser route requires an exact same-origin HTTPS POST with a non-simple header", () => {
  assert.equal(validateDirectBrowserOrigin("https://frameleads.io/api/affiliate/direct/consent",
    "https://frameleads.io", "same-origin", "affiliate-direct-v1"), true);
  for (const [url, origin, site, intent] of [
    ["https://frameleads.io/api/affiliate/direct/consent", "https://evil.test", "cross-site", "affiliate-direct-v1"],
    ["http://frameleads.io/api/affiliate/direct/consent", "http://frameleads.io", "same-origin", "affiliate-direct-v1"],
    ["https://frameleads.io/api/affiliate/direct/consent", "https://frameleads.io", "same-site", "affiliate-direct-v1"],
    ["https://frameleads.io/api/affiliate/direct/consent", "https://frameleads.io", "same-origin", null],
  ] as const) assert.equal(validateDirectBrowserOrigin(url, origin, site, intent), false);
});

test("signed actor cookie cannot be forged or replayed after expiry", () => {
  const actor = issueDirectActorSession(signingKey, now);
  assert.ok(actor);
  assert.equal(actor.actorScopeHash.length, 64);
  assert.equal(readDirectActorSession(actor.cookieValue, signingKey, now+20)?.actorScopeHash, actor.actorScopeHash);
  assert.equal(readDirectActorSession(actor.cookieValue, signingKey, now+3600), null);
  assert.equal(readDirectActorSession(actor.cookieValue, "d".repeat(64), now+1), null);
  assert.equal(readDirectActorSession(actor.cookieValue+"a", signingKey, now+1), null);
  assert.equal(readDirectActorSession(actor.cookieValue, signingKey, now-1), null);
  assert.equal(issueDirectActorSession("weak", now), null);
  assert.match(DIRECT_AFFILIATE_ACTOR_COOKIE, /^__Host-/);
  const header = directActorCookieHeader(actor.cookieValue);
  assert.match(header, /HttpOnly; Secure; SameSite=Strict/);
  assert.doesNotMatch(header, /Domain=/);
});

test("direct initialization does not require an Audit and cannot work when consent/anti-abuse gates are missing", () => {
  assert.equal(directConsentBrowserGate({}), false);
  assert.equal(directInitializeBrowserGate(config), true);
  for (const key of [
    "FRAMELEADS_DIRECT_AFFILIATE_CONSENT_ENDPOINT_ENABLED",
    "FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED",
    "FRAMELEADS_DIRECT_AFFILIATE_RATE_LIMIT_APPROVED",
    "FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED",
    "AFFILIATE_REFERRAL_PRIVACY_APPROVED",
    "AFFILIATE_CONSENT_EVIDENCE_ENABLED",
    "WHOP_AFFILIATE_CHECKOUT_ENABLED",
  ]) assert.equal(directInitializeBrowserGate({ ...config, [key]: undefined }), false, key);
  assert.equal(directInitializeBrowserGate({ ...config, VERCEL_ENV: "production" }), false);
  assert.equal(directInitializeBrowserGate({ ...config, WHOP_ENVIRONMENT: "production" }), false);
});
