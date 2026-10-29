/**
 * Pure input/security rules for the private browser → Landing → Brand Brain
 * affiliate consent bridge. Creating consent is always a deliberate POST,
 * never a passive referral page view or generic marketing acceptance.
 */
export const DIRECT_AFFILIATE_ACTOR_COOKIE = "__Host-frameleads-direct-affiliate-actor";
const hex64 = /^[a-f0-9]{64}$/;
const codePattern = /^[A-Za-z0-9_-]{1,64}$/;

export type DirectConsentRequest =
  | { action: "accept"; affiliateCode: string }
  | { action: "withdraw" };

export function parseDirectConsentRequest(raw: unknown): DirectConsentRequest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  if (data.action === "accept" && Object.keys(data).length === 2
    && typeof data.affiliateCode === "string" && codePattern.test(data.affiliateCode))
    return { action: "accept", affiliateCode: data.affiliateCode };
  if (data.action === "withdraw" && Object.keys(data).length === 1)
    return { action: "withdraw" };
  return null;
}

export function isValidDirectActorCookie(value: unknown): value is string {
  return typeof value === "string" && hex64.test(value);
}

export function directConsentBrowserGate(env: Record<string, string | undefined>): boolean {
  return env.VERCEL_ENV === "preview"
    && env.WHOP_ENVIRONMENT === "sandbox"
    && env.FRAMELEADS_DIRECT_AFFILIATE_CONSENT_ENDPOINT_ENABLED === "true";
}

export function directInitializeBrowserGate(env: Record<string, string | undefined>): boolean {
  return directConsentBrowserGate(env)
    && env.FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED === "true"
    && env.FRAMELEADS_DIRECT_AFFILIATE_RATE_LIMIT_APPROVED === "true"
    && env.FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED === "true"
    && env.AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"
    && env.AFFILIATE_CONSENT_EVIDENCE_ENABLED === "true"
    && env.WHOP_AFFILIATE_CHECKOUT_ENABLED === "true";
}

export function validateDirectBrowserOrigin(
  requestUrl: string, origin: string | null,
  fetchSite: string | null, intent: string | null,
): boolean {
  try {
    const url = new URL(requestUrl);
    return url.protocol === "https:"
      && origin === url.origin
      && fetchSite === "same-origin"
      && intent === "affiliate-direct-v1";
  } catch { return false; }
}
