import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { CheckoutOffer, CheckoutEnvironment } from "./affiliate-checkout-return";

/** Authenticated, encrypted host-only short-lived checkout configuration. No PII/referral code. */
export const AFFILIATE_NATIVE_COOKIE = "__Host-frameleads-affiliate-session";
export type NativeAffiliateSession = {
  version: 1;
  offer: CheckoutOffer;
  environment: CheckoutEnvironment;
  planId: string;
  checkoutConfigurationId: string;
  hostedFallback: string;
  issuedAt: number;
  expiresAt: number;
};

function getKey(secret: string | undefined): Buffer | null {
  return secret && /^[a-f0-9]{64}$/.test(secret) ? Buffer.from(secret, "hex") : null;
}
function validSession(value: NativeAffiliateSession, now: number): boolean {
  if (value.version !== 1 || !["CORE", "ENTERPRISE"].includes(value.offer)
    || !["production", "sandbox"].includes(value.environment)
    || !/^plan_[A-Za-z0-9]+$/.test(value.planId)
    || !/^ch_[A-Za-z0-9]+$/.test(value.checkoutConfigurationId)
    || !Number.isSafeInteger(value.issuedAt) || !Number.isSafeInteger(value.expiresAt)
    || value.issuedAt > now || value.expiresAt <= now
    || value.expiresAt - value.issuedAt > 600_000 || value.issuedAt < now - 600_000) return false;
  try {
    const url = new URL(value.hostedFallback);
    const providerHost = value.environment === "production"
      ? url.hostname === "whop.com" || url.hostname === "www.whop.com"
      : url.hostname === "sandbox.whop.com";
    return providerHost && url.protocol === "https:" && !url.username && !url.password && !url.port
      && !url.hash && !url.search && /^\/checkout\/ch_[A-Za-z0-9]+\/?$/.test(url.pathname);
  } catch { return false; }
}
export function sealAffiliateNativeSession(
  input: Omit<NativeAffiliateSession, "version" | "issuedAt" | "expiresAt">,
  secret: string | undefined,
  now = Date.now(),
): string | null {
  const key = getKey(secret);
  if (!key || !Number.isSafeInteger(now)) return null;
  const session: NativeAffiliateSession = { ...input, version: 1, issuedAt: now, expiresAt: now + 600_000 };
  if (!validSession(session, now)) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from("frameleads/affiliate-native/v1"));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), ciphertext.toString("base64url"), cipher.getAuthTag().toString("base64url")].join(".");
}
export function readAffiliateNativeSession(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): NativeAffiliateSession | null {
  const key = getKey(secret);
  if (!key || !token || token.length > 2800 || !Number.isSafeInteger(now)) return null;
  const [version, iv64, encrypted64, tag64, extra] = token.split(".");
  if (version !== "v1" || extra !== undefined || !iv64 || !encrypted64 || !tag64) return null;
  try {
    const iv = Buffer.from(iv64, "base64url");
    const tag = Buffer.from(tag64, "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(Buffer.from("frameleads/affiliate-native/v1"));
    decipher.setAuthTag(tag);
    const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(encrypted64, "base64url")), decipher.final()]).toString("utf8")) as NativeAffiliateSession;
    return validSession(decoded, now) ? decoded : null;
  } catch { return null; }
}
export function nativeAffiliateEmbedEnabled(values: Record<string,string|undefined>): boolean {
  return values.FRAMELEADS_AFFILIATE_NATIVE_EMBED_ENABLED === "true" &&
    values.FRAMELEADS_AFFILIATE_CONTINUATION_BRIDGE_ENABLED === "true" &&
    values.AUDIT_CHECKOUT_CONTINUATION_ENABLED === "true" &&
    ((values.VERCEL_ENV === "production" && values.WHOP_ENVIRONMENT === "production") ||
     (values.VERCEL_ENV === "preview" && values.WHOP_ENVIRONMENT === "sandbox"));
}
