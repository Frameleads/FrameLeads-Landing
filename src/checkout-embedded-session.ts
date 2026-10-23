import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived, host-only preview capability. Never accept a checkout session
 * identifier from a public query parameter or unsigned browser state.
 *
 * The provider session ID has already been created and verified by Brand
 * Brain. This cookie only protects its transport between our own server routes.
 */
export const EMBED_SESSION_COOKIE_NAME = "__Host-frameleads-embedded-session";
export const EMBED_SESSION_TTL_SECONDS = 600;

type SessionTier = "core" | "enterprise";
export type VerifiedEmbedSession = {
  sessionId: string;
  tier: SessionTier;
  expiresAt: number;
};

export function embeddedSessionBridgeEnabled(env: Record<string, string | undefined>): boolean {
  return env.FRAMELEADS_EMBED_SESSION_BRIDGE_ENABLED === "true"
    && env.FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED === "true"
    && env.VERCEL_ENV === "preview"
    && env.WHOP_ENVIRONMENT === "sandbox";
}

export function isProviderSessionId(value: unknown): value is string {
  return typeof value === "string" && /^ch_[A-Za-z0-9]{4,120}$/.test(value);
}

function validSecret(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && value.length <= 4096;
}

function digest(encoded: string, secret: string): Buffer {
  return createHmac("sha256", secret).update("frameleads/embedded-whop/session/v1:").update(encoded).digest();
}

/** Only called with a server-verified Whop configuration ID. */
export function sealVerifiedEmbedSession(
  sessionId: unknown, tier: SessionTier, secret: unknown, now = Date.now(),
): string | null {
  if (!isProviderSessionId(sessionId) || !validSecret(secret)
    || (tier !== "core" && tier !== "enterprise") || !Number.isFinite(now)) return null;
  const payload: VerifiedEmbedSession = {
    sessionId, tier, expiresAt: Math.floor(now / 1000) + EMBED_SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return encoded + "." + digest(encoded, secret).toString("base64url");
}

export function readVerifiedEmbedSession(
  token: unknown, tier: SessionTier, secret: unknown, now = Date.now(),
): VerifiedEmbedSession | null {
  if (typeof token !== "string" || token.length > 768 || !validSecret(secret) || !Number.isFinite(now)) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;
  const provided = Buffer.from(parts[1], "base64url");
  const expected = digest(parts[0], secret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  let payload: unknown;
  try { payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); }
  catch { return null; }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Partial<VerifiedEmbedSession>;
  const expiresAt = value.expiresAt;
  if (!isProviderSessionId(value.sessionId) || value.tier !== tier
    || typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt)
    || expiresAt <= Math.floor(now / 1000)
    || expiresAt > Math.floor(now / 1000) + EMBED_SESSION_TTL_SECONDS) return null;
  return { sessionId: value.sessionId, tier, expiresAt };
}

/** Protect the state-changing Audit continuation even on a sandbox preview. */
export function sameOriginCheckoutPost(requestUrl: string, origin: string | null): boolean {
  if (!origin) return false;
  try {
    const request = new URL(requestUrl);
    const supplied = new URL(origin);
    return supplied.origin === request.origin && supplied.username === "" && supplied.password === ""
      && supplied.pathname === "/" && supplied.search === "" && supplied.hash === "";
  } catch { return false; }
}
