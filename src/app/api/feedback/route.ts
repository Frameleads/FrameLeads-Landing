import { createHmac } from "node:crypto";
import { deriveFeedbackContext, parseFeedbackPayload } from "../../../feedback-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SUPABASE_RPC = "https://campgoqhyvniokwvjvtb.supabase.co/rest/v1/rpc/accept_website_feedback";
const MAX_BODY_BYTES = 8192;

function json(payload: Record<string, unknown>, status: number, extra: Record<string, string> = {}) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

export async function POST(request: Request): Promise<Response> {
  // Fail closed until schema, privacy disclosure, retention job, rate-limit
  // tests and server-only credentials are reviewed and configured.
  if (process.env.FEEDBACK_COLLECTION_ENABLED !== "true") {
    return json({ error: "Feedback collection is not yet available." }, 503);
  }
  const secret = process.env.FEEDBACK_SUPABASE_SECRET_KEY;
  const hmacSecret = process.env.FEEDBACK_RATE_HMAC_SECRET;
  if (!secret || !hmacSecret || hmacSecret.length < 32) {
    return json({ error: "Feedback collection is temporarily unavailable." }, 503);
  }
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (!origin || origin !== new URL(request.url).origin || (site && site !== "same-origin")) {
    return json({ error: "Request origin not allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Expected JSON." }, 415);
  }
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declaredSize) || declaredSize > MAX_BODY_BYTES) {
    return json({ error: "Feedback is too long." }, 413);
  }

  let parsed: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return json({ error: "Feedback is too long." }, 413);
    parsed = JSON.parse(body);
  } catch {
    return json({ error: "Invalid feedback request." }, 400);
  }
  const payload = parseFeedbackPayload(parsed);
  if (!payload) return json({ error: "Select an option or describe your concern." }, 400);

  const { source_page, plan_context } = deriveFeedbackContext(
    request.url,
    request.headers.get("referer"),
    payload.plan_context
  );

  // x-vercel-forwarded-for is supplied by the trusted hosting edge.
  // Do not accept client-supplied x-forwarded-for as a substitute.
  const edgeIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "missing-edge-ip";
  const fingerprint = createHmac("sha256", hmacSecret)
    .update(`${new Date().toISOString().slice(0, 10)}:${edgeIp}`)
    .digest("hex");

  try {
    const response = await fetch(SUPABASE_RPC, {
      method: "POST",
      headers: {
        apikey: secret,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        p_reason: payload.reason,
        p_message: payload.optional_message,
        p_source_page: source_page,
        p_plan_context: plan_context,
        p_fingerprint: fingerprint,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) {
      // Never log or return a sensitive provider body, secret, or visitor content.
      return json({ error: "Feedback could not be saved. Please try again." }, 503);
    }
    const result: unknown = await response.json();
    if (result === "stored") return json({ saved: true }, 201);
    if (result === "rate_limited") {
      return json({ error: "Please try again later." }, 429, { "Retry-After": "3600" });
    }
    if (result === "invalid") return json({ error: "Invalid feedback request." }, 400);
    return json({ error: "Feedback could not be saved." }, 503);
  } catch {
    return json({ error: "Feedback is temporarily unavailable." }, 503);
  }
}

export function GET() {
  return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
}
