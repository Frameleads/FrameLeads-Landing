/**
 * Internal-only normalization of the Brand Brain VERIFIED direct-affiliate
 * checkout response. No raw referral code, UI boolean or browser URL can
 * produce a payable Whop session through this function.
 *
 * This prepares a cookie value but does not set cookies or make a payment.
 * Only a trusted, authenticated server-to-server caller may invoke it.
 */
import { validateCheckoutReturn } from "./affiliate-checkout-return";
import { nativeAffiliateEmbedEnabled, sealAffiliateNativeSession } from "./affiliate-native-session";

const CORE_SANDBOX_PLAN = "plan_kgrX8LpuAH2Ba";
const validConfiguration = /^ch_[A-Za-z0-9]+$/;

export type DirectHandoff = {
  cookieValue: string;
  redirectPath: "/checkout/affiliate/core";
  verifiedFallbackUrl: string;
};

/** Returns null until all release gates are expressly enabled. */
export function prepareDirectAffiliateHandoff(
  payload: unknown,
  env: Record<string, string | undefined>,
  now = Date.now(),
): DirectHandoff | null {
  if (env.FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED !== "true"
    || !nativeAffiliateEmbedEnabled(env)
    || env.VERCEL_ENV !== "preview"
    || env.WHOP_ENVIRONMENT !== "sandbox") return null;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const body = payload as Record<string, unknown>;
  const allowed = [
    "affiliateLinked", "planId", "environment", "purchaseUrl",
    "attemptId", "embeddedSessionId",
  ];
  if (Object.keys(body).some(key => !allowed.includes(key))
    || Object.keys(body).length !== allowed.length) return null;
  if (body.affiliateLinked !== true || body.planId !== CORE_SANDBOX_PLAN
    || typeof body.embeddedSessionId !== "string"
    || !validConfiguration.test(body.embeddedSessionId)) return null;

  const verified = validateCheckoutReturn(body, "CORE", "sandbox", CORE_SANDBOX_PLAN);
  if (!verified || !verified.affiliateLinked) return null;
  let checkout: URL;
  try { checkout = new URL(verified.url); } catch { return null; }
  if (checkout.hostname !== "sandbox.whop.com"
    || checkout.pathname.replace(/\/$/, "") !== `/checkout/${body.embeddedSessionId}`) return null;

  const cookieValue = sealAffiliateNativeSession({
    offer: "CORE", environment: "sandbox", planId: CORE_SANDBOX_PLAN,
    checkoutConfigurationId: body.embeddedSessionId,
    hostedFallback: verified.url,
  }, env.FRAMELEADS_AFFILIATE_NATIVE_COOKIE_KEY, now);

  if (!cookieValue) return null;
  return { cookieValue, redirectPath: "/checkout/affiliate/core", verifiedFallbackUrl: verified.url };
}
