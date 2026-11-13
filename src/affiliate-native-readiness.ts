import { AFFILIATE_PLANS } from "./affiliate-native.ts";

type ProviderCheck = { label: string; ok: boolean; code: string; reasons?: string[] };
export type WhopPlanCatalog = {
  status: "MATCH_FOUND" | "NO_MATCH" | "AMBIGUOUS" | "READ_UNAVAILABLE";
  // Plan IDs are public identifiers, not access credentials. Only emit an ID
  // when exactly one eligible plan matches merchant, brand, price and type.
  candidates: { core: string | null; enterprise: string | null };
};
export type WhopReadiness = {
  connected: boolean;
  merchantVerified: boolean;
  rewardsWriteTested: false;
  checks: ProviderCheck[];
  catalog?: WhopPlanCatalog;
};

function merchantIdValid(value: string): boolean {
  return /^biz_[A-Za-z0-9]+$/.test(value);
}

/** A credentialed PREVIEW read-only probe. No users, affiliates, or rewards are created. */
export async function inspectWhopMerchantReadOnly(
  companyId: string,
  apiKey: string,
  send: typeof fetch = fetch,
): Promise<WhopReadiness> {
  if (!merchantIdValid(companyId) || !apiKey) {
    return { connected: false, merchantVerified: false, rewardsWriteTested: false, checks: [
      { label: "configuration", ok: false, code: "MISSING_MERCHANT_CONFIG" },
    ] };
  }
  const checks: ProviderCheck[] = [];
  const base = "https://api.whop.com/api/v1";
  let authorized = false;
  let owned = true;

  async function read(path: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await send(base + path, {
        method: "GET",
        headers: { Authorization: "Bearer " + apiKey, Accept: "application/json" },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });
      if (!response.ok) {
        // Do not surface provider response bodies: they can contain request
        // metadata or account information. HTTP category is sufficient to
        // diagnose whether this is a client, permission, or provider failure.
        const code = response.status === 400 ? "PROVIDER_BAD_REQUEST_400"
          : response.status === 401 ? "INVALID_CREDENTIAL"
          : response.status === 403 ? "INSUFFICIENT_PERMISSIONS"
          : response.status === 404 ? "NOT_FOUND"
          : response.status === 422 ? "PROVIDER_VALIDATION_422"
          : response.status === 429 ? "PROVIDER_RATE_LIMIT"
          : response.status >= 500 ? "PROVIDER_SERVER_ERROR_5XX"
          : "PROVIDER_OTHER_HTTP_ERROR";
        checks.push({ label: path.startsWith("/plans") ? "plan_catalog" : "affiliate_read", ok: false, code });
        owned = false;
        return null;
      }
      authorized = true;
      const object: unknown = await response.json();
      if (!object || typeof object !== "object" || Array.isArray(object)) {
        checks.push({ label: "provider_response", ok: false, code: "INVALID_RESPONSE" });
        owned = false;
        return null;
      }
      return object as Record<string, unknown>;
    } catch {
      checks.push({ label: "provider_request", ok: false, code: "PROVIDER_UNREACHABLE" });
      owned = false;
      return null;
    }
  }

  for (const plan of AFFILIATE_PLANS) {
    const object = await read("/plans/" + encodeURIComponent(plan.planId));
    if (!object) continue;
    const company = object.company;
    const owner = company && typeof company === "object" && !Array.isArray(company)
      ? (company as Record<string, unknown>).id : null;
    // Report only which checks failed, never the raw merchant ID, actual
    // prices, product metadata, affiliate data, or provider response.
    // Whop specifies initial_price is added to the first renewal charge:
    // any nonzero upfront fee must be reviewed against the advertised offer.
    const reasons = [
      ...(object.id === plan.planId ? [] : ["PLAN_ID_MISMATCH"]),
      ...(owner === companyId ? [] : ["COMPANY_MISMATCH"]),
      ...(object.plan_type === "renewal" ? [] : ["NOT_RECURRING"]),
      ...(object.currency === "usd" ? [] : ["CURRENCY_MISMATCH"]),
      ...(object.renewal_price === plan.price ? [] : ["RENEWAL_PRICE_MISMATCH"]),
      ...(object.initial_price === 0 ? [] : ["UPFRONT_FEE_MISMATCH"]),
      ...(["visible", "hidden", "quick_link"].includes(String(object.visibility))
        ? [] : ["PLAN_VISIBILITY_INVALID"]),
      ...(object.release_method === "buy_now" ? [] : ["NOT_DIRECT_PURCHASE"]),
    ];
    const valid = reasons.length === 0;
    checks.push({
      label: plan.key,
      ok: valid,
      code: valid ? "VERIFIED" : "PLAN_POLICY_MISMATCH",
      ...(valid ? {} : { reasons }),
    });
    if (!valid) owned = false;
  }

  // This verifies affiliate READ permission only. Never return or log the
  // affiliate list or individual user's personal data.
  const result = await read("/affiliates?company_id=" + encodeURIComponent(companyId) + "&first=1");
  const affiliateRead = !!result && Array.isArray(result.data);
  checks.push({ label: "affiliate_read", ok: affiliateRead, code: affiliateRead ? "VERIFIED" : "UNVERIFIED" });
  if (!affiliateRead) owned = false;

  // Read the connected merchant's own plan catalog to determine whether
  // checkout-policy IDs are outdated. This is an optional diagnostic and
  // NEVER changes commissions, subscriptions, plan IDs, or live configuration.
  let catalog: WhopPlanCatalog = {
    status: "READ_UNAVAILABLE",
    candidates: { core: null, enterprise: null },
  };
  const companyPlans: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  let catalogComplete = false;
  for (let page = 0; page < 6; page++) {
    // Whop documents company_id as the only required list argument.
    // Omit optional paging limits for the first request to avoid relying
    // on an undocumented maximum or account-specific limit.
    const params = new URLSearchParams({ company_id: companyId });
    if (cursor) params.set("after", cursor);
    const listResult = await read("/plans?" + params.toString());
    if (!listResult || !Array.isArray(listResult.data) ||
        !listResult.page_info || typeof listResult.page_info !== "object") break;
    if (listResult.data.some(item => !item || typeof item !== "object" || Array.isArray(item))) break;
    companyPlans.push(...listResult.data as Record<string, unknown>[]);
    const pageInfo = listResult.page_info as Record<string, unknown>;
    if (pageInfo.has_next_page === false) {
      catalogComplete = true;
      break;
    }
    const next = pageInfo.end_cursor;
    if (pageInfo.has_next_page !== true || typeof next !== "string" ||
        !next || next === cursor) break;
    cursor = next;
  }
  if (catalogComplete) {
    const candidates = { core: null as string | null, enterprise: null as string | null };
    let ambiguous = false;
    for (const plan of AFFILIATE_PLANS) {
      const possible = companyPlans.filter(value => {
        const company = value.company;
        const product = value.product;
        if (!company || typeof company !== "object" || Array.isArray(company) ||
            (company as Record<string, unknown>).id !== companyId ||
            !product || typeof product !== "object" || Array.isArray(product)) return false;
        const productTitle = (product as Record<string, unknown>).title;
        if (typeof productTitle !== "string") return false;
        const title = productTitle.toLowerCase();
        return title.includes("frameleads") && title.includes(plan.key) &&
          value.plan_type === "renewal" &&
          value.currency === "usd" && value.renewal_price === plan.price &&
          value.initial_price === 0 && value.release_method === "buy_now" &&
          value.visibility !== "archived" &&
          typeof value.id === "string" && /^plan_[a-zA-Z0-9]+$/.test(value.id);
      });
      if (possible.length > 1) ambiguous = true;
      if (possible.length === 1) candidates[plan.key] = possible[0].id as string;
    }
    catalog = {
      status: ambiguous ? "AMBIGUOUS" :
        candidates.core || candidates.enterprise ? "MATCH_FOUND" : "NO_MATCH",
      candidates,
    };
  }

  // A plan can fail the configured-ID checks even when a suitable replacement
  // is found. Never convert discovery alone into merchantVerified=true.
  return {
    connected: authorized,
    merchantVerified: owned && checks.length === AFFILIATE_PLANS.length + 1 &&
      checks.every(check => check.ok),
    rewardsWriteTested: false,
    checks,
    catalog,
  };
}
