import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";
import { auditOptions, diagnoseReplyWorkflow, hasAuditProxyConfiguration, normalizeCompanyWebsite, validateAuditLeadPayload, type AuditAnswers } from "../src/audit.ts";
import { POST } from "../src/app/api/audit-lead/route.ts";

const base: AuditAnswers = { monthlyQualifiedConversations: "16–30", dealValue: "$10k–$25k", weeklyManualBurden: "4–7 hours", decisionOwner: "It depends on the reply", nonRoutineHandling: "The workflow pauses" };
const diagnose = (overrides: Partial<AuditAnswers>) => diagnoseReplyWorkflow({ ...base, ...overrides });
const ingestUrl = "https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest";
const testSecret = "test-only-audit-secret-32-characters-long";
const testOidcToken = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
const validLead = { workEmail: "alex@example.com", companyWebsite: "example.com", diagnosis: "HIGH_CONSEQUENCE_DECISION_WORKFLOW", signals: ["HIGH_VALUE"], answers: base, attribution: { utmSource: "linkedin", anonymous_id: "11111111-1111-4111-8111-111111111111", session_id: "22222222-2222-4222-8222-222222222222", landing_path: "/" } };
const requestLead = (body: unknown = validLead) => new Request("http://localhost/api/audit-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("the public Audit bonus is the approved final PDF binary", () => {
  const pdf = readFileSync(new URL("../public/resources/ai-sdr-prompt-framework.pdf", import.meta.url));
  assert.equal(createHash("sha256").update(pdf).digest("hex").toUpperCase(), "B467D816001224AB5F39EBA508A0C53DEFDE6581DC9AAAC6FCF48726E9083A38");
});

