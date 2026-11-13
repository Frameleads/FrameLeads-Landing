/**
 * ONE-TIME Resend transactional-delivery smoke test.
 * Whitelisted recipient only. Preview-only, branch-only, send-only.
 * Delete this script and restore npm prebuild after one attempt.
 * No Whop operations or buyer access. No tokens or email IDs in logs.
 */
import { createHash } from "node:crypto";
const env = process.env;
const expectedBranch = "feat/whop-native-affiliate-preview-20261112";
const requiredDigest = "1930b0b95f7d32e8206c1f15877e6c92dfd1c8ece4599b67a368915d0be93e3d";
const enabled = env.VERCEL_ENV === "preview" &&
  env.VERCEL_GIT_COMMIT_REF === expectedBranch &&
  env.AFFILIATE_RESEND_DELIVERY_TEST_ENABLED === "true";
if (enabled) {
  const recipient = env.AFFILIATE_RESEND_TEST_RECIPIENT?.trim().toLowerCase() ?? "";
  const recipientValid = createHash("sha256").update(recipient).digest("hex") === requiredDigest;
  const sender = env.AFFILIATE_MAIL_FROM;
  const key = env.AFFILIATE_RESEND_API_KEY;
  const safe = recipientValid &&
    sender === "akram@frameleads.io" &&
    typeof key === "string" && key.startsWith("re_") &&
    env.AFFILIATE_NATIVE_REGISTRATION_ENABLED !== "true";
  const report = (status, details = {}) =>
    console.log("FRAMELEADS_RESEND_ONE_TIME_TEST " + JSON.stringify({ status, ...details }));
  if (!safe) {
    report("BLOCKED_CONFIGURATION_OR_RECIPIENT", { sent: false });
  } else {
    const payload = {
      from: "FrameLeads <akram@frameleads.io>",
      to: [recipient],
      subject: "FrameLeads — automated affiliate email delivery test",
      text: "Hello,\n\nThis is the single authorized automated email test for the FrameLeads affiliate program. It was sent through Resend using our verified FrameLeads domain.\n\nNo action is required. Your existing Whop affiliate account and 30% recurring commissions were not changed.\n\nFrameLeads",
      html: "<p>Hello,</p><p>This is the single authorized <strong>automated email delivery test</strong> for the FrameLeads affiliate program, sent through Resend using our verified domain.</p><p>No action is required. Your existing Whop affiliate account and 30% recurring commissions were not changed.</p><p>FrameLeads</p>",
    };
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": "frameleads-affiliate-preview-resend-test-20261113-v1",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
      let accepted = false;
      if (response.ok) {
        try {
          const result = await response.json();
          accepted = typeof result?.id === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.id);
        } catch { /* no provider content logged */ }
      }
      report(accepted ? "ACCEPTED_NOT_YET_DELIVERED" : "PROVIDER_REJECTED", {
        httpStatus: response.status,
        recipientWhitelisted: true,
        actualDelivery: "NOT_YET_VERIFIED",
        whopWrites: 0,
      });
    } catch {
      report("NETWORK_FAILURE", { actualDelivery: "NOT_VERIFIED", whopWrites: 0 });
    }
  }
}
