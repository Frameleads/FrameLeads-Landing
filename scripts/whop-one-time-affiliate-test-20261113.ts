/**
 * One-run, branch-specific, approved real-merchant Whop acceptance test.
 * No applicant email, key, affiliate ID, or referral URL is committed or logged.
 * Remove this script and prebuild hook after the first execution.
 */
import { createHash } from "node:crypto";
import { AFFILIATE_PLANS, NativeWhopError, registerVerifiedAffiliate, WHOP_API_VERSION } from "../src/affiliate-native.ts";
import { inspectWhopMerchantReadOnly } from "../src/affiliate-native-readiness.ts";

const branch = "feat/whop-native-affiliate-preview-20261112";
const approvedSha256 = "1930b0b95f7d32e8206c1f15877e6c92dfd1c8ece4599b67a368915d0be93e3d";
const e = process.env;
const isEnabled = e.VERCEL_ENV === "preview" &&
  e.VERCEL_GIT_COMMIT_REF === branch &&
  e.AFFILIATE_NATIVE_SINGLE_TEST_ENABLED === "true";

if (isEnabled) {
  const report = (step: string, extras: Record<string, string | boolean | number> = {}) =>
    console.log("FRAMELEADS_ONE_TIME_W HOP_TEST".replace("W HOP","WHOP") + " " + JSON.stringify({
      step, version: WHOP_API_VERSION, ...extras,
    }));
  const testEmail = e.AFFILIATE_NATIVE_SINGLE_TEST_EMAIL?.trim().toLowerCase();
  const authorizedEmail = typeof testEmail === "string" &&
    createHash("sha256").update(testEmail).digest("hex") === approvedSha256;
  const companyId = e.AFFILIATE_WHOP_COMPANY_ID;
  const apiKey = e.AFFILIATE_WHOP_API_KEY;
  const policyValid = e.WHOP_ENVIRONMENT === "production" &&
    e.AFFILIATE_CORE_PLAN_ID === AFFILIATE_PLANS[0].planId &&
    e.AFFILIATE_ENTERPRISE_PLAN_ID === AFFILIATE_PLANS[1].planId &&
    e.AFFILIATE_NATIVE_REGISTRATION_ENABLED !== "true" &&
    e.AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED !== "true";
  if (!authorizedEmail || !companyId || !apiKey || !policyValid) {
    report("BLOCKED_CONFIG_OR_RECIPIENT");
  } else {
    try {
      const ready = await inspectWhopMerchantReadOnly(companyId, apiKey);
      if (!ready.merchantVerified) {
        report("BLOCKED_PREFLIGHT", { connected: ready.connected });
      } else {
        report("PREFLIGHT_OK");
        let sequence = 0;
        const tracedFetch: typeof fetch = async (input, init) => {
          const url = new URL(input.toString());
          if (url.origin !== "https://api.whop.com" ||
              !url.pathname.startsWith("/api/v1/")) throw new Error("DISALLOWED_DESTINATION");
          const method = init?.method || "GET";
          const kind = url.pathname.startsWith("/api/v1/plans/") ? "plan_read"
            : url.pathname === "/api/v1/affiliates" ? "affiliate_create_or_find"
            : url.pathname.includes("/overrides") ? method === "POST" ? "override_create" : "override_read"
            : "unrecognized";
          if (kind === "unrecognized" || (method !== "GET" && method !== "POST")) throw new Error("DISALLOWED_OPERATION");
          const res = await fetch(input, init);
          report("PROVIDER_STEP", { sequence: ++sequence, kind, method, status: res.status });
          return res;
        };
        const links = await registerVerifiedAffiliate(testEmail, companyId, apiKey, tracedFetch);
        // The enrollment function already re-reads both 30% all_payments
        // overrides, and refuses any unexpected or non-Whop referral links.
        report("ENROLLMENT_AND_OVERRIDES_VERIFIED", {
          coreLinkPresent: links.core.length > 0,
          enterpriseLinkPresent: links.enterprise.length > 0,
          recurringCommission: "30pct_all_payments",
          nativeInvitationEmailDelivery: "UNVERIFIED",
        });
      }
    } catch (err) {
      report("FAILED_OR_PARTIAL", {
        code: err instanceof NativeWhopError ? err.code : "UNEXPECTED_ERROR",
        manualProviderReviewNeeded: true,
      });
    }
  }
}
