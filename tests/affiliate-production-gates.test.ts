import assert from "node:assert/strict";
import test from "node:test";
import { POST as apply } from "../src/app/api/affiliates/apply/route.ts";
import { POST as confirm } from "../src/app/api/affiliates/confirm/route.ts";
import { affiliateMode } from "../src/affiliate-native.ts";

/**
 * Never call real Whop, Resend or Turnstile in release-gate tests. These tests
 * exercise the public POST route fail-closed behavior with synthetic values.
 */
const fullyConfigured: Record<string, string> = {
  VERCEL_ENV: "production",
  WHOP_ENVIRONMENT: "production",
  AFFILIATE_NATIVE_REGISTRATION_ENABLED: "false",
  AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "false",
  AFFILIATE_WHOP_API_KEY: "non-secret-test-key",
  AFFILIATE_WHOP_COMPANY_ID: "biz_TestOnly123",
  AFFILIATE_EMAIL_TOKEN_KEY: "ab".repeat(32),
  AFFILIATE_RESEND_API_KEY: "non-secret-resend-test-key",
  AFFILIATE_MAIL_FROM: "tests@example.com",
  AFFILIATE_CORE_PLAN_ID: "plan_GQTDPXnvijugf",
  AFFILIATE_ENTERPRISE_PLAN_ID: "plan_uGDGf5WKW7hlE",
  AFFILIATE_TURNSTILE_SECRET: "non-secret-turnstile-test-key",
  NEXT_PUBLIC_AFFILIATE_TURNSTILE_SITE_KEY: "non-secret-turnstile-site-test-key",
};
const snapshot = Object.fromEntries(Object.keys(fullyConfigured).map(k => [k, process.env[k]]));

function makeRequest(path: "apply" | "confirm", host = "frameleads.io"): Request {
  const origin = "https://" + host;
  return new Request(origin + "/api/affiliates/" + path, {
    method: "POST",
    headers: { origin, "content-type": "application/json", "sec-fetch-site": "same-origin" },
    body: path === "apply"
      ? JSON.stringify({ firstName: "Test", lastName: "Partner", email: "nobody@example.com", agreed: true, website: "", turnstileToken: "non-secret-fake-token" })
      : JSON.stringify({ token: "fake-not-a-valid-confirmation-token" }),
  });
}

test("production endpoints remain inaccessible with either release switch disabled", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  try {
    globalThis.fetch = (async () => {
      providerCalls++;
      throw new Error("Provider must not be contacted by a gated route");
    }) as typeof fetch;

    for (const [registration,review] of [["false","false"],["true","false"],["false","true"]]) {
      Object.assign(process.env, fullyConfigured, {
        AFFILIATE_NATIVE_REGISTRATION_ENABLED: registration,
        AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: review,
      });
      assert.equal(affiliateMode(process.env), "disabled");
      for (const route of ["apply", "confirm"] as const) {
        const res = route === "apply" ? await apply(makeRequest(route)) : await confirm(makeRequest(route));
        assert.equal(res.status, 503, route + " must stay closed");
        const result = await res.json();
        assert.equal(result.code, "NOT_LIVE");
      }
    }
    assert.equal(providerCalls, 0, "No Whop, Resend, or Turnstile calls when launch approval is missing");
  } finally {
    globalThis.fetch = originalFetch;
    for(const [k,v] of Object.entries(snapshot)) if(v===undefined) delete process.env[k]; else process.env[k] = v;
  }
});

test("even with both gates enabled, non-canonical hosts cannot reach providers", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  try {
    globalThis.fetch = (async () => {
      providerCalls++;
      throw new Error("Host validation must precede external calls");
    }) as typeof fetch;
    Object.assign(process.env, fullyConfigured, {
      AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true",
      AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "true",
    });
    assert.equal(affiliateMode(process.env), "live");
    assert.equal((await apply(makeRequest("apply", "invalid.example"))).status, 403);
    assert.equal((await confirm(makeRequest("confirm", "invalid.example"))).status, 403);
    assert.equal(providerCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    for(const [k,v] of Object.entries(snapshot)) if(v===undefined) delete process.env[k]; else process.env[k] = v;
  }
});
