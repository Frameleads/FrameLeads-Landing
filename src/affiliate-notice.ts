/**
 * Sandbox-only affiliate purpose notice. The owner approved the wording and
 * proposed retention schedule for isolated testing, NOT for public release.
 *
 * The canonical SHA-256 covers heading + LF + checkbox label + LF + details,
 * UTF-8 bytes, with NO URL and NO surrounding UI markup.
 */
export const SANDBOX_AFFILIATE_NOTICE_VERSION = "affiliate-sandbox-2026-11-v1";
export const SANDBOX_AFFILIATE_NOTICE_HEADING = "Credit a referring partner (optional)";
export const SANDBOX_AFFILIATE_NOTICE_CHECKBOX =
  "Allow FrameLeads to remember my referral for up to 30 days so the partner who sent me here may receive a commission if I purchase.";
export const SANDBOX_AFFILIATE_NOTICE_DETAILS =
  "If you arrived through a partner link and agree, FrameLeads records the referring partner's code, a pseudonymous browser/session identifier, your consent time, and any qualifying purchase association for up to 30 days. We share the referral and necessary purchase confirmation with Whop, our checkout and affiliate-payment provider, to verify whether the partner earns a one-time commission. You do not pay extra for this. This choice is optional and separate from analytics and advertising. Declining it will not prevent you from buying FrameLeads. You can withdraw your consent in Privacy settings; withdrawal stops new affiliate attribution, but does not erase a lawfully completed purchase or already-earned commission. Payment, security and legally required financial records may be held longer under a separate lawful basis.";
export const SANDBOX_AFFILIATE_NOTICE_CANONICAL = [
  SANDBOX_AFFILIATE_NOTICE_HEADING,
  SANDBOX_AFFILIATE_NOTICE_CHECKBOX,
  SANDBOX_AFFILIATE_NOTICE_DETAILS,
].join("\n");
export const SANDBOX_AFFILIATE_NOTICE_SHA256 =
  "4676bd52419fe08e5a9d185ca2cf0900e87e6435f8f008d99f022bb7ee3d7139";
