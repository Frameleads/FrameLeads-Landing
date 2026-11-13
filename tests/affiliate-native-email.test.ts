import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  AffiliateMailError,
  queueAffiliateVerificationEmail,
  queueAffiliateWelcomeEmail,
} from "../src/affiliate-native-email.ts";

const applicant = { firstName: "Jo <Tester>", lastName: "Smith", email: "test@example.com" };
const config = { apiKey: "mock-mailer-key", fromEmail: "partners@frameleads.io" };
const confirmUrl = "https://frameleads.io/affiliates/confirm#token=ThisIsOnlyATestConfirmationToken1234";
const links = {
  core: "https://whop.com/frameleads/core?a=testing",
  enterprise: "https://whop.com/frameleads/enterprise?a=testing",
};

function mockMailer(status = 202, messageId: string | null = "msg_ABCdef01234567890") {
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
    return new Response(null, {
      status,
      headers: messageId ? { "x-message-id": messageId } : {},
    });
  };
  return { calls, send };
}

test("email confirmation is queued to the verified address and does not misstate delivery", async () => {
  const provider = mockMailer();
  const result = await queueAffiliateVerificationEmail(applicant, confirmUrl, config, provider.send);
  assert.deepEqual(result, { queued: true, providerMessageId: "msg_ABCdef01234567890" });
  assert.equal(provider.calls.length, 1);
  const item = provider.calls[0];
  assert.equal(item.url, "https://api.mailersend.com/v1/email");
  assert.equal(item.method, "POST");
  assert.equal(item.auth, "Bearer mock-mailer-key");
  assert.equal((item.body.to as { email: string }[])[0].email, applicant.email);
  assert.match(String(item.body.subject), /Confirm your FrameLeads affiliate application/);
  assert.ok(String(item.body.text).includes(confirmUrl));
  assert.ok(String(item.body.html).includes(encodeURI(confirmUrl).split("#")[0]));
  assert.ok(String(item.body.html).includes("&lt;Tester&gt;"), "HTML must escape user-provided names");
  assert.deepEqual(item.body.settings, { track_clicks: false, track_opens: false, track_content: false });
});

test("welcome message includes verified Core and Enterprise links and practical Whop dashboard instructions", async () => {
  const provider = mockMailer();
  await queueAffiliateWelcomeEmail(applicant, links, config, provider.send);
  const body = provider.calls[0].body;
  assert.equal(body.subject, "Your FrameLeads affiliate links");
  for (const item of [links.core, links.enterprise, "30% on eligible initial and recurring payments", "Refer buyers"]) {
    assert.ok(String(body.text).includes(item), "missing " + item);
  }
  assert.match(String(body.html), /Open Whop/);
  assert.equal(provider.calls[0].url, "https://api.mailersend.com/v1/email");
});

test("unsafe affiliate links are rejected before any email request", async () => {
  const provider = mockMailer();
  for (const bad of [
    "https://not-whop.example/ref", "http://whop.com/ref",
    "https://whop.com.evil.example/ref", "https://whop.com/ref#token",
    "https://attacker@whop.com/ref",
  ]) {
    await assert.rejects(
      queueAffiliateWelcomeEmail(applicant, { ...links, core: bad }, config, provider.send),
      (err: unknown) => err instanceof AffiliateMailError && err.code === "AFFILIATE_LINKS_INVALID",
    );
  }
  assert.equal(provider.calls.length, 0);
});

test("MailerSend 202 without x-message-id is NOT accepted as a delivered or queued email", async () => {
  const provider = mockMailer(202, null);
  await assert.rejects(
    queueAffiliateWelcomeEmail(applicant, links, config, provider.send),
    (err: unknown) => err instanceof AffiliateMailError && err.code === "MAIL_NOT_QUEUED",
  );
  assert.equal(provider.calls.length, 1);
});

test("MailerSend rejects unverified sender, bad credentials and provider errors", async () => {
  for (const [status, code] of [[422, "MAIL_SENDER_OR_RECIPIENT_INVALID"], [403, "MAIL_PROVIDER_UNAUTHORIZED"], [429, "MAIL_PROVIDER_REJECTED"]] as const) {
    await assert.rejects(
      queueAffiliateVerificationEmail(applicant, confirmUrl, config, mockMailer(status).send),
      (err: unknown) => err instanceof AffiliateMailError && err.code === code,
    );
  }
});

test("live signup routes use the verified transactional sender, never promise Whop's native email", () => {
  const apply = fs.readFileSync("src/app/api/affiliates/apply/route.ts", "utf8");
  const confirm = fs.readFileSync("src/app/api/affiliates/confirm/route.ts", "utf8");
  assert.match(apply, /queueAffiliateVerificationEmail/);
  assert.match(confirm, /queueAffiliateWelcomeEmail/);
  assert.match(confirm, /ENROLLED_EMAIL_DELIVERY_PENDING/);
  assert.doesNotMatch(apply + confirm, /fetch\("https:\/\/api\.mailersend\.com\/v1\/email"/);
});
