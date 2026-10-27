/**
 * Server-side contract for the email-verified Audit checkout bridge.
 * Never use raw ?a= or client supplied Whop URLs/plan IDs to create affiliate credit.
 */
export type CheckoutOffer = "CORE" | "ENTERPRISE";
export type CheckoutEnvironment = "production" | "sandbox";
const CURRENT_PLANS: Record<CheckoutOffer, string> = {
  CORE: "plan_GQTDPXnvijugf",
  ENTERPRISE: "plan_uGDGf5WKW7hlE",
};
const BRANDED_PATHS: Record<CheckoutOffer, string> = {
  CORE: "/checkout/core",
  ENTERPRISE: "/checkout/enterprise",
};
export const CHECKOUT_SESSION_COOKIE_NAME = "__Host-frameleads-checkout";

export function validateCheckoutReturn(
  input: unknown,
  offer: CheckoutOffer,
  environment: CheckoutEnvironment,
  sandboxCorePlanId?: string,
): { url: string; affiliateLinked: boolean } | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  if (data.environment !== environment || typeof data.purchaseUrl !== "string" ||
      data.purchaseUrl.length > 2048 || typeof data.affiliateLinked !== "boolean") return null;
  const expectedPlan = environment === "production" ? CURRENT_PLANS[offer] :
    offer === "CORE" && sandboxCorePlanId && /^plan_[A-Za-z0-9]+$/.test(sandboxCorePlanId) ? sandboxCorePlanId : null;
  if (!expectedPlan || data.planId !== expectedPlan) return null;
  let target: URL;
  try { target = new URL(data.purchaseUrl); } catch { return null; }
  if (target.protocol !== "https:" || target.username || target.password || target.hash ||
      target.search || target.port) return null;

  if (!data.affiliateLinked && environment === "production") {
    if (target.origin !== "https://frameleads.io" || target.pathname !== BRANDED_PATHS[offer]) return null;
    // No user/referral data is attached to the native checkout URL.
    return { url: target.toString(), affiliateLinked: false };
  }
  // All affiliate-bearing checkouts must be created by the trusted backend and
  // returned as a Whop-owned checkout-configuration URL. No generic plan URL.
  const allowedHost = environment === "production"
    ? target.hostname === "whop.com" || target.hostname === "www.whop.com"
    : target.hostname === "sandbox.whop.com";
  if (!allowedHost || !/^\/checkout\/ch_[A-Za-z0-9]+\/?$/.test(target.pathname)) return null;
  if (data.affiliateLinked && (typeof data.attemptId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(data.attemptId))) return null;
  return { url: target.toString(), affiliateLinked: data.affiliateLinked };
}

/** Only the trusted configured server endpoint may receive checkout capabilities. */
export function brandBrainIngestUrl(url: string | undefined, secret: string | undefined): URL | null {
  if (!url || !secret || secret.length < 32 || /\s/.test(secret)) return null;
  try {
    const result = new URL(url);
    if (result.protocol !== "https:" || !!result.username || !!result.password || !!result.search || !!result.hash ||
        !!result.port || result.pathname !== "/api/marketing/audit-lead/ingest") return null;
    return result;
  } catch { return null; }
}

/** Separate explicit release gate; false by default even when checkout is live. */
export function auditContinuationBridgeEnabled(values: Record<string,string|undefined>): boolean {
  return values.FRAMELEADS_AFFILIATE_CONTINUATION_BRIDGE_ENABLED === "true" &&
    values.AUDIT_CHECKOUT_CONTINUATION_ENABLED === "true" &&
    ((values.VERCEL_ENV === "production" && values.WHOP_ENVIRONMENT === "production") ||
     (values.VERCEL_ENV === "preview" && values.WHOP_ENVIRONMENT === "sandbox"));
}
