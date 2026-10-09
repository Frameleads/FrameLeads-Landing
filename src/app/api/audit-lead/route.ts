import { hasAuditProxyConfiguration, validateAuditLeadPayload } from "../../../audit.ts";
import { randomUUID } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";

type BridgeCode = "AUDIT_BRIDGE_CONFIG" | "AUDIT_BRIDGE_UPSTREAM_AUTH" | "AUDIT_BRIDGE_UPSTREAM_INVALID" | "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE" | "AUDIT_BRIDGE_TIMEOUT";
function bridgeFailure(requestId: string, code: BridgeCode, status: number) {
  const error = status === 503 ? "Workflow map delivery is temporarily unavailable." : "Unable to deliver workflow map.";
  return Response.json({ error, code, requestId }, { status, headers: { "X-Request-Id": requestId, "X-Audit-Bridge-Code": code } });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const payload = validateAuditLeadPayload(input);
  if (!payload) return Response.json({ error: "Invalid audit lead payload." }, { status: 400 });
  const url = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  if (!hasAuditProxyConfiguration(url, secret)) return bridgeFailure(requestId, "AUDIT_BRIDGE_CONFIG", 503);
  let oidcToken: string;
  try {
    oidcToken = await getVercelOidcToken();
  } catch {
    console.error(JSON.stringify({ event: "audit_bridge_oidc_unavailable", requestId }));
    return bridgeFailure(requestId, "AUDIT_BRIDGE_CONFIG", 503);
  }
  try {
    const upstream = await fetch(url!, { method: "POST", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}`, "x-vercel-trusted-oidc-idp-token": oidcToken }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) {
      console.error(JSON.stringify({ event: "audit_bridge_upstream_rejected", requestId, upstreamStatus: upstream.status, upstreamRequestId: upstream.headers.get("x-request-id") }));
      const code = upstream.status === 401 || upstream.status === 403 ? "AUDIT_BRIDGE_UPSTREAM_AUTH"
        : upstream.status === 400 || upstream.status === 413 || upstream.status === 415 || upstream.status === 422 ? "AUDIT_BRIDGE_UPSTREAM_INVALID"
        : "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE";
      return bridgeFailure(requestId, code, upstream.status === 503 ? 503 : 502);
    }
    const result: unknown = await upstream.json();
    if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true) {
      console.error(JSON.stringify({ event: "audit_bridge_invalid_upstream_response", requestId, upstreamStatus: upstream.status, upstreamRequestId: upstream.headers.get("x-request-id") }));
      return bridgeFailure(requestId, "AUDIT_BRIDGE_UPSTREAM_INVALID", 502);
    }
    return Response.json({ success: true }, { status: 201, headers: { "X-Request-Id": requestId } });
  } catch (error) {
    console.error(JSON.stringify({ event: "audit_bridge_fetch_failed", requestId, errorClass: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "network_or_response" }));
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return bridgeFailure(requestId, timeout ? "AUDIT_BRIDGE_TIMEOUT" : "AUDIT_BRIDGE_UPSTREAM_UNAVAILABLE", timeout ? 504 : 502);
  }
}
