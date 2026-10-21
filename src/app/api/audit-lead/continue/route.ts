import { randomUUID } from 'node:crypto';
import { getVercelOidcToken } from '@vercel/oidc';
import { hasAuditProxyConfiguration } from '../../../../audit.ts';

const prospectIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const allowedStatuses = ['SENT', 'NOT_ELIGIBLE', 'RATE_LIMITED', 'UNAVAILABLE'] as const;

function failure(requestId: string, status: number) {
  return Response.json({ error: 'Unable to request a secure checkout link.', requestId }, { status, headers: { 'X-Request-Id': requestId } });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return failure(requestId, 403);
  let body: unknown;
  try { body = await request.json(); } catch { return failure(requestId, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1
    || !('prospectId' in body) || typeof body.prospectId !== 'string' || !prospectIdPattern.test(body.prospectId)) return failure(requestId, 400);

  const ingestUrl = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  if (!hasAuditProxyConfiguration(ingestUrl, secret)) return failure(requestId, 503);
  const continuationUrl = new URL(ingestUrl!);
  continuationUrl.pathname = '/api/marketing/checkout/continue';
  let oidcToken: string;
  try { oidcToken = await getVercelOidcToken(); }
  catch { return failure(requestId, 503); }
  try {
    const upstream = await fetch(continuationUrl, {
      method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}`, 'x-vercel-trusted-oidc-idp-token': oidcToken },
      body: JSON.stringify(body),
    });
    const result: unknown = await upstream.json();
    if (!upstream.ok || !result || typeof result !== 'object' || !('status' in result)
      || typeof result.status !== 'string' || !allowedStatuses.includes(result.status as typeof allowedStatuses[number])) return failure(requestId, upstream.status === 429 ? 429 : 503);
    return Response.json({ status: result.status }, { headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
  } catch {
    return failure(requestId, 503);
  }
}
