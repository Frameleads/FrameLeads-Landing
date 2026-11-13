/**
 * Preview-only, read-only Whop API contract validation at build time.
 *
 * Why: PR #43 used the 2025 company_id/company API schema without pinning
 * Api-Version-Date. Whop API keys created in 2026 default to a different
 * account_id/account schema, yielding a misleading COMPANY_MISMATCH and 400.
 *
 * This temporary branch-scoped check runs only in the existing protected
 * Vercel Preview and prints sanitized codes. No tokens, emails, company IDs,
 * raw provider payloads, affiliate links or payment data are logged.
 */
import { inspectWhopMerchantReadOnly } from "../src/affiliate-native-readiness.ts";
import { AFFILIATE_PLANS, WHOP_API_VERSION } from "../src/affiliate-native.ts";

const branch = "feat/whop-native-affiliate-preview-20261112";
const env = process.env;
const enabled = env.VERCEL_ENV === "preview" &&
  env.VERCEL_GIT_COMMIT_REF === branch &&
  env.AFFILIATE_NATIVE_PROVIDER_READONLY_PROBE_ENABLED === "true";
if (enabled) {
  const company = env.AFFILIATE_WHOP_COMPANY_ID;
  const key = env.AFFILIATE_WHOP_API_KEY;
  const matches = env.WHOP_ENVIRONMENT === "production" &&
    env.AFFILIATE_CORE_PLAN_ID === AFFILIATE_PLANS[0].planId &&
    env.AFFILIATE_ENTERPRISE_PLAN_ID === AFFILIATE_PLANS[1].planId;
  if (!company || !key || !matches) {
    console.log("WHOP_STABLE_PREVIEW_READONLY " + JSON.stringify({
      contract: WHOP_API_VERSION, result: "CONFIG_INCOMPLETE",
    }));
  } else {
    try {
      const info = await inspectWhopMerchantReadOnly(company, key);
      console.log("WHOP_STABLE_PREVIEW_READONLY " + JSON.stringify({
        contract: WHOP_API_VERSION,
        connected: info.connected,
        merchantVerified: info.merchantVerified,
        checks: info.checks.map(x => ({ label: x.label, code: x.code, reasons: x.reasons })),
        catalog: info.catalog?.status,
        identity: info.identity?.status,
        writes: 0,
      }));
    } catch {
      console.log("WHOP_STABLE_PREVIEW_READONLY " + JSON.stringify({
        contract: WHOP_API_VERSION, result: "CHECK_UNAVAILABLE", writes: 0,
      }));
    }
  }
}
