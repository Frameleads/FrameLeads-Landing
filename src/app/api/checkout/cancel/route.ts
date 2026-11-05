import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";
import { auditContinuationBridgeEnabled, brandBrainIngestUrl, CHECKOUT_SESSION_COOKIE_NAME } from "../../../../affiliate-checkout-return";

/** Clear browser capability even when upstream cancellation is unavailable. */
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "INVALID" }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.headers.set("Set-Cookie", `${CHECKOUT_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  response.headers.set("Cache-Control", "no-store");
  const entry = request.headers.get("cookie")?.split(";").map(v => v.trim())
    .find(v => v.startsWith(`${CHECKOUT_SESSION_COOKIE_NAME}=`));
  const token = entry?.slice(CHECKOUT_SESSION_COOKIE_NAME.length + 1);
  const base = brandBrainIngestUrl(process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET);
  if (!auditContinuationBridgeEnabled(process.env) || !token || !/^[a-f0-9]{64}$/.test(token) || !base) return response;
  try {
    const oidc = await getVercelOidcToken();
    await fetch(new URL("/api/marketing/checkout/cancel", base), {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5_000),
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc },
      body: JSON.stringify({ sessionToken: token }),
    });
  } catch { /* Capability already cleared. */ }
  return response;
}
