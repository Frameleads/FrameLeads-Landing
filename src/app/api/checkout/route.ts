import { NextResponse } from 'next/server';
import { CHECKOUT_SESSION_COOKIE_NAME } from '../../../checkout-session-cookie';
import { embeddedCheckoutPolicy } from '../../../checkout-embed-policy';
import {
  EMBED_SESSION_COOKIE_NAME,
  EMBED_SESSION_TTL_SECONDS,
  embeddedSessionBridgeEnabled,
  sameOriginCheckoutPost,
  sealVerifiedEmbedSession,
} from '../../../checkout-embedded-session';
function brandBrainUrl(): URL | null {
  const raw = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
  if (!raw || !secret || secret.length < 32) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/api/marketing/audit-lead/ingest') return null;
    return url;
  } catch { return null; }
}

function findCookie(request: Request, name: string): string | null {
  const item = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  const value = item?.slice(name.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export async function POST(request: Request) {
  const fail = (state: string, status = 303) => NextResponse.redirect(new URL(`/checkout/continue?state=${encodeURIComponent(state)}`, request.url), status);
  // The existing hosted continuation remains the default. When the optional
  // session bridge is selected, it must be a genuinely authorized Sandbox
  // preview. Never downgrade to a production hosted path on bridge failure.
  const bridgeRequested = process.env.FRAMELEADS_EMBED_SESSION_BRIDGE_ENABLED === 'true';
  if (bridgeRequested && (!embeddedSessionBridgeEnabled(process.env)
    || !sameOriginCheckoutPost(request.url, request.headers.get('origin'))
    || !process.env.FRAMELEADS_EMBED_SESSION_SIGNING_SECRET
    || process.env.FRAMELEADS_EMBED_SESSION_SIGNING_SECRET.length < 32)) return fail('unavailable');
  const sessionToken = findCookie(request, CHECKOUT_SESSION_COOKIE_NAME);
  if (!sessionToken) return fail('expired');
  let form: FormData;
  try { form = await request.formData(); } catch { return fail('invalid'); }
  const plan = form.get('plan');
  if (plan !== 'CORE' && plan !== 'ENTERPRISE') return fail('invalid');
  const target = brandBrainUrl();
  if (!target) return fail('unavailable');
  const secret = process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET!;
  try {
    const response = await fetch(new URL('/api/marketing/checkout/initialize', target).toString(), {
      method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ sessionToken, plan }), signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      const value: unknown = await response.json().catch(() => null);
      const code = value && typeof value === 'object' && 'error' in value && typeof value.error === 'string' ? value.error : 'unavailable';
      return fail(code.toLowerCase(), 303);
    }
    const value: unknown = await response.json();
    const urlValue = value && typeof value === 'object' && 'purchaseUrl' in value ? value.purchaseUrl : null;
    const returnedPlan = value && typeof value === 'object' && 'planId' in value ? value.planId : null;
    const returnedEnvironment = value && typeof value === 'object' && 'environment' in value ? value.environment : null;
    if (typeof urlValue !== 'string') return fail('unavailable');
    const checkoutUrl = new URL(urlValue);
    const environment = process.env.WHOP_ENVIRONMENT ?? 'production';
    if ((environment !== 'production' && environment !== 'sandbox') || returnedEnvironment !== environment) return fail('unavailable');
    const planId = environment === 'sandbox'
      ? plan === 'CORE' ? 'plan_kgrX8LpuAH2Ba' : null
      : plan === 'CORE' ? 'plan_sAEhr77rTrhX4' : 'plan_jdy5Z44fMKMAz';
    const allowedHosts = environment === 'production'
      ? ['whop.com', 'www.whop.com']
      : ['sandbox.whop.com'];
    if (!planId || returnedPlan !== planId || checkoutUrl.protocol !== 'https:' || checkoutUrl.username || checkoutUrl.password
      || !allowedHosts.includes(checkoutUrl.hostname.toLowerCase())) return fail('unavailable');
    if (bridgeRequested) {
      // Sandbox Enterprise has no verified provider plan yet.
      if (plan !== 'CORE') return fail('unavailable');
      const policy = embeddedCheckoutPolicy('core', process.env);
      if (!policy.available || policy.planId !== planId) return fail('unavailable');
      const embeddedSessionId = value && typeof value === 'object' && 'embeddedSessionId' in value
        ? value.embeddedSessionId : null;
      const sealed = sealVerifiedEmbedSession(embeddedSessionId, 'core', process.env.FRAMELEADS_EMBED_SESSION_SIGNING_SECRET);
      if (!sealed) return fail('unavailable');
      const preview = NextResponse.redirect(new URL('/checkout/core', request.url), 303);
      preview.headers.set('Cache-Control', 'no-store');
      preview.cookies.set(EMBED_SESSION_COOKIE_NAME, sealed, {
        secure: true, httpOnly: true, sameSite: 'lax', path: '/',
        maxAge: EMBED_SESSION_TTL_SECONDS,
      });
      return preview;
    }
    const result = NextResponse.redirect(checkoutUrl, 303);
    result.headers.set('Cache-Control', 'no-store');
    return result;
  } catch { return fail('unavailable'); }
}
