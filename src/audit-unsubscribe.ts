const PUBLIC_ORIGIN = 'https://frameleads.io';
const BRAND_BRAIN_INGEST_PATH = '/api/marketing/audit-lead/ingest';
const BRAND_BRAIN_UNSUBSCRIBE_PATH = '/api/marketing/audit-nurture/unsubscribe';
const CAPABILITY = /^[a-f0-9]{64}$/;

const headers = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

export function isUnsubscribeCapability(value: unknown): value is string {
  return typeof value === 'string' && CAPABILITY.test(value);
}

export function publicUnsubscribeUrl(token: string, oneClick = false): string {
  if (!isUnsubscribeCapability(token)) throw new Error('Invalid unsubscribe link.');
  return `${PUBLIC_ORIGIN}${oneClick ? '/api/audit-nurture/unsubscribe' : '/unsubscribe'}?token=${token}`;
}

function getToken(request: Request): string | null {
  const params = new URL(request.url).searchParams;
  const token = params.get('token');
  return params.getAll('token').length === 1 && isUnsubscribeCapability(token) ? token : null;
}

function response(message: string, status: number, contentType = 'text/plain; charset=utf-8') {
  return new Response(message, { status, headers: { ...headers, 'Content-Type': contentType } });
}

async function boundedBody(request: Request, limit: number): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error('Request body too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function renderUnsubscribePage(request: Request): Response {
  const token = getToken(request);
  if (!token) return response('Invalid unsubscribe link.', 400);
  const action = `/api/audit-nurture/unsubscribe?token=${token}`;
  return response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Unsubscribe | FrameLeads</title></head><body style="margin:0;min-height:100vh;background:#1A1A1A;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif"><main style="box-sizing:border-box;max-width:620px;margin:8vh auto;padding:0 20px"><section style="overflow:hidden;border:1px solid #383838;border-radius:16px;background:#242424"><div style="height:3px;background:#FF5A1F"></div><div style="padding:36px 32px"><p style="margin:0 0 30px;font-size:18px;font-weight:bold;letter-spacing:2px">FRAMELEADS</p><p style="margin:0 0 12px;color:#888888;font:12px/1.5 monospace;letter-spacing:1px">EMAIL PREFERENCES</p><h1 style="margin:0 0 14px;font-size:25px;line-height:1.3">Unsubscribe from Reply Workflow Audit emails</h1><p style="margin:0 0 28px;color:#888888;line-height:1.6">Confirm below to stop receiving these emails.</p><form method="post" action="${action}"><button type="submit" style="border:1px solid #FF5A1F;border-radius:11px;background:#FF5A1F;padding:13px 22px;color:#FFFFFF;font-size:15px;font-weight:bold;cursor:pointer">Unsubscribe</button></form></div></section></main></body></html>`, 200, 'text/html; charset=utf-8');
}

export type OidcTokenProvider = () => Promise<string>;
export type Fetcher = typeof fetch;

export async function forwardUnsubscribe(request: Request, getOidcToken: OidcTokenProvider, fetcher: Fetcher = fetch): Promise<Response> {
  const token = getToken(request);
  if (!token) return response('Invalid unsubscribe link.', 400);

  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType && contentType !== 'application/x-www-form-urlencoded') return response('Unsupported request.', 415);
  let body = '';
  try { body = await boundedBody(request, 1024); } catch { return response('Invalid request.', 400); }
  if (body !== '' && body !== 'List-Unsubscribe=One-Click') return response('Invalid request.', 400);

  const ingestUrl = process.env.BRAND_BRAIN_AUDIT_INGEST_URL;
  if (!ingestUrl) return response('Unsubscribe is temporarily unavailable.', 503);

  let target: URL;
  try {
    target = new URL(ingestUrl);
    if (target.protocol !== 'https:' || target.hostname !== 'brandbrain-pi.vercel.app' || target.port || target.username || target.password
      || target.pathname !== BRAND_BRAIN_INGEST_PATH || target.search || target.hash) return response('Unsubscribe is temporarily unavailable.', 503);
    target.pathname = BRAND_BRAIN_UNSUBSCRIBE_PATH;
    target.search = `?token=${token}`;
  } catch { return response('Unsubscribe is temporarily unavailable.', 503); }

  let oidcToken: string;
  try { oidcToken = await getOidcToken(); } catch { return response('Unsubscribe is temporarily unavailable.', 503); }
  if (typeof oidcToken !== 'string' || oidcToken.length < 1 || oidcToken.length > 12000) return response('Unsubscribe is temporarily unavailable.', 503);

  let upstream: Response;
  try {
    upstream = await fetcher(target, {
      method: 'POST', redirect: 'error', cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-vercel-trusted-oidc-idp-token': oidcToken,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
  } catch { return response('Unsubscribe is temporarily unavailable.', 503); }

  if (upstream.status === 200) {
    if (body === 'List-Unsubscribe=One-Click') return response('Unsubscribed.', 200);
    return new Response(null, { status: 303, headers: { ...headers, Location: '/unsubscribe/success' } });
  }
  if (upstream.status === 400) return response('Invalid unsubscribe link.', 400);
  if (upstream.status === 415) return response('Unsupported request.', 415);
  return response('Unsubscribe is temporarily unavailable.', 503);
}
