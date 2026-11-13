import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  AffiliateMailError,
  queueAffiliateVerificationEmail,
  queueAffiliateWelcomeEmail,
} from "../src/affiliate-native-email.ts";

const applicant = { firstName: "Jo <Tester>", lastName: "Smith", email: "test@example.com" };
const config = { apiKey: "mock-resend-key", fromEmail: "akram@frameleads.io" };
const confirmUrl = "https://frameleads.io/affiliates/confirm#token=ThisIsOnlyATestConfirmationToken1234";
const links = {
  core: "https://whop.com/frameleads/core?a=testing",
  enterprise: "https://whop.com/frameleads/enterprise?a=testing",
};
const id = "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794";

function mockResend(status = 200, payload: unknown = { id }) {
  const calls: { url: string; method: string; auth: string; body: Record<string, unknown> }[] = [];
  const send: typeof fetch = async (input, init) => {
    const header = new Headers(init?.headers);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    calls.push({
      url: input.toString(),
      method: init?.method ?? "GET",
      auth: header.get("authorization") ?? "",
      body,
    });
    return new Response(payload === null ? "" : JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { calls, send };
}

test("Resend accepts verification email only with a provider email ID; accepted is not delivered", async () => {
  const provider = mockResend();
  const result = await queueAffiliateVerificationEmail(applicant, confirmUrl, config, provider.send);
  assert.deepEqual(result, { queued: true, providerMessageId: id });
  assert.equal(provider.calls.length, 1);
  const item = provider.calls[0];
  assert.equal(item.url, "https://api.resend.com/emails");
  assert.equal(item.method, "POST");
  assert.equal(item.auth, "Bearer mock-resend-key");
  assert.deepEqual(item.body.to, [applicant.email]);
  assert.equal(item.body.from, "FrameLeads <akram@frameleads.io>");
  assert.match(String(item.body.subject), /Confirm your FrameLeads affiliate application/);
  assert.ok(String(item.body.text).includes(confirmUrl));
  assert.ok(String(item.body.html).includes("&lt;Tester&gt;"), "user-provided names must be escaped");
  assert.equal("settings" in item.body, false, "do not send unsupported provider options");
});

test("Resend welcome email includes approved links, recurring terms and screenshot resources", async () => {
  const provider = mockResend();
  await queueAffiliateWelcomeEmail(applicant, links, config, provider.send);
  const body = provider.calls[0].body;
  assert.equal(body.subject, "Your FrameLeads affiliate links");
  for (const value of [links.core, links.enterprise,
    "30% on eligible initial and recurring payments",
    "Refer buyers", "https://frameleads.io/affiliates#partner-proof-kit",
    "illustrative demo prospects"]) {
    assert.ok(String(body.text).includes(value), "missing " + value);
  }
  assert.match(String(body.html), /Open Whop/);
  assert.equal(provider.calls[0].url, "https://api.resend.com/emails");
});

test("unsafe Whop referral links fail closed before email dispatch", async () => {
  const provider = mockResend();
  for (const invalid of [
    "https://not-whop.example/ref",
    "http://whop.com/ref",
    "https://whop.com.evil.example/ref",
    "https://whop.com/ref#token",
    "https://attacker@whop.com/ref",
  ]) {
    await assert.rejects(
      queueAffiliateWelcomeEmail(applicant, { ...links, core: invalid }, config, provider.send),
      (error: unknown) => error instanceof AffiliateMailError && error.code === "AFFILIATE_LINKS_INVALID",
    );
  }
  assert.equal(provider.calls.length, 0);
});

test("a successful response without a valid Resend email ID is NOT accepted", async () => {
  for (const payload of [{}, { id: "" }, { id: "malformed" }, null]) {
    const provider = mockResend(200, payload);
    await assert.rejects(
      queueAffiliateWelcomeEmail(applicant, links, config, provider.send),
      (error: unknown) => error instanceof AffiliateMailError && error.code === "MAIL_NOT_ACCEPTED",
    );
  }
});

test("Resend rejects unauthorized, invalid sender, rate limited and service errors", async () => {
  for (const [status, code] of [
    [400, "MAIL_SENDER_OR_RECIPIENT_INVALID"],
    [422, "MAIL_SENDER_OR_RECIPIENT_INVALID"],
    [403, "MAIL_PROVIDER_UNAUTHORIZED"],
    [401, "MAIL_PROVIDER_UNAUTHORIZED"],
    [429, "MAIL_PROVIDER_RATE_LIMITED"],
    [500, "MAIL_PROVIDER_REJECTED"],
  ] as const) {
    await assert.rejects(
      queueAffiliateVerificationEmail(applicant, confirmUrl, config, mockResend(status).send),
      (error: unknown) => error instanceof AffiliateMailError && error.code === code,
    );
  }
});

test("routes use Resend sender and avoid claiming native Whop mail or delivery", () => {
  const apply = fs.readFileSync("src/app/api/affiliates/apply/route.ts", "utf8");
  const confirm = fs.readFileSync("src/app/api/affiliates/confirm/route.ts", "utf8");
  const native = fs.readFileSync("src/affiliate-native.ts", "utf8");
  const adapter = fs.readFileSync("src/affiliate-native-email.ts", "utf8");
  assert.match(apply, /queueAffiliateVerificationEmail/);
  assert.match(confirm, /queueAffiliateWelcomeEmail/);
  assert.match(confirm, /ENROLLED_EMAIL_DELIVERY_PENDING/);
  assert.match(native, /AFFILIATE_RESEND_API_KEY/);
  assert.doesNotMatch(native, /AFFILIATE_MAILERSEND_API_KEY/);
  assert.doesNotMatch(adapter, /api\.mailersend\.com|x-message-id/);
  assert.match(adapter, /https:\/\/api\.resend\.com\/emails/);
});
