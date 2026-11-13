import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { inspectWhopMerchantReadOnly } from "../src/affiliate-native-readiness.ts";

const companyId = "biz_TestCompany123";
function whopFixture(options: { unauthorized?: boolean; wrongCompany?: boolean; wrongPrice?: boolean; upfrontFee?: boolean; waitlist?: boolean; archived?: boolean; differentCurrency?: boolean } = {}) {
  const calls: { url: string; method: string }[] = [];
  const mock = async (value: string | URL | Request, init?: RequestInit) => {
    const url = new URL(value.toString());
    calls.push({ url: url.pathname + url.search, method: init?.method ?? "GET" });
    const respond = (value: object, status = 200) => new Response(JSON.stringify(value), {
      status, headers: { "Content-Type": "application/json" },
    });
    if (options.unauthorized) return respond({ error: "unauthorized" }, 401);
    if (url.pathname.includes("/plans/")) {
      const isCore = url.pathname.includes("plan_GQTDPXnvijugf");
      return respond({
        id: isCore ? "plan_GQTDPXnvijugf" : "plan_uGDGf5WKW7hlE",
        company: { id: options.wrongCompany ? "biz_AnotherCompany" : companyId },
        plan_type: "renewal", currency: options.differentCurrency ? "aed" : "usd", initial_price: options.upfrontFee ? 149 : 0,
        renewal_price: isCore && options.wrongPrice ? 99 : isCore ? 149 : 499,
        release_method: options.waitlist ? "waitlist" : "buy_now", visibility: options.archived ? "archived" : "visible",
      });
    }
    if (url.pathname === "/api/v1/affiliates") {
      return respond({
        data: [{ id: "aff_xxxxxxxxxxxxxx", user: { name: "PRIVATE_NEVER_RENDER" } }],
        page_info: { has_next_page: false },
      });
    }
    return respond({}, 404);
  };
  return { calls, mock: mock as typeof fetch };
}

test("read-only probe validates real plan IDs, ownership and affiliate read scope, with GETs only", async () => {
  const fixture = whopFixture();
  const result = await inspectWhopMerchantReadOnly(companyId, "fake-api-key", fixture.mock);
  assert.equal(result.connected, true);
  assert.equal(result.merchantVerified, true);
  assert.equal(result.rewardsWriteTested, false);
  assert.deepEqual(result.checks.map(x => x.ok), [true, true, true]);
  assert.equal(fixture.calls.length, 3);
  assert.equal(fixture.calls.every(x => x.method === "GET"), true);
  assert.equal(JSON.stringify(result).includes("PRIVATE_NEVER_RENDER"), false);
  assert.equal(JSON.stringify(result).includes("fake-api-key"), false);
});

test("probe rejects wrong company and stale plan prices", async () => {
  const wrongCompany = await inspectWhopMerchantReadOnly(companyId, "key", whopFixture({ wrongCompany: true }).mock);
  const wrongPrice = await inspectWhopMerchantReadOnly(companyId, "key", whopFixture({ wrongPrice: true }).mock);
  assert.equal(wrongCompany.merchantVerified, false);
  assert.equal(wrongPrice.merchantVerified, false);
  assert.ok(wrongCompany.checks.some(x => x.reasons?.includes("COMPANY_MISMATCH")));
  assert.ok(wrongPrice.checks.some(x => x.reasons?.includes("RENEWAL_PRICE_MISMATCH")));
  assert.equal(JSON.stringify(wrongCompany).includes("biz_AnotherCompany"), false);
  assert.equal(JSON.stringify(wrongPrice).includes("99"), false);
});

test("diagnostics identify all mismatched fields together without exposing raw provider values", async () => {
  const fixture = whopFixture({
    wrongCompany: true, wrongPrice: true, upfrontFee: true, waitlist: true,
    archived: true, differentCurrency: true,
  });
  const result = await inspectWhopMerchantReadOnly(companyId, "private-api-key", fixture.mock);
  const core = result.checks.find(check => check.label === "core");
  assert.deepEqual(core?.reasons, [
    "COMPANY_MISMATCH",
    "CURRENCY_MISMATCH",
    "RENEWAL_PRICE_MISMATCH",
    "UPFRONT_FEE_MISMATCH",
    "PLAN_VISIBILITY_INVALID",
    "NOT_DIRECT_PURCHASE",
  ]);
  assert.equal(result.merchantVerified, false);
  assert.equal(fixture.calls.every(call => call.method === "GET"), true);
  for (const secret of ["private-api-key", "biz_AnotherCompany", '"aed"', '"99"', '"149"']) {
    assert.equal(JSON.stringify(result).includes(secret), false, "must not disclose " + secret);
  }
});

test("hidden, direct-link plans are acceptable while archived ones fail closed", async () => {
  const archived = await inspectWhopMerchantReadOnly(companyId, "key", whopFixture({ archived: true }).mock);
  assert.equal(archived.merchantVerified, false);
  assert.deepEqual(archived.checks[0]?.reasons, ["PLAN_VISIBILITY_INVALID"]);
});

test("probe returns sanitized status for invalid key and never attempts a write", async () => {
  const fixture = whopFixture({ unauthorized: true });
  const result = await inspectWhopMerchantReadOnly(companyId, "secret-not-to-leak", fixture.mock);
  assert.equal(result.merchantVerified, false);
  assert.equal(result.connected, false);
  assert.equal(fixture.calls.every(x => x.method === "GET"), true);
  assert.equal(JSON.stringify(result).includes("secret-not-to-leak"), false);
});

test("Preview route cannot run on production and requires explicit branch-only opt-in", () => {
  const route = fs.readFileSync("src/app/api/affiliates/readiness/route.ts", "utf8");
  const client = fs.readFileSync("src/components/WhopReadinessControl.tsx", "utf8");
  assert.match(route, /env\.VERCEL_ENV !== "preview"/);
  assert.match(route, /env\.VERCEL_GIT_COMMIT_REF !== "feat\/whop-native-affiliate-preview-20261112"/);
  assert.match(route, /env\.AFFILIATE_NATIVE_PROVIDER_READONLY_PROBE_ENABLED !== "true"/);
  assert.match(route, /inspectWhopMerchantReadOnly/);
  assert.doesNotMatch(client, /AFFILIATE_WHOP_API_KEY|AFFILIATE_WHOP_COMPANY_ID/);
});
