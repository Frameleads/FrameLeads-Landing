import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';

type Handler = (request: Request) => Promise<Response>;
type HarnessOptions = { env?: Record<string, string>; fetch?: typeof fetch };

const defaultEnv: Record<string, string> = {
  FEEDBACK_COLLECTION_ENABLED: 'true',
  FEEDBACK_SUPABASE_SECRET_KEY: 'local-test-secret-key',
  FEEDBACK_RATE_HMAC_SECRET: 'local-test-hmac-secret-with-32-characters',
  FEEDBACK_SUPABASE_PROJECT_REF: 'abcdefghijklmnopqrst',
  VERCEL_ENV: 'preview',
};

function route(options: HarnessOptions = {}): Handler {
  const exports: { POST?: Handler } = {};
  const context = vm.createContext({
    AbortSignal,
    Buffer,
    Date,
    Request,
    Response,
    URL,
    process: { env: { ...defaultEnv, ...options.env } },
    fetch: options.fetch ?? (async () => Response.json('stored')),
  });
  const path = new URL('../src/app/api/feedback/route.ts', import.meta.url);
  const source = fs.readFileSync(path, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  }).outputText;
  const modules: Record<string, unknown> = {
    'node:crypto': crypto,
    '../../../feedback-validation': requireFeedbackValidation(),
    '../../../feedback-target': requireFeedbackTarget(),
  };
  vm.runInContext('(function(exports, require) {' + code + '\n})', context)(exports, (name: string) => {
    if (!(name in modules)) throw new Error(`Unexpected route dependency: ${name}`);
    return modules[name];
  });
  assert.ok(exports.POST);
  return exports.POST;
}

// Importing these source modules directly would depend on Node's extensionless
// ESM resolution; compile them with the same TypeScript mode as the route.
function requireFeedbackValidation(): unknown {
  return compileModule('../src/feedback-validation.ts', {
    '../feedback': { FEEDBACK_REASONS: [] },
  });
}

function requireFeedbackTarget(): unknown {
  return compileModule('../src/feedback-target.ts', {});
}

function compileModule(relativePath: string, dependencies: Record<string, unknown>): unknown {
  const exports: Record<string, unknown> = {};
  const context = vm.createContext({ URL });
  const code = ts.transpileModule(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  }).outputText;
  vm.runInContext('(function(exports, require) {' + code + '\n})', context)(exports, (name: string) => {
    if (!(name in dependencies)) throw new Error(`Unexpected module dependency: ${name}`);
    return dependencies[name];
  });
  return exports;
}

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://frameleads.io/api/feedback', {
    method: 'POST',
    headers: { origin: 'https://frameleads.io', 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validFeedback = { reason: 'price', plan_context: 'core' };

test('feedback API stays disabled without calling storage', async () => {
  let calls = 0;
  const post = route({ env: { FEEDBACK_COLLECTION_ENABLED: 'false' }, fetch: async () => { calls++; throw Error('unexpected'); } });
  const response = await post(request(validFeedback));
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
});

test('feedback API rejects untrusted origins and malformed input before storage', async () => {
  let calls = 0;
  const post = route({ fetch: async () => { calls++; throw Error('unexpected'); } });
  assert.equal((await post(request(validFeedback, { origin: 'https://attacker.example' }))).status, 403);
  assert.equal((await post(request(validFeedback, { 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal((await post(request({ reason: 'unknown', plan_context: 'core' }))).status, 400);
  assert.equal((await post(request('{'))).status, 400);
  assert.equal(calls, 0);
});

test('feedback API accepts only a stored acknowledgment and sends normalized private fields', async () => {
  let sentUrl = '';
  let sentInit: RequestInit | undefined;
  const post = route({ fetch: async (url, init) => {
    sentUrl = String(url);
    sentInit = init;
    return Response.json('stored');
  } });
  const response = await post(request(validFeedback, { referer: 'https://frameleads.io/checkout/core?secret=discard-me', 'x-vercel-forwarded-for': '203.0.113.7' }));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { saved: true });
  assert.equal(sentUrl, 'https://abcdefghijklmnopqrst.supabase.co/rest/v1/rpc/accept_website_feedback');
  assert.equal(new Headers(sentInit?.headers).get('apikey'), defaultEnv.FEEDBACK_SUPABASE_SECRET_KEY);
  const payload = JSON.parse(String(sentInit?.body));
  assert.equal(payload.p_reason, 'price');
  assert.equal(payload.p_source_page, '/checkout/core');
  assert.equal(payload.p_plan_context, 'core');
  assert.match(payload.p_fingerprint, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(String(sentInit?.body), /203\.0\.113\.7|discard-me/);
});

test('feedback API returns bounded storage failures without exposing provider details', async () => {
  const failedStatus = await route({ fetch: async () => new Response('private provider detail', { status: 500 }) })(request(validFeedback));
  assert.equal(failedStatus.status, 503);
  assert.doesNotMatch(await failedStatus.text(), /private provider detail/);
  const failedNetwork = await route({ fetch: async () => { throw Error('private network detail'); } })(request(validFeedback));
  assert.equal(failedNetwork.status, 503);
  assert.doesNotMatch(await failedNetwork.text(), /private network detail/);
  const unknownAck = await route({ fetch: async () => Response.json('unexpected') })(request(validFeedback));
  assert.equal(unknownAck.status, 503);
});

test('feedback API maps rate limits to HTTP 429 with Retry-After', async () => {
  const response = await route({ fetch: async () => Response.json('rate_limited') })(request(validFeedback));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '3600');
  assert.doesNotMatch(await response.text(), /stored|fingerprint/i);
});
