import { AFFILIATE_PLANS } from "../../../../affiliate-native.ts";
import { inspectWhopMerchantReadOnly } from "../../../../affiliate-native-readiness.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (value: Record<string, unknown>, status: number) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" },
  });

/**
 * Restricted to this specific Vercel Preview branch. Does not enroll anyone,
 * read applicant data, send emails, create rewards, or touch Production code.
 * Vercel Authentication must remain enabled for Preview deployments.
 */
export async function POST(request: Request) {
  const env = process.env;
  if (env.VERCEL_ENV !== "preview" ||
      env.VERCEL_GIT_COMMIT_REF !== "feat/whop-native-affiliate-preview-20261112" ||
      env.AFFILIATE_NATIVE_PROVIDER_READONLY_PROBE_ENABLED !== "true") {
    return json({ ok: false, code: "PROBE_DISABLED" }, 404);
  }
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (origin !== new URL(request.url).origin ||
      (site !== null && site !== "same-origin" && site !== "none")) {
    return json({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  }
  const companyId = env.AFFILIATE_WHOP_COMPANY_ID;
  const apiKey = env.AFFILIATE_WHOP_API_KEY;
  if (env.WHOP_ENVIRONMENT !== "production" ||
      env.AFFILIATE_CORE_PLAN_ID !== AFFILIATE_PLANS[0].planId ||
      env.AFFILIATE_ENTERPRISE_PLAN_ID !== AFFILIATE_PLANS[1].planId ||
      !companyId || !/^biz_[A-Za-z0-9]+$/.test(companyId) ||
      !apiKey) {
    return json({ ok: false, code: "PROVIDER_CREDENTIALS_OR_PLAN_IDS_NOT_CONFIGURED" }, 503);
  }

  const result = await inspectWhopMerchantReadOnly(
    companyId,
    apiKey,
  );
  return json({
    ok: result.merchantVerified,
    connected: result.connected,
    merchantVerified: result.merchantVerified,
    rewardsWriteTested: false,
    checks: result.checks,
    catalog: result.catalog,
    identity: result.identity,
  }, result.merchantVerified ? 200 : 503);
}
