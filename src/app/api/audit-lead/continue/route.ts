import { getVercelOidcToken } from "@vercel/oidc";
import { auditContinuationBridgeEnabled, brandBrainIngestUrl } from "../../../../affiliate-checkout-return";

const prospectIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = ["SENT", "NOT_ELIGIBLE", "RATE_LIMITED", "UNAVAILABLE"] as const;

/** The email is issued by Brand Brain only after explicit Audit user action. */
export async function POST(request: Request) {
  const fail = (code: number) => Response.json({ status: "UNAVAILABLE" }, { status: code,
    headers: { "Cache-Control": "no-store" } });
  if (!auditContinuationBridgeEnabled(process.env)) return fail(503);
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail(403);
  let body: unknown;
  try { body = await request.json(); } catch { return fail(400); }
  if (!body || typeof body !== "object" || Array.isArray(body)
    || Object.keys(body).join(",") !== "prospectId") return fail(400);
  const prospectId = (body as { prospectId?: unknown }).prospectId;
  if (typeof prospectId !== "string" || !prospectIdPattern.test(prospectId)) return fail(400);
  const base = brandBrainIngestUrl(process.env.BRAND_BRAIN_AUDIT_INGEST_URL, process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET);
  if (!base) return fail(503);
  try {
    const oidc = await getVercelOidcToken();
    const response = await fetch(new URL("/api/marketing/checkout/continue", base), {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET}`,
        "x-vercel-trusted-oidc-idp-token": oidc },
      body: JSON.stringify({ prospectId }),
    });
    if (!response.ok) return fail(response.status === 429 ? 429 : 503);
    const payload: unknown = await response.json();
    const status = payload && typeof payload === "object" && "status" in payload ? payload.status : null;
    if (typeof status !== "string" || !statuses.includes(status as typeof statuses[number])) return fail(503);
    return Response.json({ status }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(503); }
}
