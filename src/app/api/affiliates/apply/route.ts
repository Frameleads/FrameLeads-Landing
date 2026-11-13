import { createHmac } from "node:crypto";
import {
  affiliateMode, createEmailConfirmationToken, liveConfig, validateApplicant,
} from "../../../../affiliate-native.ts";
import { queueAffiliateVerificationEmail, AffiliateMailError } from "../../../../affiliate-native-email.ts";

export const runtime = "nodejs";
const buckets = new Map<string, { startedAt: number; count: number }>();
const json = (code: string, status: number, extra: Record<string, unknown> = {}) =>
  Response.json({ ok: false, code, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  return origin === new URL(request.url).origin && (!site || site === "same-origin" || site === "none");
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json("ORIGIN_REJECTED", 403);
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return json("JSON_REQUIRED", 415);
  if (Number(request.headers.get("content-length") ?? "0") > 2400) return json("BODY_TOO_LARGE", 413);

  let raw: string;
  try { raw = await request.text(); } catch { return json("INVALID_INPUT", 400); }
  if (Buffer.byteLength(raw) > 2400) return json("BODY_TOO_LARGE", 413);
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return json("INVALID_INPUT", 400);
    input = parsed as Record<string, unknown>;
  } catch { return json("INVALID_INPUT", 400); }

  const applicant = validateApplicant(input);
  if (!applicant || input.agreed !== true || (input.website && input.website !== "")) return json("INVALID_INPUT", 400);

  // An isolated preview can exercise validation and UI without sending mail,
  // contacting Whop, or storing the submitted address.
  if (affiliateMode(process.env) === "preview") {
    return Response.json({ ok: true, mode: "preview" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }

  const config = liveConfig(process.env);
  if (!config) return json("NOT_LIVE", 503);
  if (typeof input.turnstileToken !== "string" || input.turnstileToken.length < 10 || input.turnstileToken.length > 3000) {
    return json("VERIFICATION_REQUIRED", 400);
  }

  // A bounded, best-effort per-instance throttle is NOT a substitute for the
  // separately reviewed distributed rate-limit/abuse control before launch.
  const ip = request.headers.get("x-real-ip") || "unknown";
  const rateKey = createHmac("sha256", config.emailTokenKey).update(ip).digest("hex");
  const now = Date.now();
  const bucket = buckets.get(rateKey);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    if (buckets.size > 1000) buckets.clear();
    buckets.set(rateKey, { startedAt: now, count: 1 });
  } else if (++bucket.count > 3) return json("RATE_LIMITED", 429);

  let verified = false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(9000),
      body: new URLSearchParams({ secret: config.turnstileSecret, response: input.turnstileToken }),
    });
    const result: unknown = await response.json();
    verified = response.ok && Boolean(result && typeof result === "object" && "success" in result && result.success === true);
  } catch { return json("VERIFICATION_UNAVAILABLE", 503); }
  if (!verified) return json("VERIFICATION_FAILED", 403);

  const token = createEmailConfirmationToken(applicant, config.emailTokenKey, now);
  const confirmUrl = "https://frameleads.io/affiliates/confirm#token=" + encodeURIComponent(token);
  try {
    const queued = await queueAffiliateVerificationEmail(
      applicant,
      confirmUrl,
      { apiKey: config.emailKey, fromEmail: config.emailFrom },
    );
    // Resend's returned email ID proves acceptance only. Actual delivery
    // must be checked through Resend Events or the recipient inbox.
    if (!queued.queued) return json("EMAIL_DELIVERY_UNAVAILABLE", 503);
    return Response.json({ ok: true, mode: "verification_sent" }, {
      status: 202, headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const code = error instanceof AffiliateMailError ? error.code : "MAIL_PROVIDER_UNAVAILABLE";
    console.error(JSON.stringify({ event: "affiliate_confirmation_email_error", code }));
    return json("EMAIL_DELIVERY_UNAVAILABLE", 503);
  }
}
