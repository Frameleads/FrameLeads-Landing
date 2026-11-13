import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { inspectWhopMerchantReadOnly } from "../src/affiliate-native-readiness.ts";

const companyId = "biz_TestCompany123";
function whopFixture(options: { unauthorized?: boolean; wrongCompany?: boolean; wrongPrice?: boolean; upfrontFee?: boolean; waitlist?: boolean; archived?: boolean; differentCurrency?: boolean; staleConfiguredIds?: boolean; catalogErrorStatus?: number } = {}) {
  const calls: { url: string; method: string }[] = [];
  const mock = async (value: string | URL | Request, init?: RequestInit) => {
    const url = new URL(value.toString());
    calls.push({ url: url.pathname + url.search, method: init?.method ?? "GET" });
    const respond = (value: object, status = 200) => new Response(JSON.stringify(value), {
      status, headers: { "Content-Type": "application/json" },
    });
    if (options.unauthorized) return respond({ error: "unauthorized" }, 401);
    const plan = (key: "core" | "enterprise", catalog = false) => ({
      id: catalog && options.staleConfiguredIds
        ? key === "core" ? "plan_CurrentCore123" : "plan_CurrentEnterprise456"
        : key === "core" ? "plan_GQTDPXnvijugf" : "plan_uGDGf5WKW7hlE",
      company: { id: !catalog && (options.wrongCompany || options.staleConfiguredIds) ? "biz_AnotherCompany" : companyId },
      product: { title: key === "core" ? "FrameLeads Core: Reply Decision Intelligence" : "FrameLeads Enterprise: Revenue Decision Intelligence" },
      plan_type: !catalog && options.staleConfiguredIds ? "one_time" : "renewal",
      currency: options.differentCurrency ? "aed" : "usd",
      initial_price: options.upfrontFee ? 149 : 0,
      renewal_price: key === "core" && options.wrongPrice ? 99 : key === "core" ? 149 : 499,
      release_method: options.waitlist ? "waitlist" : "buy_now",
      visibility: options.archived ? "archived" : "visible",
    });
    if (url.pathname.includes("/plans/")) {
      return respond(plan(url.pathname.includes("plan_GQTDPXnvijugf") ? "core" : "enterprise"));
    }
    if (url.pathname === "/api/v1/plans") {
      if (options.catalogErrorStatus) return respond({ error: { message: "SECRET_PROVIDER_BODY_MUST_NOT_LEAK" } }, options.catalogErrorStatus);
      return respond({ data: [plan("core", true), plan("enterprise", true)], page_info: { has_next_page: false, end_cursor: null } });
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
  assert.deepEqual(result.catalog, {
    status: "MATCH_FOUND",
    candidates: { core: "plan_GQTDPXnvijugf", enterprise: "plan_uGDGf5WKW7hlE" },
  });
  assert.equal(fixture.calls.length, 4);
  assert.equal(fixture.calls.every(x => x.method === "GET"), true);
  assert.equal(JSON.stringify(result).includes("PRIVATE_NEVER_RENDER"), false);
  assert.equal(JSON.stringify(result).includes("fake-api-key"), false);
});

test("Whop catalog request uses only required company_id parameter", async () => {
  const fixture = whopFixture();
  await inspectWhopMerchantReadOnly(companyId, "key", fixture.mock);
  const catalogCall = fixture.calls.find(call => call.url.startsWith("/api/v1/plans?"));
  assert.ok(catalogCall);
  const params = new URLSearchParams(catalogCall.url.split("?")[1]);
  assert.deepEqual([...params.keys()], ["company_id"]);
});

test("Whop catalog failures distinguish 422 validation from 5xx provider error without revealing response bodies", async () => {
  for (const [status,code] of [[422,"PROVIDER_VALIDATION_422"],[500,"PROVIDER_SERVER_ERROR_5XX"],[400,"PROVIDER_BAD_REQUEST_400"]] as const) {
    const fixture = whopFixture({ catalogErrorStatus: status });
    const result = await inspectWhopMerchantReadOnly(companyId, "key", fixture.mock);
    assert.ok(result.checks.some(check => check.label === "plan_catalog" && check.code === code));
    assert.equal(result.catalog?.status, "READ_UNAVAILABLE");
    assert.equal(JSON.stringify(result).includes("SECRET_PROVIDER_BODY_MUST_NOT_LEAK"), false);
    assert.equal(fixture.calls.every(call => call.method === "GET"), true);
  }
});

test("discovers a unique eligible replacement from the real merchant catalog without writes", async () => {
  const fixture = whopFixture({ staleConfiguredIds: true });
  const result = await inspectWhopMerchantReadOnly(companyId, "key", fixture.mock);
  assert.equal(result.merchantVerified, false, "suggesting plans must never bypass configured ID checks");
  assert.deepEqual(result.catalog, {
    status: "MATCH_FOUND",
    candidates: { core: "plan_CurrentCore123", enterprise: "plan_CurrentEnterprise456" },
  });
  assert.deepEqual(result.checks.filter(x => x.label === "core" || x.label === "enterprise")
    .map(x => x.reasons), [
      ["COMPANY_MISMATCH", "NOT_RECURRING"],
      ["COMPANY_MISMATCH", "NOT_RECURRING"],
    ]);
  assert.equal(fixture.calls.every(x => x.method === "GET"), true);
  assert.equal(JSON.stringify(result).includes("biz_AnotherCompany"), false);
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
