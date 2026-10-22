import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { CHECKOUT_SESSION_COOKIE_NAME } from '../src/checkout-session-cookie.ts';
import { embeddedCheckoutPolicy } from '../src/checkout-embed-policy.ts';
import {
  EMBED_SESSION_COOKIE_NAME, EMBED_SESSION_TTL_SECONDS,
  embeddedSessionBridgeEnabled, sameOriginCheckoutPost, sealVerifiedEmbedSession,
} from '../src/checkout-embedded-session.ts';

function loadRoute(path: string) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  const cjsModule = { exports: {} as Record<string, unknown> };
  const response = { redirect: (url: URL | string, status: number) => new Response(null, { status, headers: { location: String(url) } }), json: (body: unknown, init?: ResponseInit) => Response.json(body, init) };
  const context = vm.createContext({
    module: cjsModule, exports: cjsModule.exports, process, Request, Response, FormData, URL, Headers, AbortSignal,
    fetch: globalThis.fetch,
    require: (name: string) => name === 'next/server' ? { NextResponse: response }
      : name.endsWith('checkout-session-cookie') ? { CHECKOUT_SESSION_COOKIE_NAME }
      : name.endsWith('checkout-embed-policy') ? { embeddedCheckoutPolicy }
      : name.endsWith('checkout-embedded-session') ? {
          EMBED_SESSION_COOKIE_NAME, EMBED_SESSION_TTL_SECONDS,
          embeddedSessionBridgeEnabled, sameOriginCheckoutPost, sealVerifiedEmbedSession,
        }
        : (() => { throw new Error(`Unexpected import ${name}`); })(),
  });
  vm.runInContext(code, context);
  return cjsModule.exports.POST as (request: Request) => Promise<Response>;
}

const envKeys = ['WHOP_ENVIRONMENT', 'BRAND_BRAIN_AUDIT_INGEST_URL', 'BRAND_BRAIN_AUDIT_INGEST_SECRET'] as const;

async function withCheckoutFixture(environment: string, response: Record<string, unknown>, requestedPlan = 'CORE') {
  const before = envKeys.map(key => process.env[key]);
  const transport = globalThis.fetch;
  try {
    process.env.WHOP_ENVIRONMENT = environment;
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-preview.vercel.app/api/marketing/audit-lead/ingest';
    process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = 'local-test-secret-that-is-at-least-32-chars';
    globalThis.fetch = async () => Response.json(response);
    const form = new FormData();
    form.set('plan', requestedPlan);
    const request = new Request('https://frameleads-preview.vercel.app/api/checkout', {
      method: 'POST', headers: { cookie: `${CHECKOUT_SESSION_COOKIE_NAME}=${'a'.repeat(64)}` }, body: form,
    });
    return await loadRoute('../src/app/api/checkout/route.ts')(request);
  } finally {
    globalThis.fetch = transport;
    envKeys.forEach((key, index) => before[index] === undefined ? delete process.env[key] : process.env[key] = before[index]!);
  }
}

