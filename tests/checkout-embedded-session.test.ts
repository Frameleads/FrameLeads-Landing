import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  EMBED_SESSION_COOKIE_NAME, EMBED_SESSION_TTL_SECONDS,
  embeddedSessionBridgeEnabled, isProviderSessionId,
  readVerifiedEmbedSession, sameOriginCheckoutPost, sealVerifiedEmbedSession,
} from "../src/checkout-embedded-session.ts";

const secret = "a".repeat(64);
const now = Date.UTC(2026, 9, 22, 16, 0, 0);
const sandbox = {
  FRAMELEADS_EMBED_SESSION_BRIDGE_ENABLED: "true",
  FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED: "true",
  VERCEL_ENV: "preview",
  WHOP_ENVIRONMENT: "sandbox",
};

test("session bridge requires an explicitly enabled, Sandbox-only preview", () => {
  assert.equal(embeddedSessionBridgeEnabled(sandbox), true);
  for (const env of [
    {}, { ...sandbox, FRAMELEADS_EMBED_SESSION_BRIDGE_ENABLED: undefined },
    { ...sandbox, FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED: "false" },
    { ...sandbox, VERCEL_ENV: "production" },
    { ...sandbox, VERCEL_ENV: "development" },
    { ...sandbox, VERCEL_ENV: undefined },
    { ...sandbox, WHOP_ENVIRONMENT: "production" },
  ]) assert.equal(embeddedSessionBridgeEnabled(env), false);
});

test("provider checkout IDs are not raw plan IDs or browser supplied affiliate codes", () => {
  assert.equal(isProviderSessionId("ch_Sandbox1234"), true);
  for (const value of [
    undefined, null, "", "ch_x", "plan_kgrX8LpuAH2Ba", "ch_abc/../bad",
    "ch_bad?affiliate=other", "ch_" + "z".repeat(121),
  ]) assert.equal(isProviderSessionId(value), false);
});

test("server-sealed capability preserves exact Whop session and tier for ten minutes", () => {
  const sealed = sealVerifiedEmbedSession("ch_Sandbox1234", "core", secret, now);
  assert.ok(sealed);
  assert.equal(EMBED_SESSION_COOKIE_NAME, "__Host-frameleads-embedded-session");
  assert.equal(EMBED_SESSION_TTL_SECONDS, 600);
  assert.deepEqual(readVerifiedEmbedSession(sealed, "core", secret, now + 599_000), {
    sessionId: "ch_Sandbox1234", tier: "core",
    expiresAt: Math.floor(now / 1000) + 600,
  });
  assert.equal(readVerifiedEmbedSession(sealed, "core", secret, now + 600_000), null);
  assert.equal(readVerifiedEmbedSession(sealed, "enterprise", secret, now), null);
  assert.equal(readVerifiedEmbedSession(sealed, "core", "b".repeat(64), now), null);
  assert.equal(readVerifiedEmbedSession(sealed + "garbage", "core", secret, now), null);
  assert.equal(readVerifiedEmbedSession(sealed, "core", secret, now - 300_000), null);
});

test("tampered signature or payload cannot authorize a checkout", () => {
  const sealed = sealVerifiedEmbedSession("ch_Sandbox1234", "core", secret, now)!;
  const [data, signature] = sealed.split(".");
  const fake = Buffer.from(JSON.stringify({
    sessionId: "ch_Sandbox9999", tier: "core",
    expiresAt: Math.floor(now / 1000) + 600,
  })).toString("base64url");
  assert.equal(readVerifiedEmbedSession(fake + "." + signature, "core", secret, now), null);
  assert.equal(readVerifiedEmbedSession(data + ".A" + signature.slice(1), "core", secret, now), null);
  assert.equal(readVerifiedEmbedSession(data + "." + signature + ".other", "core", secret, now), null);
  assert.equal(readVerifiedEmbedSession("notbase64." + signature, "core", secret, now), null);
  assert.equal(sealVerifiedEmbedSession("plan_sAEhr77rTrhX4", "core", secret, now), null);
  assert.equal(sealVerifiedEmbedSession("ch_Sandbox1234", "core", "too-short", now), null);
  assert.equal(readVerifiedEmbedSession(sealed, "core", "too-short", now), null);
});

test("verified Audit continuation POST requires exact same origin in bridge mode", () => {
  const url = "https://preview.example/api/checkout";
  assert.equal(sameOriginCheckoutPost(url, "https://preview.example"), true);
  assert.equal(sameOriginCheckoutPost(url, null), false);
  assert.equal(sameOriginCheckoutPost(url, "https://evil.example"), false);
  assert.equal(sameOriginCheckoutPost(url, "https://preview.example.evil.net"), false);
  assert.equal(sameOriginCheckoutPost(url, "https://preview.example@evil.example"), false);
  assert.equal(sameOriginCheckoutPost(url, "http://preview.example"), false);
});

test("existing hosted checkout remains default; embedded path is server-only and non-payable until full approval", () => {
  const route = fs.readFileSync(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8");
  const page = fs.readFileSync(new URL("../src/app/checkout/[plan]/page.tsx", import.meta.url), "utf8");
  const backend = fs.readFileSync(new URL("../src/checkout-embedded-session.ts", import.meta.url), "utf8");
  assert.match(route, /embeddedSessionId/);
  assert.match(route, /sealVerifiedEmbedSession/);
  assert.match(route, /sameOriginCheckoutPost/);
  assert.match(route, /secure: true, httpOnly: true, sameSite: 'lax', path: '\/'/);
  assert.match(route, /const result = NextResponse.redirect\(checkoutUrl, 303\)/);
  assert.match(page, /bridgeMode \? \(/);
  assert.match(page, /Sandbox payment is disabled until the separate integration release gate is approved/);
  assert.match(page, /FRAMELEADS_WHOP_SESSION_PAYMENT_ENABLED/);
  assert.match(page, /<VerifiedWhopSessionCheckout/);
  const checkout = fs.readFileSync(new URL("../src/components/VerifiedWhopSessionCheckout.tsx", import.meta.url), "utf8");
  assert.match(checkout, /from "@whop\/checkout\/react"/);
  assert.match(checkout, /sessionId=\{sessionId\}/);
  assert.match(checkout, /environment="sandbox"/);
  assert.match(checkout, /theme="light"/);
  assert.doesNotMatch(checkout, /affiliate_code|data-whop-affiliate|observeMeasurement\(["']PURCHASE/);
  assert.match(page, /readVerifiedEmbedSession/);
  assert.doesNotMatch(page, /searchParams\.session/);
  assert.doesNotMatch(backend, /\bfetch\(/);
  assert.doesNotMatch(route, /data-whop-affiliate|affiliate_code:/);
});
