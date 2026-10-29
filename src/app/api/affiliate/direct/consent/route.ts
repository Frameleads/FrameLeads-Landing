import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";
import {
  DIRECT_AFFILIATE_ACTOR_COOKIE,
  directConsentBrowserGate,
  parseDirectConsentRequest,
  validateDirectBrowserOrigin,
} from "../../../../../direct-affiliate-actor";
import {
  directActorCookieHeader,
  issueDirectActorSession,
  readDirectActorSession,
} from "../../../../../direct-affiliate-actor-session";
import { brandBrainIngestUrl } from "../../../../../affiliate-checkout-return";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };
const respond = (status: number, state: string) =>
  NextResponse.json({ status: state }, { status, headers: noStore });

function existingCookie(request: Request): string | undefined {
  const match = request.headers.get("cookie")?.split(";").map(v => v.trim())
    .find(v => v.startsWith(`${DIRECT_AFFILIATE_ACTOR_COOKIE}=`));
  return match?.slice(DIRECT_AFFILIATE_ACTOR_COOKIE.length + 1);
}

/**
 * Buyer must explicitly click partner accept or withdrawal. The untrusted
 * browser sends the code only *after* the choice, never on passive pageview.
 * A signed server-issued actor cookie is the only long-lived session value.
 *
 * This handler is default OFF, Preview/Sandbox only and needs an authenticated
 * Brand Brain receipt RPC; without approval it cannot write consent.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!directConsentBrowserGate(process.env)) return respond(503, "UNAVAILABLE");
  if (!validateDirectBrowserOrigin(
    request.url, request.headers.get("origin"),
    request.headers.get("sec-fetch-site"), request.headers.get("x-frameleads-intent"),
  )) return respond(403, "INVALID");

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    return respond(415, "INVALID");
  let text: string;
  try { text = await request.text(); } catch { return respond(400, "INVALID"); }
  if (!text || text.length > 256) return respond(400, "INVALID");
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return respond(400, "INVALID"); }
  const parsed = parseDirectConsentRequest(raw);
  if (!parsed) return respond(400, "INVALID");

  if (parsed.action === "accept" && (process.env.AFFILIATE_REFERRAL_PRIVACY_APPROVED !== "true"
    || process.env.AFFILIATE_CONSENT_EVIDENCE_ENABLED !== "true"
    || process.env.AFFILIATE_CONSENT_RATE_LIMIT_VERIFIED !== "true"))
    return respond(503, "UNAVAILABLE");

  const key = process.env.FRAMELEADS_DIRECT_AFFILIATE_ACTOR_SIGNING_KEY;
  const existing = readDirectActorSession(existingCookie(request), key);
  const actor = parsed.action === "accept" ? existing ?? issueDirectActorSession(key) : existing;
  if (!actor) return respond(parsed.action === "withdraw" ? 410 : 503, "UNAVAILABLE");

  const base = brandBrainIngestUrl(
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET,
  );
  if (!base) return respond(503, "UNAVAILABLE");
  try {
    const oidc = await getVercelOidcToken();
    const upstream = await fetch(new URL("/api/marketing/direct-affiliate/consent", base), {
      method: "POST", cache: "no-store", redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc,
      },
      body: JSON.stringify({
        action: parsed.action, actorScopeHash: actor.actorScopeHash,
        ...(parsed.action === "accept" ? { affiliateCode: parsed.affiliateCode } : {}),
      }),
    });
    if (!upstream.ok) return respond(503, "UNAVAILABLE");
    const payload: unknown = await upstream.json();
    const status = payload && typeof payload === "object" && "status" in payload ? payload.status : null;
    if (status !== (parsed.action === "accept" ? "ACCEPTED" : "WITHDRAWN"))
      return respond(503, "UNAVAILABLE");

    const output = respond(200, status);
    output.headers.set("Set-Cookie", parsed.action === "accept"
      ? directActorCookieHeader(actor.cookieValue)
      : directActorCookieHeader("", 0));
    return output;
  } catch { return respond(503, "UNAVAILABLE"); }
}
