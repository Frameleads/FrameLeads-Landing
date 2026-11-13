import type { AffiliateApplicant, NativeAffiliateLinks } from "./affiliate-native.ts";

/**
 * Transactional messages are sent by FrameLeads, not Whop. Whop's Create
 * affiliate API creates the relationship but does not promise an email.
 *
 * MailerSend POST /v1/email returns 202 for QUEUED, not DELIVERED.
 * Require its x-message-id to reject fully suppressed recipients.
 * Never log addresses, confirmation tokens, referral links, or provider bodies.
 */
export class AffiliateMailError extends Error {
  constructor(readonly code: string) { super(code); }
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
}

function whopReferralUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname === "whop.com" &&
      !u.username && !u.password && !u.hash;
  } catch { return false; }
}

export type AffiliateMailConfig = { apiKey: string; fromEmail: string };
export type AffiliateQueuedMessage = { queued: true; providerMessageId: string };

async function queueAffiliateEmail(
  applicant: AffiliateApplicant,
  config: AffiliateMailConfig,
  subject: string,
  text: string,
  html: string,
  send: typeof fetch,
): Promise<AffiliateQueuedMessage> {
  if (!config.apiKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fromEmail)) {
    throw new AffiliateMailError("MAIL_NOT_CONFIGURED");
  }
  let response: Response;
  try {
    response = await send("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: config.fromEmail, name: "FrameLeads" },
        to: [{ email: applicant.email, name: applicant.firstName + " " + applicant.lastName }],
        subject,
        text,
        html,
        settings: { track_clicks: false, track_opens: false, track_content: false },
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new AffiliateMailError("MAIL_PROVIDER_UNAVAILABLE");
  }
  if (response.status !== 202) {
    throw new AffiliateMailError(response.status === 422
      ? "MAIL_SENDER_OR_RECIPIENT_INVALID"
      : response.status === 401 || response.status === 403
        ? "MAIL_PROVIDER_UNAUTHORIZED"
        : "MAIL_PROVIDER_REJECTED");
  }
  const messageId = response.headers.get("x-message-id");
  if (!messageId || !/^[a-zA-Z0-9_-]{10,128}$/.test(messageId)) {
    // A 202 without a message ID may mean ALL recipients were suppressed.
    throw new AffiliateMailError("MAIL_NOT_QUEUED");
  }
  // Queued is not delivered; real delivery requires MailerSend activity
  // verification or a confirmed receiving mailbox.
  return { queued: true, providerMessageId: messageId };
}

function emailHtml(title: string, paragraphs: string[], cta?: { label: string; url: string }): string {
  const link = cta ? '<p style="margin:26px 0"><a href="' + escapeHtml(cta.url) +
    '" style="background:#FF5A1F;color:#fff;font-weight:700;padding:13px 22px;border-radius:10px;text-decoration:none">' +
    escapeHtml(cta.label) + '</a></p>' : "";
  return '<!doctype html><html lang="en"><body style="background:#F6F6F6;margin:0;padding:30px 15px;font-family:Arial,sans-serif;color:#242424">' +
    '<div style="background:#fff;border:1px solid #ddd;border-radius:16px;max-width:580px;margin:auto;padding:32px">' +
    '<p style="color:#FF5A1F;font-weight:800;letter-spacing:2px">FRAMELEADS</p>' +
    '<h1 style="font-size:24px">' + escapeHtml(title) + '</h1>' +
    paragraphs.map(p => '<p style="line-height:1.65;overflow-wrap:anywhere">' + escapeHtml(p) + '</p>').join("") +
    link + '<p style="color:#888;font-size:12px">FrameLeads · A BrandFlow Studio company</p></div></body></html>';
}

export async function queueAffiliateVerificationEmail(
  applicant: AffiliateApplicant,
  confirmationUrl: string,
  config: AffiliateMailConfig,
  send: typeof fetch = fetch,
): Promise<AffiliateQueuedMessage> {
  const target = new URL(confirmationUrl);
  if (target.origin !== "https://frameleads.io" || target.pathname !== "/affiliates/confirm" ||
      !/^#token=[A-Za-z0-9_-]+$/.test(target.hash)) throw new AffiliateMailError("CONFIRMATION_URL_INVALID");
  return queueAffiliateEmail(
    applicant,
    config,
    "Confirm your FrameLeads affiliate application",
    "Hi " + applicant.firstName + ",\n\nConfirm your email to join the FrameLeads partner program:\n" +
      confirmationUrl + "\n\nThis link expires in 20 minutes. If you did not apply, ignore this message.\n\nFrameLeads",
    emailHtml("Confirm your email", [
      "Hi " + applicant.firstName + ",",
      "Confirm your email to continue your FrameLeads affiliate application.",
      "This link expires in 20 minutes. If you did not apply, ignore this message.",
    ], { label: "Confirm my email", url: confirmationUrl }),
    send,
  );
}

export async function queueAffiliateWelcomeEmail(
  applicant: AffiliateApplicant,
  links: NativeAffiliateLinks,
  config: AffiliateMailConfig,
  send: typeof fetch = fetch,
): Promise<AffiliateQueuedMessage> {
  if (!whopReferralUrl(links.core) || !whopReferralUrl(links.enterprise)) {
    throw new AffiliateMailError("AFFILIATE_LINKS_INVALID");
  }
  const paragraphs = [
    "Hi " + applicant.firstName + ",",
    "Your FrameLeads affiliate registration is ready. Whop manages your referral tracking and commissions.",
    "Core ($149/month): 30% on eligible initial and recurring payments.\n" + links.core,
    "Enterprise ($499/month): 30% on eligible initial and recurring payments.\n" + links.enterprise,
    "To view your referral dashboard, sign in to Whop and go to Affiliates → Refer buyers → View assets. Read the latest partner guidelines there before promoting.",
  ];
  return queueAffiliateEmail(
    applicant, config, "Your FrameLeads affiliate links",
    paragraphs.join("\n\n") + "\n\nFrameLeads",
    emailHtml("Your affiliate links are ready", paragraphs, { label: "Open Whop", url: "https://whop.com" }),
    send,
  );
}
