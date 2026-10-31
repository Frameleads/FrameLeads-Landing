import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";
import {
  DIRECT_AFFILIATE_ACTOR_COOKIE,
  directInitializeBrowserGate,
  validateDirectBrowserOrigin,
} from "../../../../../direct-affiliate-actor";
import { readDirectActorSession } from "../../../../../direct-affiliate-actor-session";
import { prepareDirectAffiliateHandoff } from "../../../../../direct-affiliate-handoff";
import { brandBrainIngestUrl } from "../../../../../affiliate-checkout-return";
import { AFFILIATE_NATIVE_COOKIE } from "../../../../../affiliate-native-session";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };
const respond = (status: number, state: string) =>
  NextResponse.json({ status: state }, { status, headers: noStore });

/** A direct buyer never needs an Audit token or raw affiliate query parameter. */
export async function POST(request: Request): Promise<NextResponse> {
  if (!directInitializeBrowserGate(process.env)) return respond(503, "UNAVAILABLE");
  if (!validateDirectBrowserOrigin(
    request.url, request.headers.get("origin"),
    request.headers.get("sec-fetch-site"), request.headers.get("x-frameleads-intent"),
  )) return respond(403, "INVALID");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    return respond(415, "INVALID");
  let body: string;
  try { body = await request.text(); } catch { return respond(400, "INVALID"); }
  if (!body || body.length > 80) return respond(400, "INVALID");
  let parsed: unknown;
  try { parsed = JSON.parse(body); } catch { return respond(400, "INVALID"); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
    || Object.keys(parsed).length !== 1 || !("plan" in parsed)
    || parsed.plan !== "CORE") return respond(400, "INVALID");

  const session = request.headers.get("cookie")?.split(";").map(x => x.trim())
    .find(x => x.startsWith(`${DIRECT_AFFILIATE_ACTOR_COOKIE}=`));
  const sessionCookie = session?.slice(DIRECT_AFFILIATE_ACTOR_COOKIE.length + 1);
  const actor = readDirectActorSession(
    sessionCookie, process.env.FRAMELEADS_DIRECT_AFFILIATE_ACTOR_SIGNING_KEY,
  );
  if (!actor) return respond(410, "EXPIRED");

  const base = brandBrainIngestUrl(
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET,
  );
  if (!base) return respond(503, "UNAVAILABLE");
  const nonceHash = createHash("sha256").update(randomBytes(32)).digest("hex");
  try {
    const oidc = await getVercelOidcToken();
    const upstream = await fetch(new URL("/api/marketing/direct-affiliate/initialize", base), {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc,
      },
      body: JSON.stringify({
        plan: "CORE", nonceHash, actorScopeHash: actor.actorScopeHash,
      }),
    });
    if (!upstream.ok) return respond(503, "UNAVAILABLE");
    const raw: unknown = await upstream.json();
    const handoff = prepareDirectAffiliateHandoff(raw, process.env);
    if (!handoff) return respond(503, "UNAVAILABLE");

    const output = NextResponse.json({
      status: "READY", next: handoff.redirectPath,
    }, { headers: { ...noStore, "Referrer-Policy": "no-referrer" } });
    output.headers.set("Set-Cookie",
      `${AFFILIATE_NATIVE_COOKIE}=${handoff.cookieValue}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`);
    return output;
  } catch { return respond(503, "UNAVAILABLE"); }
}