test("all five audit questions expose their complete option sets", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(auditOptions).map(([key, values]) => [key, values.length])), { monthlyQualifiedConversations: 5, dealValue: 5, weeklyManualBurden: 5, decisionOwner: 6, nonRoutineHandling: 5 });
});
test("all diagnosis branches classify deterministically", () => {
  assert.equal(diagnose({ decisionOwner: "AI / automation" }).diagnosis, "UNCONTROLLED_AUTOMATION");
  assert.equal(diagnose({ monthlyQualifiedConversations: "0–5", dealValue: "Under $2k", weeklyManualBurden: "1–3 hours", decisionOwner: "SDR / salesperson", nonRoutineHandling: "The workflow pauses" }).diagnosis, "LOW_CURRENT_PRESSURE");
  assert.equal(diagnose({ decisionOwner: "I do — founder / owner" }).diagnosis, "FOUNDER_DECISION_BOTTLENECK");
  assert.equal(diagnose({ decisionOwner: "Whoever sees it first" }).diagnosis, "FRAGMENTED_REPLY_WORKFLOW");
  assert.equal(diagnose({ decisionOwner: "It depends on the reply", dealValue: "$50k+", nonRoutineHandling: "The workflow pauses" }).diagnosis, "HIGH_CONSEQUENCE_DECISION_WORKFLOW");
});
test("automation and low-pressure precedence are enforced", () => {
  const result = diagnose({ monthlyQualifiedConversations: "0–5", dealValue: "Under $2k", weeklyManualBurden: "Under 1 hour", decisionOwner: "AI / automation" });
  assert.equal(result.diagnosis, "UNCONTROLLED_AUTOMATION");
  assert.ok(result.signals.includes("AUTOMATION_RISK"));
});
test("secondary signals are derived without numeric scoring", () => {
  const result = diagnose({ monthlyQualifiedConversations: "60+", dealValue: "$50k+", weeklyManualBurden: "12+ hours", decisionOwner: "I do — founder / owner" });
  assert.deepEqual(result.signals, ["HIGH_VALUE", "HIGH_VOLUME", "HIGH_MANUAL_BURDEN", "FOUNDER_OWNED"]);
});
test("lead payload validation normalizes website and preserves attribution", () => {
  const payload = validateAuditLeadPayload({ firstName: " Alex ", workEmail: "ALEX@EXAMPLE.COM", companyWebsite: "https://www.example.com/path", diagnosis: "HIGH_CONSEQUENCE_DECISION_WORKFLOW", signals: ["HIGH_VALUE"], answers: base, attribution: { utmSource: "linkedin", landingPath: "/?audit=1" } });
  assert.equal(payload?.companyWebsite, "example.com");
  assert.equal(payload?.workEmail, "alex@example.com");
  assert.equal(payload?.attribution.utmSource, "linkedin");
  assert.equal(normalizeCompanyWebsite("not a domain"), null);
  assert.equal(validateAuditLeadPayload({}), null);
  assert.equal(validateAuditLeadPayload({ ...validLead, answers: { ...base, extra: "discard" } }), null);
  assert.equal(validateAuditLeadPayload({ ...validLead, signals: Array(21).fill("HIGH_VALUE") }), null);
});
test("proxy configuration requires the exact HTTPS endpoint and a valid server secret", () => {
  assert.equal(hasAuditProxyConfiguration(undefined, undefined), false);
  assert.equal(hasAuditProxyConfiguration(ingestUrl, testSecret), true);
  assert.equal(hasAuditProxyConfiguration("http://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest", testSecret), false);
  assert.equal(hasAuditProxyConfiguration(ingestUrl + "?secret=bad", testSecret), false);
  assert.equal(hasAuditProxyConfiguration("https://brandbrain-pi.vercel.app/other", testSecret), false);
  assert.equal(hasAuditProxyConfiguration(ingestUrl, "short"), false);
});
test("API proxy validates input and returns a controlled 503 when unconfigured", async () => {
  const invalid = await POST(new Request("http://localhost/api/audit-lead", { method: "POST", body: "{}" }));
  assert.equal(invalid.status, 400);
  const previousUrl = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const previousSecret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  delete process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  delete process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  const unavailable = await POST(requestLead());
  assert.equal(unavailable.status, 503);
  if (previousUrl) process.env.BRAND_BRAIN_AUDIT_INGEST_URL = previousUrl;
  if (previousSecret) process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = previousSecret;
});
test("API proxy forwards the validated payload with server-side bearer authentication", async () => {
  const originalFetch = globalThis.fetch;
  process.env.BRAND_BRAIN_AUDIT_INGEST_URL = ingestUrl;
  process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = testSecret;
  process.env.VERCEL_OIDC_TOKEN = testOidcToken;
  let captured: { input?: string; init?: RequestInit } = {};
  globalThis.fetch = async (input, init) => { captured = { input: String(input), init }; return Response.json({ ok: true, prospectId: "test-prospect" }); };
  const response = await POST(requestLead({ ...validLead, companyDomain: "client-must-not-forward-this" }));
  assert.equal(response.status, 201);
  assert.equal(captured.input, ingestUrl);
  assert.equal((captured.init?.headers as Record<string, string>).Authorization, `Bearer ${testSecret}`);
  assert.equal((captured.init?.headers as Record<string, string>)["x-vercel-trusted-oidc-idp-token"], testOidcToken);
  assert.equal(captured.init?.redirect, "error");
  assert.equal((captured.init?.signal as AbortSignal).aborted, false);
  assert.deepEqual(JSON.parse(String(captured.init?.body)), validLead);
  globalThis.fetch = originalFetch;
  delete process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  delete process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  delete process.env.VERCEL_OIDC_TOKEN;
});
test("API proxy maps upstream failures to bounded diagnostic codes without exposing secrets", async () => {
  const originalFetch = globalThis.fetch;
  process.env.BRAND_BRAIN_AUDIT_INGEST_URL = ingestUrl;
  process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = testSecret;
  process.env.VERCEL_OIDC_TOKEN = testOidcToken;
  try {
    for (const [upstream, expectedStatus, expectedCode] of [
      [new Response(null, { status: 401 }), 502, "AUDIT_BRIDGE_UPSTREAM_AUTH"],
      [new Response(null, { status: 400 }), 502, "AUDIT_BRIDGE_UPSTREAM_INVALID"],
      [new Response(null, { status: 503 }), 503, "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE"],
      [Response.json({ ok: false }), 502, "AUDIT_BRIDGE_UPSTREAM_INVALID"],
      [new Response("not-json"), 502, "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE"],
    ] as const) {
      globalThis.fetch = async () => upstream;
      const response = await POST(requestLead());
      assert.equal(response.status, expectedStatus);
      assert.equal(response.headers.get("X-Audit-Bridge-Code"), expectedCode);
      assert.equal((await response.json()).code, expectedCode);
      assert.ok(response.headers.get("X-Request-Id"));
    }
    globalThis.fetch = async () => { throw new Error("network unavailable"); };
    assert.equal((await POST(requestLead())).headers.get("X-Audit-Bridge-Code"), "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE");
    globalThis.fetch = async () => { throw Object.assign(new Error("timed out"), { name: "TimeoutError" }); };
    const timeout = await POST(requestLead());
    assert.equal(timeout.status, 504);
    assert.equal(timeout.headers.get("X-Audit-Bridge-Code"), "AUDIT_BRIDGE_TIMEOUT");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
    delete process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
    delete process.env.VERCEL_OIDC_TOKEN;
  }
});
test("existing homepage opens the five-question Audit submission flow", () => {
  const audit = readFileSync(new URL("../src/components/PipelineAudit.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../src/app/api/audit-lead/route.ts", import.meta.url), "utf8");
  assert.ok(audit.indexOf("Your diagnosis") < audit.indexOf("Want your personalized Reply Workflow Map?"));
  assert.ok(audit.indexOf("Want your personalized Reply Workflow Map?") < audit.indexOf("Bonus included"));
  assert.match(audit, /AI SDR Prompt Framework/);
  assert.match(audit, /5-prompt framework for classifying, deciding, controlling, prioritizing and escalating prospect replies safely/);
  assert.match(audit, /label="Work email" type="email" required/);
  assert.match(audit, /label="Company website" required/);
  assert.match(audit, /label="First name \(optional\)"/);
  assert.match(audit, /fetch\("\/api\/audit-lead"[\s\S]*?body: JSON\.stringify\(\{ firstName: firstName\.trim\(\) \|\| undefined, workEmail: workEmail\.trim\(\)\.toLowerCase\(\), companyWebsite, diagnosis: result\.diagnosis, signals: result\.signals, answers: result\.answers, attribution:/);
  assert.match(audit, /See How the System Works/); assert.match(audit, /See FrameLeads Handle This/);
  assert.match(audit, /getMarketingAttribution/);
  assert.match(route, /AUDIT_BRIDGE_CONFIG/); assert.match(route, /BRAND_BRAIN_AUDIT_INGEST_SECRET/);
  assert.match(page, /<AuditModal open=\{isAuditModalOpen\}/);
  assert.match(page, /5-question Reply Workflow Audit/);
  assert.match(audit, /5 questions/);
  assert.equal((audit.match(/\{ key: "/g) ?? []).length, 5);
  assert.doesNotMatch(audit, /LOW_PRESSURE|MANUAL_DECISION_BOTTLENECK|ROUTING_THROUGHPUT|GOVERNANCE_EXPOSURE/);
});
