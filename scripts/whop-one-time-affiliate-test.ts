/**
 * One-time, operator-approved integration acceptance test.
 * THIS IS A TEMPORARY SCRIPT. It must be removed immediately after its first
 * Preview build invocation, along with the two temporary Preview variables.
 *
 * Intended Whop mutation scope: exactly one user identified by the email
 * whose SHA256 matches the owner-approved test digest. The only permitted
 * changes are create/find that affiliate and Core/Enterprise 30% all_payments
 * per-affiliate overrides. No global rates, prices, checkout, buyer purchases,
 * production Vercel settings, or other users may be changed.
 *
 * Whop may send an invitation on affiliate creation, but its API docs do not
 * guarantee that. This test intentionally does NOT send a separate email or
 * claim delivery. That must be verified from the recipient inbox.
 */
import { createHash } from "node:crypto";
import { AFFILIATE_PLANS, NativeWhopError, registerVerifiedAffiliate, WHOP_API_VERSION } from "../src/affiliate-native.ts";
import { inspectWhopMerchantReadOnly } from "../src/affiliate-native-readiness.ts";

const BRANCH = "feat/whop-native-affiliate-preview-20261112";
const APPROVED_EMAIL_DIGEST = "1930b0b95f7d32e8206c1f15877e6c92dfd1c8ece4599b67a368915d0be93e3d";
const e = process.env;
const enabled =
  e.VERCEL_ENV === "preview" &&
  e.VERCEL_GIT_COMMIT_REF === BRANCH &&
  e.AFFILIATE_NATIVE_SINGLE_TEST_ENABLED === "true";

if (enabled) {
  const email = e.AFFILIATE_NATIVE_SINGLE_TEST_EMAIL?.trim().toLowerCase();
  const matchesApprovedRecipient =
    typeof email === "string" &&
    createHash("sha256").update(email).digest("hex") === APPROVED_EMAIL_DIGEST;
  const companyId = e.AFFILIATE_WHOP_COMPANY_ID;
  const apiKey = e.AFFILIATE_WHOP_API_KEY;
  const correctPlans = e.WHOP_ENVIRONMENT === "production" &&
    e.AFFILIATE_CORE_PLAN_ID === AFFILIATE_PLANS[0].planId &&
    e.AFFILIATE_ENTERPRISE_PLAN_ID === AFFILIATE_PLANS[1].planId;
  const report = (status: string, details: Record<string, string | boolean> = {}) =>
    console.log("WHOP_ONE_TIME_AFFILIATE_TEST " + JSON.stringify({
      status, apiContract: WHOP_API_VERSION, ...details,
    }));
  if (!matchesApprovedRecipient || !companyId || !apiKey || !correctPlans) {
    report("BLOCKED_INVALID_TEST_SCOPE");
  } else {
    try {
      const ready = await inspectWhopMerchantReadOnly(companyId, apiKey);
      if (!ready.merchantVerified) {
        report("BLOCKED_MERCHANT_NOT_VERIFIED", { writes: false });
      } else {
        report("PREFLIGHT_VERIFIED");
        const links = await registerVerifiedAffiliate(email, companyId, apiKey);
        const safe = [links.core, links.enterprise].every(link => {
          try {
            const url = new URL(link);
            return url.protocol === "https:" &&
              (url.hostname === "whop.com" || url.hostname.endsWith(".whop.com"));
          } catch { return false; }
        });
        report(safe ? "ENROLLED_REWARDS_AND_LINKS_CONFIRMED" : "BLOCKED_LINKS_UNEXPECTED", {
          coreOverride: safe,
          enterpriseOverride: safe,
          commission: "30_percent_recurring",
          nativeInvitationEmail: "unverified",
        });
      }
    } catch (err) {
      const code = err instanceof NativeWhopError ? err.code : "UNEXPECTED_EXCEPTION";
      report("PROVIDER_TEST_FAILED_OR_PARTIAL", {
        errorCode: code,
        partialWritePossible: true,
      });
    }
  }
}
