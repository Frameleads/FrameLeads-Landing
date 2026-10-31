import { NextResponse } from "next/server";
import { AFFILIATE_NATIVE_COOKIE, nativeAffiliateEmbedEnabled, sealAffiliateNativeSession } from "../../../affiliate-native-session";
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
    // A server-validated Whop configuration can use the native Elements checkout
    // only through an encrypted host-only capability; never via ?a= or a URL ID.
    if (verified.affiliateLinked && nativeAffiliateEmbedEnabled(process.env) && payload
      && typeof payload === "object" && !Array.isArray(payload)) {
      const response = payload as Record<string, unknown>;
      const configId = response.embeddedSessionId;
      const planId = response.planId;
      if (typeof configId === "string" && /^ch_[A-Za-z0-9]+$/.test(configId)
        && typeof planId === "string") {
        const token = sealAffiliateNativeSession({
          offer: plan, environment, planId,
          checkoutConfigurationId: configId, hostedFallback: verified.url,
        }, process.env.FRAMELEADS_AFFILIATE_NATIVE_COOKIE_KEY);
        if (token) {
          const native = NextResponse.redirect(new URL(`/checkout/affiliate/${plan.toLowerCase()}`, request.url), 303);
          native.headers.set("Set-Cookie", `${AFFILIATE_NATIVE_COOKIE}=${token}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`);
          native.headers.set("Cache-Control", "no-store");
          native.headers.set("Referrer-Policy", "no-referrer");
          return native;
        }
      }
    }
    // Missing/disabled native session keeps the provider-created *attributed*
    // checkout URL; never substitute the generic uncredited plan checkout.
    const output = NextResponse.redirect(verified.url, 303);
    output.headers.set("Cache-Control", "no-store");
    output.headers.set("Referrer-Policy", "no-referrer");
    return output;
  } catch { return fail("unavailable"); }
}
