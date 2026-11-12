import { AFFILIATE_PLANS } from "./affiliate-native.ts";

type ProviderCheck = { label: string; ok: boolean; code: string };
export type WhopReadiness = { connected: boolean; merchantVerified: boolean; rewardsWriteTested: false; checks: ProviderCheck[] };

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
        const code = response.status === 401 ? "INVALID_CREDENTIAL" : response.status === 403
          ? "INSUFFICIENT_PERMISSIONS" : response.status === 404 ? "NOT_FOUND"
          : response.status === 429 ? "PROVIDER_RATE_LIMIT" : "PROVIDER_ERROR";
        checks.push({ label: path.includes("/plans/") ? "plan" : "affiliate_read", ok: false, code });
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
    const valid = object.id === plan.planId && owner === companyId &&
      object.plan_type === "renewal" && object.currency === "usd" &&
      object.renewal_price === plan.price && object.initial_price === 0 &&
      object.visibility !== "archived" && object.release_method === "buy_now";
    checks.push({ label: plan.key, ok: valid, code: valid ? "VERIFIED" : "MERCHANT_OR_PLAN_MISMATCH" });
    if (!valid) owned = false;
  }

  // This verifies affiliate READ permission only. Never return or log the
  // affiliate list or individual user's personal data.
  const result = await read("/affiliates?company_id=" + encodeURIComponent(companyId) + "&first=1");
  const affiliateRead = !!result && Array.isArray(result.data);
  checks.push({ label: "affiliate_read", ok: affiliateRead, code: affiliateRead ? "VERIFIED" : "UNVERIFIED" });
  if (!affiliateRead) owned = false;

  return {
    connected: authorized,
    merchantVerified: owned && checks.length === AFFILIATE_PLANS.length + 1 &&
      checks.every(check => check.ok),
    rewardsWriteTested: false,
    checks,
  };
}
