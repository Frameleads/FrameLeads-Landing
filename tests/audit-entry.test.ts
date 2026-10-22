import assert from "node:assert/strict";
import test from "node:test";
import { auditLocation, auditRequested, legacyAuditDestination } from "../src/audit-entry.ts";
import { captureAttribution, metaCaptureHeaders } from "../src/audit-capture.ts";
import { validateAuditLeadPayload, auditOptions } from "../src/audit.ts";
import { POST } from "../src/app/api/audit-lead/route.ts";
import { POST as requestCheckoutContinuation } from "../src/app/api/audit-lead/continue/route.ts";

test("only the explicit Audit deep link opens; open/close retains every attribution parameter and hash", () => {
  for (const search of ["", "?utm_source=meta", "?audit=1", "?audit=closed"]) assert.equal(auditRequested(search), false);
  assert.equal(auditRequested("?audit=open&utm_source=meta&fbclid=fixture"), true);
  const href = "https://frameleads.io/?utm_source=meta&utm_campaign=launch&fbclid=fixture&tag=one&tag=two#pricing";
  const open = auditLocation(href, true);
  assert.equal(auditLocation("https://frameleads.io" + open, true), open);
  const closed = auditLocation("https://frameleads.io" + open, false);
  assert.equal(closed, new URL(href).pathname + new URL(href).search + new URL(href).hash);
});

test("legacy Audit links redirect to the homepage while retaining repeated campaign parameters", () => {
  const destination = legacyAuditDestination({ audit: "old", utm_source: "meta", tag: ["a", "b"], fbclid: "fixture" });
  assert.equal(destination, "/?utm_source=meta&tag=a&tag=b&fbclid=fixture&audit=open");
});

test("Meta capture context requires consent and actual production browser headers, and removes URL queries", () => {
  const request = new Request("https://frameleads.io/api/audit-lead", { headers: {
    "user-agent": "Browser fixture", referer: "https://frameleads.io/?audit=open&email=private@example.com&utm_source=meta#private",
  } });
  assert.deepEqual(metaCaptureHeaders(request, false), {});
  assert.deepEqual(metaCaptureHeaders(request, true), { "user-agent": "Browser fixture", referer: "https://frameleads.io/" });
  for (const referer of ["https://other.example/", "https://frameleads.io/private@example.com", "https://frameleads.io/%40private", "invalid"]) {
    assert.deepEqual(metaCaptureHeaders(new Request(request.url, { headers: { "user-agent": "Browser fixture", referer } }), true), {});
  }
  assert.deepEqual(metaCaptureHeaders(new Request(request.url), true), {});
});

test("capture keeps optional attribution only for its permitted purpose and never mutates the input", () => {
  const answers = Object.fromEntries(Object.entries(auditOptions).map(([key, options]) => [key, options[0]]));
  const payload = validateAuditLeadPayload({ workEmail: "person@example.com", companyWebsite: "example.com", diagnosis: "LOW_CURRENT_PRESSURE", signals: [], answers, attribution: { utm_source: "meta", fbp: "fb.1.fixture", fbc: "fb.1.click", fbclid: "click", ttclid: "click", ttp: "cookie", affiliateCode: "partner_alpha" } })!;
  assert.ok(payload);
  assert.deepEqual(captureAttribution(payload, false).attribution, { utm_source: "meta" });
  const consentedButUnapproved = captureAttribution(payload, true);
  assert.equal(consentedButUnapproved.attribution.fbc, "fb.1.click");
  assert.equal(consentedButUnapproved.attribution.affiliateCode, undefined);
  assert.deepEqual(captureAttribution(payload, true, true), payload);
  assert.equal(payload.attribution.fbclid, "click");
  assert.equal(captureAttribution(payload, false).attribution.affiliateCode, undefined);
  assert.equal(payload.attribution.affiliateCode, "partner_alpha");
});

