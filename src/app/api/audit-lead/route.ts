import { hasAuditProxyConfiguration, validateAuditLeadPayload } from "../../../audit.ts";
import { randomUUID } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";

export async function POST(request: Request) {
  const requestId = randomUUID();
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const payload = validateAuditLeadPayload(input);
  if (!payload) return Response.json({ error: "Invalid audit lead payload." }, { status: 400 });
  const url = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  if (!hasAuditProxyConfiguration(url, secret)) return Response.json({ error: "Workflow map delivery is temporarily unavailable." }, { status: 503 });
  let oidcToken: string;
  try {
    oidcToken = await getVercelOidcToken();
    const claims = JSON.parse(Buffer.from(oidcToken.split(".")[1], "base64url").toString("utf8"));
    console.info(JSON.stringify({ event: "audit_bridge_oidc_claims", requestId, iss: claims.iss, aud: claims.aud, owner: claims.owner, owner_id: claims.owner_id, project: claims.project, project_id: claims.project_id, environment: claims.environment }));
  } catch {
    console.error(JSON.stringify({ event: "audit_bridge_oidc_unavailable", requestId }));
    return Response.json({ error: "Workflow map delivery is temporarily unavailable." }, { status: 503 });
  }
  try {
    const upstream = await fetch(url!, { method: "POST", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}`, "x-vercel-trusted-oidc-idp-token": oidcToken }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) {
      console.error(JSON.stringify({ event: "audit_bridge_upstream_rejected", requestId, upstreamStatus: upstream.status, upstreamRequestId: upstream.headers.get("x-request-id") }));
      return Response.json({ error: "Unable to deliver workflow map." }, { status: 502 });
    }
    const result: unknown = await upstream.json();
    if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true) {
      console.error(JSON.stringify({ event: "audit_bridge_invalid_upstream_response", requestId, upstreamStatus: upstream.status, upstreamRequestId: upstream.headers.get("x-request-id") }));
      return Response.json({ error: "Unable to deliver workflow map." }, { status: 502 });
    }
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(JSON.stringify({ event: "audit_bridge_fetch_failed", requestId, errorClass: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "network_or_response" }));
    return Response.json({ error: "Unable to deliver workflow map." }, { status: 502 });
  }
}
