import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadPost() {
  const source = fs.readFileSync(new URL('../src/app/api/checkout/route.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  const cjsModule = { exports: {} as Record<string, unknown> };
  const response = { redirect: (url: URL | string, status: number) => new Response(null, { status, headers: { location: String(url) } }) };
  const context = vm.createContext({
    module: cjsModule, exports: cjsModule.exports, process, Request, Response, FormData, URL, Headers, AbortSignal,
    fetch: globalThis.fetch,
    require: (name: string) => name === 'next/server' ? { NextResponse: response } : (() => { throw new Error(`Unexpected import ${name}`); })(),
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
      method: 'POST', headers: { cookie: `__Host_frameleads_checkout=${'a'.repeat(64)}` }, body: form,
    });
    return await loadPost()(request);
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
