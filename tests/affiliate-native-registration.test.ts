import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  AFFILIATE_COMMISSION_PERCENT, AFFILIATE_PLANS, affiliateMode, liveConfig,
  createEmailConfirmationToken, readEmailConfirmationToken, validateApplicant,
  registerVerifiedAffiliate, NativeWhopError,
} from "../src/affiliate-native.ts";

const companyId = "biz_TestCompany123";
const secret = "12".repeat(32);
const applicant = { firstName: "Jane", lastName: "Doe", email: "jane@example.com" };

test("30% recurring-payment policy is fixed to current Core and Enterprise plans", () => {
  assert.equal(AFFILIATE_COMMISSION_PERCENT, 30);
  assert.deepEqual(AFFILIATE_PLANS.map(item => [item.key, item.price, item.planId]), [
    ["core", 149, "plan_GQTDPXnvijugf"],
    ["enterprise", 499, "plan_uGDGf5WKW7hlE"],
  ]);
  assert.equal(validateApplicant({ ...applicant, email: " JANE@EXAMPLE.COM " })?.email, applicant.email);
  assert.equal(validateApplicant({ ...applicant, email: "invalid" }), null);
  assert.equal(validateApplicant({ ...applicant, firstName: "<script>" }), null);
});

test("preview always dry-runs; production requires two intentional gates and exact configuration", () => {
  assert.equal(affiliateMode({ VERCEL_ENV: "preview", AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true" }), "preview");
  assert.equal(affiliateMode({ VERCEL_ENV: "production", AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true" }), "disabled");
  assert.equal(liveConfig({ VERCEL_ENV: "production", AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true", AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "true" }), null);
  assert.equal(affiliateMode({ VERCEL_ENV: "production", AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true", AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "true" }), "live");
  assert.equal(affiliateMode({ VERCEL_ENV: "development", AFFILIATE_NATIVE_REGISTRATION_ENABLED: "true", AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "true" }), "disabled");
});

test("email token is authenticated, has short expiry, and hides the email from casual URL inspection", () => {
  const now = Date.now();
  const token = createEmailConfirmationToken(applicant, secret, now);
  assert.deepEqual(readEmailConfirmationToken(token, secret, now + 5_000), applicant);
  assert.equal(token.includes("jane"), false);
  assert.equal(readEmailConfirmationToken(token, "ab".repeat(32), now), null);
  assert.equal(readEmailConfirmationToken((token[0] === "A" ? "B" : "A") + token.slice(1), secret, now), null);
  assert.equal(readEmailConfirmationToken(token, secret, now + 21 * 60_000), null);
});

function fakeWhop(existing: Record<string, unknown>[] = [], alteredPrice = false) {
  const overrides = [...existing];
  const calls: { method: string; path: string; body: Record<string, unknown> | null }[] = [];
  const mock = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(input.toString());
    assert.equal(new Headers(init?.headers).get("Api-Version-Date"), "2025-01-01", "Whop registration calls must pin the stable company_id API contract");
    const path = url.pathname;
    const method = init?.method || "GET";
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : null;
    calls.push({ method, path, body });
    const response = (object: object, status = 200) => new Response(JSON.stringify(object), { status, headers: { "Content-Type": "application/json" } });
    if (method === "GET" && path.startsWith("/api/v1/plans/")) {
      const match = AFFILIATE_PLANS.find(plan => path.endsWith(plan.planId));
      return match ? response({ id: match.planId, plan_type: "renewal", currency: "usd",
        company: { id: companyId }, initial_price: 0, renewal_price: alteredPrice && match.key === "core" ? 99 : match.price }) : response({}, 404);
    }
    if (path === "/api/v1/affiliates" && method === "POST") {
      return response({ id: "aff_Test123", company: { id: companyId } });
    }
    if (path === "/api/v1/affiliates/aff_Test123/overrides" && method === "GET") {
      return response({ data: [...overrides], page_info: { has_next_page: false, end_cursor: null } });
    }
    if (path === "/api/v1/affiliates/aff_Test123/overrides" && method === "POST" && body) {
      const value = { ...body, id: "affov_" + String(overrides.length + 1),
        checkout_direct_link: "https://whop.com/checkout/" + body.plan_id + "?a=test", product_direct_link: "https://whop.com/example" };
      overrides.push(value);
      return response(value);
    }
    return response({}, 404);
  };
  return { mock: mock as typeof fetch, calls, overrides };
}

test("Whop creates one affiliate and two scoped recurring rewards, with provider links", async () => {
  const provider = fakeWhop();
  const result = await registerVerifiedAffiliate(applicant.email, companyId, "test-key", provider.mock);
  assert.match(result.core, /^https:\/\/whop.com\/checkout\/plan_GQTDPXnvijugf/);
  assert.match(result.enterprise, /^https:\/\/whop.com\/checkout\/plan_uGDGf5WKW7hlE/);
  assert.equal(provider.overrides.length, 2);
  for (const item of provider.overrides) {
    assert.equal(item.commission_type, "percentage");
    assert.equal(item.commission_value, 30);
    assert.equal(item.applies_to_payments, "all_payments");
    assert.equal(item.override_type, "standard");
  }
  await registerVerifiedAffiliate(applicant.email, companyId, "test-key", provider.mock);
  assert.equal(provider.overrides.length, 2, "replay must not create duplicate overrides");
});

test("fails closed after price drop instead of accidentally continuing 30%", async () => {
  const provider = fakeWhop([], true);
  await assert.rejects(registerVerifiedAffiliate(applicant.email, companyId, "key", provider.mock),
    (error: unknown) => error instanceof NativeWhopError && error.code === "PROVIDER_PLAN_POLICY_MISMATCH");
  assert.equal(provider.calls.some(call => call.path === "/api/v1/affiliates"), false);
});

test("fails closed if a recurring or mismatched reward already exists", async () => {
  const provider = fakeWhop([{
    plan_id: "plan_GQTDPXnvijugf", commission_value: 30, commission_type: "percentage",
    applies_to_payments: "first_payment",
  }]);
  await assert.rejects(registerVerifiedAffiliate(applicant.email, companyId, "key", provider.mock),
    (error: unknown) => error instanceof NativeWhopError && error.code === "EXISTING_REWARD_CONFLICT");
  assert.equal(provider.calls.some(call => call.method === "POST" && call.path.endsWith("/overrides")), false);
});

test("registration form and routes have no dependency on blocked custom affiliate ledger", () => {
  const files = [
    "src/affiliate-native.ts", "src/app/api/affiliates/apply/route.ts",
    "src/app/api/affiliates/confirm/route.ts", "src/components/AffiliateRegistrationForm.tsx",
  ].map(path => fs.readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(files, /direct_checkout_attempts|begin_verified_affiliate_checkout_attempt|AFFILIATE_CONSENT_EVIDENCE_ENABLED|supabase\/migrations/);
  assert.match(files, /all_payments/);
  assert.match(files, /AFFILIATE_NATIVE_REGISTRATION_ENABLED/);
});
