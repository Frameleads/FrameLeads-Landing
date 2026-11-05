import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { DIRECT_AFFILIATE_ACTOR_COOKIE } from "./direct-affiliate-actor";

const hex64 = /^[a-f0-9]{64}$/;
const lifetimeSeconds = 3600;

export type ValidDirectActorSession = {
  cookieValue: string;
  actorScopeHash: string;
  issuedAt: number;
};

function signingKey(key: string | undefined): Buffer | null {
  return key && hex64.test(key) ? Buffer.from(key, "hex") : null;
}

/** Server-generated random actor + HMAC. Nothing is minted on a passive view. */
export function issueDirectActorSession(
  key: string | undefined, nowSeconds = Math.floor(Date.now() / 1000),
): ValidDirectActorSession | null {
  const secret = signingKey(key);
  if (!secret || !Number.isSafeInteger(nowSeconds)) return null;
  const raw = randomBytes(32).toString("hex");
  const body = `v1.${raw}.${nowSeconds}`;
  const mac = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  return {
    cookieValue: `${body}.${mac}`,
    actorScopeHash: createHash("sha256").update(raw, "hex").digest("hex"),
    issuedAt: nowSeconds,
  };
}

/** Refuse forged, replayed-after-expiry and malformed browser cookies. */
export function readDirectActorSession(
  cookie: string | undefined, key: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1000),
): ValidDirectActorSession | null {
  const secret = signingKey(key);
  if (!secret || !cookie || cookie.length > 250 || !Number.isSafeInteger(nowSeconds)) return null;
  const fields = cookie.split(".");
  if (fields.length !== 4 || fields[0] !== "v1"
    || !hex64.test(fields[1]) || !hex64.test(fields[3])
    || !/^\d{10,11}$/.test(fields[2])) return null;
  const issuedAt = Number(fields[2]);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > nowSeconds
    || issuedAt + lifetimeSeconds <= nowSeconds) return null;

  const expected = createHmac("sha256", secret)
    .update(`${fields[0]}.${fields[1]}.${fields[2]}`, "utf8").digest();
  const received = Buffer.from(fields[3], "hex");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) return null;
  return {
    cookieValue: cookie,
    actorScopeHash: createHash("sha256").update(fields[1], "hex").digest("hex"),
    issuedAt,
  };
}

export function directActorCookieHeader(value: string, maxAge = lifetimeSeconds): string {
  return `${DIRECT_AFFILIATE_ACTOR_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
