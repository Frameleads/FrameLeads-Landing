import {
  liveConfig, readEmailConfirmationToken, registerVerifiedAffiliate, NativeWhopError,
} from "../../../../affiliate-native.ts";

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

  let token: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 1800) return reply("BODY_TOO_LARGE", 413);
    const parsed: unknown = JSON.parse(body);
    token = parsed && typeof parsed === "object" && !Array.isArray(parsed) && "token" in parsed ? parsed.token : null;
  } catch { return reply("INVALID_TOKEN", 400); }

  const applicant = typeof token === "string" ? readEmailConfirmationToken(token, config.emailTokenKey) : null;
  if (!applicant) return reply("EXPIRED_OR_INVALID_TOKEN", 400);

  let links: { core: string; enterprise: string };
  try {
    links = await registerVerifiedAffiliate(applicant.email, config.companyId, config.apiKey);
  } catch (error) {
    const code = error instanceof NativeWhopError ? error.code : "PROVIDER_UNAVAILABLE";
    console.error(JSON.stringify({ event: "affiliate_native_enrollment_blocked", code }));
    return reply("ENROLLMENT_NEEDS_REVIEW", 503);
  }

  // Never send affiliate links to the browser. Only the verified address
  // receives its two provider-generated links via transactional email.
  try {
    const message = [
      "Hi " + applicant.firstName + ",",
      "",
      "Your FrameLeads affiliate registration is ready.",
      "Your Whop-generated links:",
      "",
      "Core ($149/month) — 30% recurring on eligible payments:",
      links.core,
      "",
      "Enterprise ($499/month) — 30% recurring on eligible payments:",
      links.enterprise,
      "",
      "Recurring commission applies to eligible subscription renewals while the referral qualifies.",
      "You can manage referrals in your Whop affiliate dashboard.",
      "",
      "FrameLeads",
    ].join("\n");
    const sent = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
      headers: { Authorization: "Bearer " + config.emailKey, "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({
        from: { email: config.emailFrom, name: "FrameLeads" },
        to: [{ email: applicant.email, name: applicant.firstName + " " + applicant.lastName }],
        subject: "Your FrameLeads affiliate links",
        text: message,
      }),
    });
    if (!sent.ok) return reply("ENROLLED_EMAIL_DELIVERY_PENDING", 503);
  } catch { return reply("ENROLLED_EMAIL_DELIVERY_PENDING", 503); }

  return Response.json({ ok: true, code: "AFFILIATE_ENROLLED" }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
