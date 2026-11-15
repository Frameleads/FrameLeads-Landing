import { createHash } from "node:crypto";

// One-off test harness lives ONLY on test/feedback-vercel-credential-gate-20261115.
// It must never be merged into PR #42 or main.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEST_BRANCH = "test/feedback-vercel-credential-gate-20261115";
const PROJECT_REF = "campgoqhyvniokwvjvtb";
const EXPIRY_MS = Date.parse("2026-11-15T18:30:00.000Z");
const MARKER = "fl_vrt_20261115_8fd471c7";
const FINGERPRINT = createHash("sha256").update("synthetic-only:" + MARKER).digest("hex");

function reply(payload: Record<string, unknown>, status: number) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

function isProtectedStaging(request: Request) {
  const host = new URL(request.url).host;
  const deploymentHost = process.env.VERCEL_URL;
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF;
  return Date.now() < EXPIRY_MS
    && process.env.VERCEL_ENV === "production"
    && (!gitRef || gitRef === TEST_BRANCH)
    && Boolean(deploymentHost)
    && deploymentHost!.endsWith("-frameleads.vercel.app")
    && host === deploymentHost
    && request.headers.get("host") === deploymentHost
    && process.env.FEEDBACK_SUPABASE_PROJECT_REF === PROJECT_REF
    && process.env.FEEDBACK_COLLECTION_ENABLED === "false"
    && process.env.FEEDBACK_PRODUCTION_RELEASE_APPROVED === "false"
    && process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED === "false";
}

export function GET(request: Request) {
  if (!isProtectedStaging(request)) return reply({ error: "Not found." }, 404);
  return reply({ ready: true, syntheticOnly: true }, 200);
}

export async function POST(request: Request): Promise<Response> {
  if (!isProtectedStaging(request)) return reply({ error: "Not found." }, 404);
  // Vercel Authentication protects the exact deployment URL. Only the
  // authenticated CI runner may send this deliberate same-origin POST.
  const expectedOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== expectedOrigin
    || !request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "Not allowed." }, 403);
  }
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 128) return reply({ error: "Invalid request." }, 400);
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "Invalid request." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)
    || (body as Record<string, unknown>).purpose !== "approved-synthetic-vercel-test") {
    return reply({ error: "Invalid request." }, 400);
  }
  const secret = process.env.FEEDBACK_SUPABASE_SECRET_KEY;
  const hmac = process.env.FEEDBACK_RATE_HMAC_SECRET;
  if (!secret?.startsWith("sb_secret_") || secret.length < 30
    || !hmac || hmac.length < 32) return reply({ error: "Server not configured." }, 503);

  try {
    const res = await fetch(
      `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/accept_website_feedback`,
      {
        method: "POST",
        headers: { apikey: secret, "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          p_reason: "offer_clarity",
          p_message: "Synthetic Vercel runtime integration test " + MARKER,
          p_source_page: "/checkout/core",
          p_plan_context: "core",
          p_fingerprint: FINGERPRINT
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(6500)
      }
    );
    if (!res.ok) return reply({ saved: false, reason: "provider-error" }, 503);
    const result: unknown = await res.json();
    if (result === "stored") return reply({ saved: true, marker: MARKER }, 201);
    return reply({ saved: false, reason: "unexpected-provider-result" }, 503);
  } catch {
    return reply({ saved: false, reason: "connection-error" }, 503);
  }
}
