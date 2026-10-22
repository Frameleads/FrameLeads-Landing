import { NextResponse } from 'next/server';
import { CHECKOUT_SESSION_COOKIE_NAME } from '../../../../checkout-session-cookie';

function configuredBrandBrainUrl(): URL | null {
  const raw = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  if (!raw || !secret || secret.length < 32) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/api/marketing/audit-lead/ingest') return null;
    return url;
  } catch { return null; }
}

export async function POST(request: Request) {
  const respond = (status: number, error?: string) => NextResponse.json(error ? { ok: false, error } : { ok: true }, { status, headers: { 'Cache-Control': 'no-store' } });
  let body: unknown;
  try { body = await request.json(); } catch { return respond(400, 'INVALID'); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => key !== 'token')) return respond(400, 'INVALID');
  const token = (body as { token?: unknown }).token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return respond(400, 'INVALID');
  const brandBrain = configuredBrandBrainUrl();
  if (!brandBrain) return respond(503, 'UNAVAILABLE');
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET!;
  try {
    const response = await fetch(new URL('/api/marketing/checkout/verify', brandBrain).toString(), {
      method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ token }), signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return respond(response.status === 410 ? 410 : 503, response.status === 410 ? 'EXPIRED' : 'UNAVAILABLE');
    const value: unknown = await response.json();
    const sessionToken = value && typeof value === 'object' && 'sessionToken' in value ? value.sessionToken : null;
    if (typeof sessionToken !== 'string' || !/^[a-f0-9]{64}$/.test(sessionToken)) return respond(503, 'UNAVAILABLE');
    const result = NextResponse.json({ ok: true });
    result.headers.set('Cache-Control', 'no-store');
    result.headers.set('Set-Cookie', `${CHECKOUT_SESSION_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`);
    return result;
  } catch { return respond(503, 'UNAVAILABLE'); }
}