test('production checkout accepts only the established production plan and host', async () => {
  const response = await withCheckoutFixture('production', {
    purchaseUrl: 'https://whop.com/checkout/ch_production/', planId: 'plan_sAEhr77rTrhX4', environment: 'production',
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://whop.com/checkout/ch_production/');
});

test('verified checkout cookie has browser-enforced __Host- host-only attributes and a bounded lifetime', async () => {
  const before = envKeys.map(key => process.env[key]);
  const transport = globalThis.fetch;
  try {
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-preview.vercel.app/api/marketing/audit-lead/ingest';
    process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = 'local-test-secret-that-is-at-least-32-chars';
    globalThis.fetch = async () => Response.json({ sessionToken: 'b'.repeat(64) });
    const response = await loadRoute('../src/app/api/checkout/verify/route.ts')(new Request('https://frameleads-preview.vercel.app/api/checkout/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'c'.repeat(64) }),
    }));
    const cookie = response.headers.get('set-cookie') ?? '';
    assert.equal(response.status, 200);
    assert.ok(CHECKOUT_SESSION_COOKIE_NAME.startsWith('__Host-'));
    assert.match(cookie, new RegExp(`^${CHECKOUT_SESSION_COOKIE_NAME}=b{64};`));
    assert.match(cookie, /(?:^|;\s*)Path=\//i);
    assert.match(cookie, /(?:^|;\s*)Max-Age=1800(?:;|$)/i);
    assert.match(cookie, /(?:^|;\s*)HttpOnly(?:;|$)/i);
    assert.match(cookie, /(?:^|;\s*)Secure(?:;|$)/i);
    assert.match(cookie, /(?:^|;\s*)SameSite=Lax(?:;|$)/i);
    assert.doesNotMatch(cookie, /(?:^|;)\s*Domain=/i);
    assert.notEqual(CHECKOUT_SESSION_COOKIE_NAME, '__Host_frameleads_checkout');
  } finally {
    globalThis.fetch = transport;
    envKeys.forEach((key, index) => before[index] === undefined ? delete process.env[key] : process.env[key] = before[index]!);
  }
});

test('verification, checkout, and cancellation use the same host-only session cookie and expire it on cancel', async () => {
  const before = envKeys.map(key => process.env[key]);
  const transport = globalThis.fetch;
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  try {
    process.env.WHOP_ENVIRONMENT = 'production';
    process.env.BRAND_BRAIN_AUDIT_INGEST_URL = 'https://brandbrain-preview.vercel.app/api/marketing/audit-lead/ingest';
    process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET = 'local-test-secret-that-is-at-least-32-chars';
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      calls.push({ url, body });
      if (url.endsWith('/api/marketing/checkout/verify')) return Response.json({ sessionToken: 'd'.repeat(64) });
      if (url.endsWith('/api/marketing/checkout/initialize')) return Response.json({ purchaseUrl: 'https://whop.com/checkout/ch_ok/', planId: 'plan_sAEhr77rTrhX4', environment: 'production' });
      return Response.json({ ok: true });
    };
    const verify = await loadRoute('../src/app/api/checkout/verify/route.ts')(new Request('https://frameleads-preview.vercel.app/api/checkout/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'e'.repeat(64) }),
    }));
    const issued = verify.headers.get('set-cookie') ?? '';
    const sessionToken = issued.match(/=([a-f0-9]{64});/)?.[1];
    assert.equal(sessionToken, 'd'.repeat(64));
    const form = new FormData(); form.set('plan', 'CORE');
    const checkout = await loadRoute('../src/app/api/checkout/route.ts')(new Request('https://frameleads-preview.vercel.app/api/checkout', {
      method: 'POST', headers: { cookie: `${CHECKOUT_SESSION_COOKIE_NAME}=${sessionToken}` }, body: form,
    }));
    assert.equal(checkout.headers.get('location'), 'https://whop.com/checkout/ch_ok/');
    assert.equal(calls.find(call => call.url.endsWith('/api/marketing/checkout/initialize'))?.body.sessionToken, sessionToken);
    const cancel = await loadRoute('../src/app/api/checkout/cancel/route.ts')(new Request('https://frameleads-preview.vercel.app/api/checkout/cancel', {
      method: 'POST', headers: { cookie: `${CHECKOUT_SESSION_COOKIE_NAME}=${sessionToken}` },
    }));
    const expired = cancel.headers.get('set-cookie') ?? '';
    assert.match(expired, new RegExp(`^${CHECKOUT_SESSION_COOKIE_NAME}=;`));
    assert.match(expired, /(?:^|;\s*)Max-Age=0(?:;|$)/i);
    assert.match(expired, /(?:^|;\s*)Secure(?:;|$)/i);
    assert.equal(calls.find(call => call.url.endsWith('/api/marketing/checkout/cancel'))?.body.sessionToken, sessionToken);
    assert.equal(calls.length, 3);
  } finally {
    globalThis.fetch = transport;
    envKeys.forEach((key, index) => before[index] === undefined ? delete process.env[key] : process.env[key] = before[index]!);
  }
});

test('legacy underscore cookie is rejected because it is not the reserved host-only cookie name', async () => {
  const before = envKeys.map(key => process.env[key]);
  try {
    process.env.WHOP_ENVIRONMENT = 'production';
    const form = new FormData(); form.set('plan', 'CORE');
    const response = await loadRoute('../src/app/api/checkout/route.ts')(new Request('https://frameleads-preview.vercel.app/api/checkout', {
      method: 'POST', headers: { cookie: `__Host_frameleads_checkout=${'f'.repeat(64)}` }, body: form,
    }));
    assert.equal(new URL(response.headers.get('location')!).searchParams.get('state'), 'expired');
  } finally {
    envKeys.forEach((key, index) => before[index] === undefined ? delete process.env[key] : process.env[key] = before[index]!);
  }
});

test('sandbox checkout accepts only the verified sandbox plan and documented sandbox host', async () => {
  const response = await withCheckoutFixture('sandbox', {
    purchaseUrl: 'https://sandbox.whop.com/checkout/ch_sandbox/', planId: 'plan_kgrX8LpuAH2Ba', environment: 'sandbox',
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://sandbox.whop.com/checkout/ch_sandbox/');
});

test('sandbox rejects production plan, production host, production environment, and unmapped Enterprise', async () => {
  for (const responseBody of [
    { purchaseUrl: 'https://sandbox.whop.com/checkout/ch_1/', planId: 'plan_sAEhr77rTrhX4', environment: 'sandbox' },
    { purchaseUrl: 'https://whop.com/checkout/ch_2/', planId: 'plan_kgrX8LpuAH2Ba', environment: 'sandbox' },
    { purchaseUrl: 'https://sandbox.whop.com/checkout/ch_3/', planId: 'plan_sAEhr77rTrhX4', environment: 'production' },
  ]) {
    const response = await withCheckoutFixture('sandbox', responseBody);
    assert.equal(new URL(response.headers.get('location')!).pathname, '/checkout/continue');
  }
  const enterprise = await withCheckoutFixture('sandbox', {
    purchaseUrl: 'https://sandbox.whop.com/checkout/ch_4/', planId: 'plan_UnverifiedSandboxEnterprise', environment: 'sandbox',
  }, 'ENTERPRISE');
  assert.equal(new URL(enterprise.headers.get('location')!).pathname, '/checkout/continue');
});