test("public capture forwards consented sanitized context only after validation and accepts only a canonical receipt", async () => {
  const keys = ["BRAND_BRAIN_AUDIT_INGEST_URL", "BRAND_BRAIN_AUDIT_INGEST_SECRET", "VERCEL_OIDC_TOKEN", "AFFILIATE_REFERRAL_PRIVACY_APPROVED"] as const;
  const before = keys.map((key) => process.env[key]);
  const transport = globalThis.fetch;
  const answers = Object.fromEntries(Object.entries(auditOptions).map(([key, options]) => [key, options[0]]));
  const payload = { workEmail: "fixture@example.com", companyWebsite: "example.com", diagnosis: "LOW_CURRENT_PRESSURE", signals: [], answers, attribution: { utm_source: "meta", fbc: "fb.1.fixture", affiliateCode: "partner_alpha" } };
  const calls: RequestInit[] = [];
  try {
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL = "https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest";
    process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = "fixture-only-secret-long-enough-32-characters";
    process.env.AFFILIATE_REFERRAL_PRIVACY_APPROVED = "true";
    process.env.VERCEL_OIDC_TOKEN = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
    globalThis.fetch = async (_url, init) => { calls.push(init!); return Response.json({ ok: true, source: "WEBSITE_AUDIT", prospectId: "11111111-1111-4111-8111-111111111111", checkoutContinuationAvailable: true }); };
    const request = (advertisingConsent: unknown) => new Request("https://frameleads.io/api/audit-lead", { method: "POST", headers: { "user-agent": "Actual browser", referer: "https://frameleads.io/?audit=open&fbclid=fixture&email=private@example.com" }, body: JSON.stringify({ ...payload, advertisingConsent }) });
    assert.equal((await POST(request("true"))).status, 400);
    assert.equal(calls.length, 0);
    assert.deepEqual(await (await POST(request(true))).json(), { success: true, prospectId: "11111111-1111-4111-8111-111111111111", checkoutContinuationAvailable: true });
    assert.equal((calls[0].headers as Record<string, string>).referer, "https://frameleads.io/");
    assert.equal((calls[0].headers as Record<string, string>)["user-agent"], "Actual browser");
    assert.equal(JSON.parse(calls[0].body as string).advertisingConsent, undefined);
    assert.equal(JSON.parse(calls[0].body as string).attribution.fbc, "fb.1.fixture");
    assert.equal(JSON.parse(calls[0].body as string).attribution.affiliateCode, "partner_alpha");
    assert.equal((await POST(request(false))).status, 201);
    assert.equal((calls[1].headers as Record<string, string>).referer, undefined);
    assert.equal(JSON.parse(calls[1].body as string).attribution.fbc, undefined);
    assert.equal(JSON.parse(calls[1].body as string).attribution.affiliateCode, undefined);
    process.env.AFFILIATE_REFERRAL_PRIVACY_APPROVED = "false";
    assert.equal((await POST(request(true))).status, 201);
    assert.equal(JSON.parse(calls[2].body as string).attribution.fbc, "fb.1.fixture");
    assert.equal(JSON.parse(calls[2].body as string).attribution.affiliateCode, undefined);
    globalThis.fetch = async () => Response.json({ ok: true });
    assert.equal((await POST(request(true))).status, 502);
  } finally {
    globalThis.fetch = transport;
    keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; });
  }
});

test("checkout verification is proxied only from a same-origin explicit continuation request", async () => {
  const keys = ["BRAND_BRAIN_AUDIT_INGEST_URL", "BRAND_BRAIN_AUDIT_INGEST_SECRET", "VERCEL_OIDC_TOKEN"] as const;
  const before = keys.map((key) => process.env[key]);
  const transport = globalThis.fetch;
  const calls: { url: string; init?: RequestInit }[] = [];
  try {
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL = "https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest";
    process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = "fixture-only-secret-long-enough-32-characters";
    process.env.VERCEL_OIDC_TOKEN = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
    globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return Response.json({ status: "SENT" }); };
    const makeRequest = (origin: string) => new Request("https://frameleads.io/api/audit-lead/continue", {
      method: "POST", headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ prospectId: "11111111-1111-4111-8111-111111111111" }),
    });
    assert.equal((await requestCheckoutContinuation(makeRequest("https://attacker.example"))).status, 403);
    assert.equal(calls.length, 0);
    const response = await requestCheckoutContinuation(makeRequest("https://frameleads.io"));
    assert.deepEqual(await response.json(), { status: "SENT" });
    assert.equal(calls.length, 1);
    assert.equal(new URL(calls[0].url).pathname, "/api/marketing/checkout/continue");
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`);
    assert.equal(JSON.parse(calls[0].init?.body as string).prospectId, "11111111-1111-4111-8111-111111111111");
  } finally {
    globalThis.fetch = transport;
    keys.forEach((key, index) => before[index] === undefined ? delete process.env[key] : process.env[key] = before[index]!);
  }
});
