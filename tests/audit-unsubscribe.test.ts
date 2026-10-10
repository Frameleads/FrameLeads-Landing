import assert from 'node:assert/strict';
import test from 'node:test';
import { forwardUnsubscribe, isUnsubscribeCapability, publicUnsubscribeUrl, renderUnsubscribePage } from '../src/audit-unsubscribe.ts';
import { GET as successPage } from '../src/app/unsubscribe/success/route.ts';

const token = 'a'.repeat(64);
const base = 'https://frameleads.io';

test('public unsubscribe URLs use distinct same-site human and one-click routes', () => {
  assert.equal(publicUnsubscribeUrl(token), `${base}/unsubscribe?token=${token}`);
  assert.equal(publicUnsubscribeUrl(token, true), `${base}/api/audit-nurture/unsubscribe?token=${token}`);
  assert.equal(isUnsubscribeCapability(token), true);
  assert.equal(isUnsubscribeCapability('malformed'), false);
  assert.throws(() => publicUnsubscribeUrl('malformed'));
});

test('human GET renders explicit confirmation and never calls the mutation transport', async () => {
  const page = renderUnsubscribePage(new Request(`${base}/unsubscribe?token=${token}`));
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /Unsubscribe from Reply Workflow Audit emails/);
  assert.match(html, new RegExp(`action="/api/audit-nurture/unsubscribe\\?token=${token}"`));
  assert.match(html, /<button[^>]*>Unsubscribe<\/button>/);
  assert.match(page.headers.get('Cache-Control') ?? '', /no-store/);
  assert.match(page.headers.get('Referrer-Policy') ?? '', /no-referrer/);
  assert.doesNotMatch(html, /vercel\.app|brandbrain/i);
});

test('success page is public-branded and contains no capability or internal host', async () => {
  const page = successPage();
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /FRAMELEADS/);
  assert.match(html, /You're unsubscribed from Reply Workflow Audit emails/);
  assert.doesNotMatch(html, new RegExp(token));
  assert.doesNotMatch(html, /vercel\.app|brandbrain/i);
});

test('confirmation POST uses Trusted Sources OIDC then redirects to a token-free same-site success page', async () => {
  process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest';
  let sentUrl = '';
  let sentInit: RequestInit | undefined;
  const request = new Request(`${base}/api/audit-nurture/unsubscribe?token=${token}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: '' });
  const result = await forwardUnsubscribe(request, async () => 'synthetic-oidc-token', async (url, init) => {
    sentUrl = String(url); sentInit = init; return new Response('provider-private-body', { status: 200 });
  });
  assert.equal(result.status, 303);
  assert.equal(result.headers.get('Location'), '/unsubscribe/success');
  assert.doesNotMatch(result.headers.get('Location') ?? '', /token|brandbrain|vercel/i);
  assert.equal(sentUrl, `https://brandbrain-pi.vercel.app/api/marketing/audit-nurture/unsubscribe?token=${token}`);
  assert.equal(new Headers(sentInit?.headers).get('x-vercel-trusted-oidc-idp-token'), 'synthetic-oidc-token');
  assert.equal(new Headers(sentInit?.headers).get('authorization'), null);
  assert.equal(sentInit?.body, '');
  assert.doesNotMatch(await result.text(), /provider-private-body|brandbrain|vercel/i);
});

test('RFC 8058 one-click POST is proxied and gets a bounded 200 response', async () => {
  process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest';
  let sentBody: unknown;
  const request = new Request(`${base}/api/audit-nurture/unsubscribe?token=${token}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' });
  const result = await forwardUnsubscribe(request, async () => 'synthetic-oidc-token', async (_url, init) => {
    sentBody = init?.body; return new Response('ok', { status: 200 });
  });
  assert.equal(sentBody, 'List-Unsubscribe=One-Click');
  assert.equal(result.status, 200);
  assert.equal(await result.text(), 'Unsubscribed.');
});

test('invalid token, invalid body, and upstream failures return bounded results without exposing internals', async () => {
  const invalid = await forwardUnsubscribe(new Request(`${base}/api/audit-nurture/unsubscribe?token=bad`, { method: 'POST' }), async () => { throw new Error('must not run'); }, async () => { throw new Error('must not run'); });
  assert.equal(invalid.status, 400);
  process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest';
  const badBody = await forwardUnsubscribe(new Request(`${base}/api/audit-nurture/unsubscribe?token=${token}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'other=value' }), async () => 'oidc', async () => { throw new Error('must not run'); });
  assert.equal(badBody.status, 400);
  const oversized = await forwardUnsubscribe(new Request(`${base}/api/audit-nurture/unsubscribe?token=${token}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'x'.repeat(1025) }), async () => 'oidc', async () => { throw new Error('must not run'); });
  assert.equal(oversized.status, 400);
  const failed = await forwardUnsubscribe(new Request(`${base}/api/audit-nurture/unsubscribe?token=${token}`, { method: 'POST' }), async () => 'oidc', async () => new Response('private-upstream-detail', { status: 500 }));
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /private-upstream-detail|brandbrain|vercel/i);
});
