import { createHash } from "node:crypto";
import {
  liveConfig, previewAllowedEmail, readEmailConfirmationToken, registerVerifiedAffiliate, NativeWhopError,
} from "../../../../affiliate-native.ts";
import { queueAffiliateWelcomeEmail, AffiliateMailError } from "../../../../affiliate-native-email.ts";

export const runtime = "nodejs";
const reply = (code: string, status: number) =>
  Response.json({ ok: false, code }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (origin !== new URL(request.url).origin || (site && site !== "same-origin" && site !== "none")) {
    return reply("ORIGIN_REJECTED", 403);
  }
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return reply("JSON_REQUIRED", 415);
  if (Number(request.headers.get("content-length") ?? "0") > 1800) return reply("BODY_TOO_LARGE", 413);
  const config = liveConfig(process.env);
  if (!config) return reply("NOT_LIVE", 503);
  if (config.mode === "preview_e2e") {
    const url = new URL(request.url);
    if (url.protocol !== "https:" || !/^frameleads-landing-[a-z0-9-]+\.vercel\.app$/.test(url.hostname)) {
      return reply("TEST_ACCESS_DENIED", 403);
    }
  }

  let token: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 1800) return reply("BODY_TOO_LARGE", 413);
    const parsed: unknown = JSON.parse(body);
    token = parsed && typeof parsed === "object" && !Array.isArray(parsed) && "token" in parsed ? parsed.token : null;
  } catch { return reply("INVALID_TOKEN", 400); }

  const applicant = typeof token === "string"
    ? readEmailConfirmationToken(token, config.emailTokenKey, Date.now(), config.mode) : null;
  if (!applicant) return reply("EXPIRED_OR_INVALID_TOKEN", 400);
  if (config.mode === "preview_e2e" && !previewAllowedEmail(applicant.email, process.env)) {
    return reply("TEST_ACCESS_DENIED", 403);
  }

  let links: { core: string; enterprise: string };
  try {
    links = await registerVerifiedAffiliate(applicant.email, config.companyId, config.apiKey);
  } catch (error) {
    const code = error instanceof NativeWhopError ? error.code : "PROVIDER_UNAVAILABLE";
    console.error(JSON.stringify({ event: "affiliate_native_enrollment_blocked", code }));
    return reply("ENROLLMENT_NEEDS_REVIEW", 503);
  }

  // The Whop affiliate API creates the relationship but does not guarantee
  // a native email. FrameLeads sends the transactional welcome containing the
  // two independently verified Whop referral links, exclusively to the email
  // address already confirmed by the applicant.
  //
  // Do not include these links in the JSON response or raw provider logs.
  // A queued email is not yet proof of inbox delivery.
  try {
    await queueAffiliateWelcomeEmail(
      applicant,
      links,
      { apiKey: config.emailKey, fromEmail: config.emailFrom },
      fetch,
      "affiliate-welcome-" + createHash("sha256").update(String(token)).digest("hex").slice(0,48),
    );
  } catch (error) {
    const code = error instanceof AffiliateMailError ? error.code : "MAIL_PROVIDER_UNAVAILABLE";
    console.error(JSON.stringify({ event: "affiliate_welcome_email_queue_failed", code }));
    return reply("ENROLLED_EMAIL_DELIVERY_PENDING", 503);
  }

  return Response.json({ ok: true, code: "AFFILIATE_ENROLLED" }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
