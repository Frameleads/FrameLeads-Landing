import { NextResponse } from 'next/server';
import { CHECKOUT_SESSION_COOKIE_NAME } from '../../../../checkout-session-cookie';

export async function POST(request: Request) {
  const item = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${CHECKOUT_SESSION_COOKIE_NAME}=`));
  const token = item?.slice(CHECKOUT_SESSION_COOKIE_NAME.length + 1);
  const result = NextResponse.redirect(new URL('/', request.url), 303);
  result.headers.set('Set-Cookie', `${CHECKOUT_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  result.headers.set('Cache-Control', 'no-store');
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const raw = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
    const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
    if (raw && secret) {
      try {
        const base = new URL(raw);
        if (base.protocol === 'https:' && base.pathname === '/api/marketing/audit-lead/ingest' && !base.username && !base.password) {
          await fetch(new URL('/api/marketing/checkout/cancel', base), { method: 'POST', cache: 'no-store', redirect: 'error', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` }, body: JSON.stringify({ sessionToken: token }), signal: AbortSignal.timeout(5_000) });
        }
      } catch { /* The browser capability is cleared even if server cancellation is unavailable. */ }
    }
  }
  return result;
}
