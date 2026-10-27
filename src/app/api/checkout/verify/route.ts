import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";
import { auditContinuationBridgeEnabled, brandBrainIngestUrl, CHECKOUT_SESSION_COOKIE_NAME } from "../../../../affiliate-checkout-return";

/** One-time email token -> HttpOnly host-only capability. No token in query/logs. */
export async function POST(request: Request) {
  const respond = (status: number, error?: string) =>
    NextResponse.json(error ? { ok: false, error } : { ok: true }, { status, headers: { "Cache-Control": "no-store" } });
  if (!auditContinuationBridgeEnabled(process.env)) return respond(503, "UNAVAILABLE");
  if (request.headers.get("origin") !== new URL(request.url).origin) return respond(403, "INVALID");
  let body: unknown;
  try { body = await request.json(); } catch { return respond(400, "INVALID"); }
  if (!body || typeof body !== "object" || Array.isArray(body)
      || Object.keys(body).join(",") !== "token") return respond(400, "INVALID");
  const token = (body as { token: unknown }).token;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return respond(400, "INVALID");
  const base = brandBrainIngestUrl(process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET);
  if (!base) return respond(503, "UNAVAILABLE");
  try {
    const oidc = await getVercelOidcToken();
    const upstream = await fetch(new URL("/api/marketing/checkout/verify", base), {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc },
      body: JSON.stringify({ token }),
    });
    if (!upstream.ok) return respond(upstream.status === 410 ? 410 : 503, upstream.status === 410 ? "EXPIRED" : "UNAVAILABLE");
    const result: unknown = await upstream.json();
    const capability = result && typeof result === "object" && "sessionToken" in result ? result.sessionToken : null;
    if (typeof capability !== "string" || !/^[a-f0-9]{64}$/.test(capability)) return respond(503, "UNAVAILABLE");
    const output = respond(200);
    output.headers.set("Set-Cookie", `${CHECKOUT_SESSION_COOKIE_NAME}=${capability}; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`);
    return output;
  } catch { return respond(503, "UNAVAILABLE"); }
}
