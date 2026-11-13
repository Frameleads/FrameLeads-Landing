import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Native Whop affiliate signup. This intentionally does NOT use the older
 * consent/checkout-attribution bridge or its Supabase tables.
 *
 * Commercial policy: 30% on ALL qualifying subscription payments, Core ($149) and Enterprise
 * ($499). The possible $99/$299 and 25% future offer is NOT active.
 */
// Pin Whop's original stable contract. New API keys default to newer dated
// schemas, where Plans replaced company_id/company with account_id/account.
// Without this explicit pin, a valid production merchant produces misleading
// COMPANY_MISMATCH and a 400 when GET /plans is queried with company_id.
// The Stable Affiliates API still documents company_id and per-plan overrides.
// https://docs.whop.com/developer/api/versioning
export const WHOP_API_VERSION = "2025-01-01";
export const AFFILIATE_COMMISSION_PERCENT = 30;
export const AFFILIATE_PLANS = [
  { key: "core", label: "Core", planId: "plan_GQTDPXnvijugf", price: 149 },
  { key: "enterprise", label: "Enterprise", planId: "plan_uGDGf5WKW7hlE", price: 499 },
] as const;

export type AffiliateApplicant = {
  firstName: string;
  lastName: string;
  email: string;
};

export function validateApplicant(input: unknown): AffiliateApplicant | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  if (typeof data.firstName !== "string" || typeof data.lastName !== "string" ||
      typeof data.email !== "string") return null;
  const firstName = data.firstName.trim().normalize("NFC");
  const lastName = data.lastName.trim().normalize("NFC");
  const email = data.email.trim().toLowerCase();
  if (![firstName, lastName].every(name =>
    name.length >= 1 && name.length <= 70 && !/[\p{Cc}<>]/u.test(name))) return null;
  if (email.length > 254 || !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return { firstName, lastName, email };
}

export type AffiliateMode = "preview" | "live" | "disabled";
export function affiliateMode(env: Record<string, string | undefined>): AffiliateMode {
  if (env.VERCEL_ENV === "preview") return "preview";
  // The live switch is intentionally two-key, and a valid production provider
  // configuration is a separate requirement before ANY Whop call.
  if (env.VERCEL_ENV === "production" &&
      env.AFFILIATE_NATIVE_REGISTRATION_ENABLED === "true" &&
      env.AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED === "true") return "live";
  return "disabled";
}

export function liveConfig(env: Record<string, string | undefined>) {
  if (affiliateMode(env) !== "live" || env.WHOP_ENVIRONMENT !== "production" ||
      !/^biz_[A-Za-z0-9]+$/.test(env.AFFILIATE_WHOP_COMPANY_ID ?? "") ||
      !env.AFFILIATE_WHOP_API_KEY ||
      !/^[0-9a-f]{64}$/i.test(env.AFFILIATE_EMAIL_TOKEN_KEY ?? "") ||
      !env.AFFILIATE_MAILERSEND_API_KEY ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.AFFILIATE_MAIL_FROM ?? "") ||
      !env.AFFILIATE_TURNSTILE_SECRET ||
      !env.NEXT_PUBLIC_AFFILIATE_TURNSTILE_SITE_KEY ||
      env.AFFILIATE_CORE_PLAN_ID !== AFFILIATE_PLANS[0].planId ||
      env.AFFILIATE_ENTERPRISE_PLAN_ID !== AFFILIATE_PLANS[1].planId) return null;
  return {
    companyId: env.AFFILIATE_WHOP_COMPANY_ID!,
    apiKey: env.AFFILIATE_WHOP_API_KEY!,
    emailTokenKey: env.AFFILIATE_EMAIL_TOKEN_KEY!,
    emailKey: env.AFFILIATE_MAILERSEND_API_KEY!,
    emailFrom: env.AFFILIATE_MAIL_FROM!,
    turnstileSecret: env.AFFILIATE_TURNSTILE_SECRET!,
  };
}

type TokenPayload = AffiliateApplicant & { expiresAt: number; purpose: "frameleads-affiliate-email-v1" };
function tokenKey(hex: string): Buffer {
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("INVALID_TOKEN_KEY");
  return Buffer.from(hex, "hex");
}
export function createEmailConfirmationToken(applicant: AffiliateApplicant, key: string, now = Date.now()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(key), iv);
  const payload: TokenPayload = { ...applicant, purpose: "frameleads-affiliate-email-v1", expiresAt: now + 20 * 60_000 };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
