import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";
import {
  auditContinuationBridgeEnabled, brandBrainIngestUrl, CHECKOUT_SESSION_COOKIE_NAME,
  validateCheckoutReturn, type CheckoutOffer,
} from "../../../affiliate-checkout-return";

/** Server-to-server continuation only. Never accept an affiliate ID from the form. */
export async function POST(request: Request) {
  const fail = (state: string) => NextResponse.redirect(new URL(
    `/checkout/continue?state=${encodeURIComponent(state)}`, request.url), 303);
  if (!auditContinuationBridgeEnabled(process.env)) return fail("unavailable");
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail("invalid");
  const item = request.headers.get("cookie")?.split(";").map(v => v.trim())
    .find(v => v.startsWith(`${CHECKOUT_SESSION_COOKIE_NAME}=`));
  const sessionToken = item?.slice(CHECKOUT_SESSION_COOKIE_NAME.length + 1);
  if (!sessionToken || !/^[a-f0-9]{64}$/.test(sessionToken)) return fail("expired");
  let form: FormData;
  try { form = await request.formData(); } catch { return fail("invalid"); }
  const values = Array.from(form.entries());
  if (values.length !== 1 || values[0][0] !== "plan") return fail("invalid");
  const requested = values[0][1];
  if (requested !== "CORE" && requested !== "ENTERPRISE") return fail("invalid");
  const plan: CheckoutOffer = requested;
  const base = brandBrainIngestUrl(process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET);
  if (!base) return fail("unavailable");
  const environment = process.env.WHOP_ENVIRONMENT;
  if (environment !== "sandbox" && environment !== "production") return fail("unavailable");
  try {
    const oidc = await getVercelOidcToken();
    const response = await fetch(new URL("/api/marketing/checkout/initialize", base), {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12_000),
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc },
      body: JSON.stringify({ sessionToken, plan }),
    });
    if (!response.ok) return fail(response.status === 429 ? "rate_limited" : "unavailable");
    const payload: unknown = await response.json();
    const verified = validateCheckoutReturn(payload, plan, environment, process.env.WHOP_CORE_SANDBOX_PLAN_ID);
    if (!verified) return fail("unavailable");
    const output = NextResponse.redirect(verified.url, 303);
    output.headers.set("Cache-Control", "no-store");
    output.headers.set("Referrer-Policy", "no-referrer");
    return output;
  } catch { return fail("unavailable"); }
}