export function readEmailConfirmationToken(token: string, key: string, now = Date.now()): AffiliateApplicant | null {
  if (typeof token !== "string" || token.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const bytes = Buffer.from(token, "base64url");
    if (bytes.length < 32) return null;
    const decipher = createDecipheriv("aes-256-gcm", tokenKey(key), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const data = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8")) as TokenPayload;
    if (data.purpose !== "frameleads-affiliate-email-v1" ||
        !Number.isFinite(data.expiresAt) || now > data.expiresAt || data.expiresAt - now > 20 * 60_000) return null;
    return validateApplicant(data);
  } catch {
    return null;
  }
}

type Fetcher = typeof fetch;
type WhopOverride = {
  id?: string; plan_id?: string; commission_type?: string;
  commission_value?: number; applies_to_payments?: string;
  checkout_direct_link?: string | null; product_direct_link?: string | null;
};
export type NativeAffiliateLinks = { core: string; enterprise: string };
export class NativeWhopError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function safeWhopLink(input: unknown): string | null {
  if (typeof input !== "string") return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.hostname !== "whop.com" ||
        url.username || url.password || url.hash || !url.pathname.startsWith("/")) return null;
    return url.toString();
  } catch { return null; }
}
function matchesOverride(value: WhopOverride, planId: string): boolean {
  return value.plan_id === planId && value.commission_type === "percentage" &&
    value.commission_value === AFFILIATE_COMMISSION_PERCENT &&
    value.applies_to_payments === "all_payments";
}
export async function registerVerifiedAffiliate(
  email: string,
  companyId: string,
  apiKey: string,
  send: Fetcher = fetch,
): Promise<NativeAffiliateLinks> {
  if (!/^biz_[A-Za-z0-9]+$/.test(companyId) || !apiKey ||
      !validateApplicant({ firstName: "X", lastName: "X", email })) throw new NativeWhopError("CONFIG_OR_IDENTITY_INVALID");

  const base = "https://api.whop.com/api/v1";
  const request = async (path: string, method: "GET" | "POST", body?: object): Promise<Record<string, unknown>> => {
    let response: Response;
    try {
      response = await send(base + path, {
        method,
        headers: { Authorization: "Bearer " + apiKey, "Api-Version-Date": WHOP_API_VERSION, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
    } catch { throw new NativeWhopError("PROVIDER_UNAVAILABLE"); }
    if (!response.ok) {
      const code = response.status === 403 ? "PROVIDER_WRITE_PERMISSION_DENIED"
        : response.status === 401 ? "PROVIDER_AUTHORIZATION_INVALID"
        : response.status === 400 ? "PROVIDER_BAD_REQUEST"
        : response.status === 404 ? "PROVIDER_NOT_FOUND"
        : response.status === 422 ? "PROVIDER_INPUT_REJECTED"
        : response.status === 429 ? "PROVIDER_RATE_LIMITED"
        : response.status >= 500 ? "PROVIDER_SERVER_ERROR"
        : "PROVIDER_REJECTED";
      throw new NativeWhopError(code);
    }
    let result: unknown;
    try { result = await response.json(); } catch { throw new NativeWhopError("PROVIDER_INVALID_RESPONSE"); }
    if (!isRecord(result)) throw new NativeWhopError("PROVIDER_INVALID_RESPONSE");
    return result;
  };

  // Refuse a plan-price mismatch rather than silently applying 30% after a
  // possible $99/$299 repricing. The future 25% change needs separate approval.
  for (const plan of AFFILIATE_PLANS) {
    const actual = await request("/plans/" + plan.planId, "GET");
    const owner = actual.company;
    if (actual.id !== plan.planId || actual.plan_type !== "renewal" ||
        actual.currency !== "usd" || actual.renewal_price !== plan.price ||
        actual.initial_price !== 0 || !isRecord(owner) || owner.id !== companyId) {
      throw new NativeWhopError("PROVIDER_PLAN_POLICY_MISMATCH");
    }
  }

  const affiliate = await request("/affiliates", "POST", { company_id: companyId, user_identifier: email });
  const owner = affiliate.company;
  if (typeof affiliate.id !== "string" || !/^aff_[A-Za-z0-9]+$/.test(affiliate.id) ||
      !isRecord(owner) || owner.id !== companyId) throw new NativeWhopError("PROVIDER_IDENTITY_MISMATCH");
  const affiliateId = affiliate.id;

  const listOverrides = async (): Promise<WhopOverride[]> => {
    const list: WhopOverride[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const url = "/affiliates/" + encodeURIComponent(affiliateId) + "/overrides?first=50&override_type=standard" +
        (cursor ? "&after=" + encodeURIComponent(cursor) : "");
      const response = await request(url, "GET");
      if (!Array.isArray(response.data) || !isRecord(response.page_info)) throw new NativeWhopError("PROVIDER_INVALID_RESPONSE");
      list.push(...response.data.filter(isRecord) as WhopOverride[]);
      if (response.page_info.has_next_page !== true) return list;
      const next = response.page_info.end_cursor;
      if (typeof next !== "string" || !next || next === cursor) throw new NativeWhopError("PROVIDER_PAGINATION_INVALID");
      cursor = next;
    }
    throw new NativeWhopError("PROVIDER_PAGINATION_LIMIT");
  };

  let overrides = await listOverrides();
  for (const plan of AFFILIATE_PLANS) {
    const existing = overrides.filter(override => override.plan_id === plan.planId);
    if (existing.some(override => !matchesOverride(override, plan.planId)) || existing.length > 1) {
      throw new NativeWhopError("EXISTING_REWARD_CONFLICT");
    }
    if (existing.length === 0) {
      const created = await request("/affiliates/" + encodeURIComponent(affiliateId) + "/overrides", "POST", {
        id: affiliateId, plan_id: plan.planId, override_type: "standard",
        commission_type: "percentage", commission_value: AFFILIATE_COMMISSION_PERCENT,
        applies_to_payments: "all_payments",
      });
      if (!matchesOverride(created as WhopOverride, plan.planId)) throw new NativeWhopError("PROVIDER_REWARD_MISMATCH");
      overrides = await listOverrides();
    }
  }
  const links: string[] = [];
  for (const plan of AFFILIATE_PLANS) {
    const selected = overrides.filter(override => override.plan_id === plan.planId);
    const link = selected.length === 1 && matchesOverride(selected[0], plan.planId)
      ? safeWhopLink(selected[0].checkout_direct_link) : null;
    if (!link) throw new NativeWhopError("PROVIDER_LINK_UNVERIFIED");
    links.push(link);
  }
  return { core: links[0], enterprise: links[1] };
}
