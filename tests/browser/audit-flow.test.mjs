import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Real Chromium + built-in CDP. All capture/measurement requests are intercepted;
// these tests cannot create production leads, outreach, or Meta conversions.
const base = 'http://127.0.0.1:3106';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let server, chrome, browser;

class CDP {
  sequence = 0; pending = new Map(); handlers = new Map();
  constructor(url) {
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => { this.socket.addEventListener('open', resolve, { once: true }); this.socket.addEventListener('error', reject, { once: true }); });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const task = this.pending.get(message.id); this.pending.delete(message.id);
        if (message.error) task?.reject(Error(JSON.stringify(message.error))); else task?.resolve(message.result);
      } else for (const handler of this.handlers.get(message.method) ?? []) handler(message);
    });
  }
  on(method, handler) { const handlers = this.handlers.get(method) ?? []; handlers.push(handler); this.handlers.set(method, handlers); }
  async send(method, params = {}, sessionId) {
    await this.ready;
    const id = ++this.sequence;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
  }
}

before(async () => {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3106', '--hostname', '127.0.0.1'], { stdio: 'pipe' });
  let serverLog = ''; server.stdout.on('data', data => { serverLog += data; }); server.stderr.on('data', data => { serverLog += data; });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    if (server.exitCode !== null) throw Error('Next server exited: ' + serverLog);
    await pause(100);
  }
  assert.ok(ready, 'production server must become ready: ' + serverLog);
  const executable = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(value => value && existsSync(value));
  assert.ok(executable, 'Set CHROME_PATH to an installed Chrome/Chromium/Edge binary');
  const profile = mkdtempSync(path.join(tmpdir(), 'frameleads-audit-browser-'));
  chrome = spawn(executable, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('Chromium CDP startup timed out')), 15000);
    chrome.stderr.on('data', data => { const match = String(data).match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timeout); resolve(match[1]); } });
    chrome.once('error', reject);
  });
  browser = new CDP(endpoint); await browser.ready;
});

after(async () => {
  if (browser) { await browser.send('Browser.close').catch(() => {}); browser.socket.close(); }
  chrome?.kill(); server?.kill();
});

async function page(width = 1280, consent = false) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => browser.send(method, params, sessionId);
  const captures = [], observations = [], errors = [];
  let measurementAttempts = 0, failMeasurements = false;
  let outcome = { success: true }, status = 201;
  browser.on('Fetch.requestPaused', async message => {
    if (message.sessionId !== sessionId) return;
    const { requestId, request } = message.params;
    const url = new URL(request.url);
    let body = '', type = 'application/javascript', code = 200;
    if (url.pathname === '/api/audit-lead') { captures.push(JSON.parse(request.postData)); await pause(180); body = JSON.stringify(outcome); type = 'application/json'; code = status; }
    else if (url.pathname === '/api/measurement') {
      measurementAttempts++;
      if (failMeasurements) { await send('Fetch.failRequest', { requestId, errorReason: 'Failed' }).catch(() => {}); return; }
      observations.push(JSON.parse(request.postData)); body = JSON.stringify({ ok: true }); type = 'application/json'; code = 201;
    }
    // External scripts/media are inert in these browser tests.
    await send('Fetch.fulfillRequest', { requestId, responseCode: code, responseHeaders: [{ name: 'Content-Type', value: type }], body: Buffer.from(body).toString('base64') }).catch(() => {});
  });
  browser.on('Runtime.exceptionThrown', message => { if (message.sessionId === sessionId) errors.push(message.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });
  await send('Fetch.enable', { patterns: [{ urlPattern: base + '/api/*' }, { urlPattern: 'https://*' }] });
  const initialConsent = consent === null ? '' : `localStorage.setItem('frameleads:privacy-consent:v1', JSON.stringify({analytics:${consent},advertising:${consent},savedAt:new Date().toISOString()}));`;
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    if (location.origin === ${JSON.stringify(base)}) {
      localStorage.clear(); sessionStorage.clear();
      ${initialConsent}
      window.__events=[]; window.__pixels=[];
      window.addEventListener('frameleads:marketing-event', e => window.__events.push(e.detail));
      const pixel=(...args)=>window.__pixels.push(args); pixel.queue=[]; pixel.loaded=true; pixel.version='2.0'; window.fbq=pixel;
    }
  ` });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    return response.result.value;
  };
  const wait = async (expression, description = expression) => {
    for (let attempt = 0; attempt < 150; attempt++) { if (await evaluate(expression)) return; await pause(80); }
    throw Error('Browser condition timed out: ' + description);
  };
  return {
    captures, observations, errors, evaluate, wait,
    failMeasurementRequests: () => { failMeasurements = true; },
    get measurementAttempts() { return measurementAttempts; },
    setOutcome: (value, code = 201) => { outcome = value; status = code; },
    goto: async route => { await send('Page.navigate', { url: base + route }); await wait(`document.querySelector('#top') && document.readyState === 'complete'`); await pause(400); },
    key: async (key, shift = false) => { const params = {key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: key === 'Tab' ? 9 : key === 'Escape' ? 27 : 32, modifiers: shift ? 8 : 0}; await send('Input.dispatchKeyEvent', {type:'keyDown',...params}); await send('Input.dispatchKeyEvent', {type:'keyUp',...params}); },
    screenshot: async name => { mkdirSync('.next/audit-qa', { recursive: true }); const { data } = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync('.next/audit-qa/' + name + '.png', Buffer.from(data, 'base64')); },
    close: () => browser.send('Target.closeTarget', { targetId }),
  };
}

const dialog = `document.querySelector('[role="dialog"][aria-labelledby="audit-modal-title"]')`;
const diagnoseButton = `Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Diagnose My Reply Workflow')`;
async function choose(p, number, rapid = false) {
  const before = await p.evaluate(`${dialog}.querySelector('legend').textContent`);
  await p.evaluate(`${dialog}.querySelectorAll('input[type="radio"]')[${number}].click(); ${rapid ? `${dialog}.querySelectorAll('input[type="radio"]')[2].click()` : ''}`);
  await p.wait(`!${dialog}.querySelector('legend') || ${dialog}.querySelector('legend').textContent !== ${JSON.stringify(before)}`);
}
async function diagnose(p) {
  for (let index = 0; index < 5; index++) {
    assert.equal(await p.evaluate(`!!${dialog}.querySelector('input[type=email]')`), false, 'identity capture cannot precede diagnosis');
    await choose(p, 1, index === 0);
  }
  await p.wait(`${dialog}.textContent.includes('Your diagnosis') && !!${dialog}.querySelector('input[type=email]')`);
}
async function submit(p) {
  await p.evaluate(`(() => { const d=${dialog}; const fields=d.querySelectorAll('form input'); const values=['fixture@example.com','example.com','Fixture']; fields.forEach((field,i)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(field,values[i]);field.dispatchEvent(new Event('input',{bubbles:true}));}); })()`);
  await p.evaluate(`${dialog}.querySelector('button[type=submit]').click(); ${dialog}.querySelector('button[type=submit]').click()`);
}

test('normal homepage, button entry, Escape, Back/Forward, focus and scroll restoration', async () => {
  const p = await page();
  try {
    await p.goto('/?utm_source=meta&fbclid=fixture');
    assert.equal(await p.evaluate(`!!${dialog}`), false);
    for (const id of ['problem', 'solution', 'capabilities', 'simulation', 'how-it-works', 'pricing', 'faq']) assert.equal(await p.evaluate(`!!document.getElementById('${id}')`), true);
    await p.evaluate('window.scrollTo({top:300,behavior:"instant"})');
    const scroll = await p.evaluate('scrollY');
    await p.evaluate(`${diagnoseButton}.focus({preventScroll:true}); ${diagnoseButton}.click()`); await p.wait(`!!${dialog}`);
    assert.equal(await p.evaluate('document.body.style.overflow'), 'hidden');
    await p.key('Tab'); assert.equal(await p.evaluate(`${dialog}.contains(document.activeElement)`), true);
    await p.key('Tab', true); assert.equal(await p.evaluate(`${dialog}.contains(document.activeElement)`), true);
    await p.evaluate('history.back()'); await p.wait(`!${dialog}`);
    await p.evaluate('history.forward()'); await p.wait(`!!${dialog}`);
    await p.key('Escape'); await p.wait(`!${dialog}`); await pause(350);
    assert.equal(await p.evaluate('scrollY'), scroll);
    assert.equal(await p.evaluate('document.activeElement.textContent'), 'Diagnose My Reply Workflow');
    assert.equal(await p.evaluate('location.search'), '?utm_source=meta&fbclid=fixture');
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

for (const width of [1280, 390]) test(`paid homepage deep link: five questions, capture, attribution and product proof at ${width}px`, async () => {
  const p = await page(width, true);
  try {
    await p.goto('/?audit=open&utm_source=meta&utm_campaign=launch&fbclid=fixture'); await p.wait(`!!${dialog}`);
    assert.equal(await p.evaluate(`document.querySelectorAll('[aria-labelledby="audit-modal-title"]').length`), 1);
    assert.match(await p.evaluate(`${dialog}.querySelector('legend').textContent`), /How many qualified prospect conversations/);
    assert.equal(p.observations.filter(event => event.eventName === 'AUDIT_STARTED').length, 0, 'display alone is not Audit activity');
    await choose(p, 1);
    await p.evaluate(`history.replaceState(history.state,'',location.href+'&utm_content=variant')`); await pause(150);
    assert.match(await p.evaluate(`${dialog}.querySelector('legend').textContent`), /typical new client engagement/);
    await p.evaluate(`Array.from(${dialog}.querySelectorAll('button')).find(b=>b.textContent==='Back').click()`);
    await p.wait(`${dialog}.querySelector('legend').textContent.includes('How many qualified')`);
    await choose(p, 1);
    assert.match(await p.evaluate(`${dialog}.querySelector('legend').textContent`), /typical new client engagement/);
    await p.evaluate(`document.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,clientY:0,relatedTarget:null}))`);
    assert.equal(await p.evaluate(`!!document.querySelector('[aria-label="Close Micro-Pilot offer"]')`), false);
    for (let index = 1; index < 5; index++) { assert.equal(await p.evaluate(`!!${dialog}.querySelector('input[type=email]')`), false); await choose(p, 1); }
    await p.wait(`!!${dialog}.querySelector('input[type=email]')`);
    assert.equal(p.captures.length, 0);
    assert.equal(await p.evaluate(`window.__pixels.filter(args=>args[1]==='Lead').length`), 0);
    await p.evaluate(`${dialog}.querySelector('button[type=submit]').click()`); assert.equal(p.captures.length, 0, 'invalid form cannot submit');
    await submit(p); await p.wait(`${dialog}.textContent.includes('Your Reply Workflow Map')`);
    assert.equal(p.captures.length, 1);
    assert.equal(p.captures[0].advertisingConsent, true);
    assert.equal(p.captures[0].attribution.fbclid, 'fixture'); assert.equal(p.captures[0].attribution.utm_source, 'meta');
    assert.equal(await p.evaluate(`window.__events.filter(e=>e.event==='LEAD_CAPTURED').length`), 1);
    assert.equal(await p.evaluate(`window.__pixels.filter(args=>args[1]==='Lead').length`), 0, 'standard Lead is exclusively canonical CAPI');
    assert.equal(p.observations.filter(event => event.eventName === 'AUDIT_STARTED').length, 1);
    assert.equal(p.observations.filter(event => event.eventName === 'AUDIT_COMPLETED').length, 1);
    assert.ok(p.observations.every(event => !JSON.stringify(event).includes('fixture@example.com')));
    assert.equal(await p.evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    await p.screenshot('audit-' + width);
    await p.evaluate(`Array.from(${dialog}.querySelectorAll('button')).find(b=>b.textContent==='See FrameLeads Handle This').click()`);
    await p.wait(`!${dialog}`); await p.wait(`Math.abs(document.getElementById('simulation').getBoundingClientRect().top) < 180`);
    assert.equal(await p.evaluate('document.body.style.overflow'), '');
    assert.equal(await p.evaluate(`new URLSearchParams(location.search).get('fbclid')`), 'fixture');
    assert.equal(await p.evaluate(`new URLSearchParams(location.search).has('audit')`), false);
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

for (const width of [1280, 390]) test(`pricing exposure uses a visible heading, explicit analytics consent and deduplication at ${width}px`, async () => {
  const p = await page(width, null);
  const waitForObservation = async name => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (p.observations.some(event => event.eventName === name)) return;
      await pause(30);
    }
    throw Error(`Timed out waiting for ${name} ingestion`);
  };
  try {
    await p.goto('/');
    assert.equal(p.observations.length, 0, 'an undecided visitor is not measured');
    assert.equal(await p.evaluate(`!!document.querySelector('#pricing h2')`), true);
    await p.evaluate(`document.querySelector('#pricing h2').scrollIntoView({block:'center',behavior:'instant'})`);
    await p.wait(`(() => { const h=document.querySelector('#pricing h2').getBoundingClientRect(); return Math.max(0,Math.min(h.bottom,innerHeight)-Math.max(h.top,0))/h.height >= 0.5; })()`);
    const isNarrowSection = await p.evaluate(`document.querySelector('#pricing').getBoundingClientRect().height > innerHeight`);
    if (width < 700) assert.equal(isNarrowSection, true, 'mobile fixture must have a pricing section taller than the viewport');
    await pause(700);
    assert.equal(p.observations.filter(event => event.eventName === 'PRICING_VIEW').length, 0, 'visibility alone does not bypass undecided consent');

    await p.evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Reject optional').click()`);
    await pause(150);
    assert.equal(p.observations.length, 0, 'rejecting optional measurement keeps the visible pricing heading unrecorded');
    await p.evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Privacy settings').click()`);
    await p.evaluate(`document.querySelector('input[type=checkbox]').click(); Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Save preferences').click()`);
    await p.wait(`JSON.parse(localStorage.getItem('frameleads:privacy-consent:v1')).analytics === true && JSON.parse(localStorage.getItem('frameleads:privacy-consent:v1')).advertising === false`);
    await waitForObservation('PRICING_VIEW');
    assert.equal(p.observations.filter(event => event.eventName === 'PRICING_VIEW').length, 1, 'a qualifying pricing-heading exposure is recorded once after analytics consent');
    assert.equal(await p.evaluate(`window.__pixels.length`), 0, 'analytics-only consent does not emit advertising tags');

    await p.evaluate(`window.scrollTo({top:0,behavior:'instant'}); document.querySelector('#pricing h2').scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(700);
    assert.equal(p.observations.filter(event => event.eventName === 'PRICING_VIEW').length, 1, 'scrolling and rerendering do not repeat the exposure');
    const checkout = `document.querySelector('a[href*="whop.com/checkout/plan_"]')`;
    await p.evaluate(`${checkout}.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); ${checkout}.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
    await waitForObservation('CHECKOUT_CLICK');
    assert.equal(p.observations.filter(event => event.eventName === 'CHECKOUT_CLICK').length, 1, 'outbound clicks are recorded once and remain distinct from checkout confirmation');

    await p.evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Privacy settings').click()`);
    await p.evaluate(`document.querySelector('input[type=checkbox]').click(); Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Save preferences').click()`);
    await pause(100);
    const beforeWithdrawalClick = p.observations.length;
    await p.evaluate(`${checkout}.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
    await pause(250);
    assert.equal(p.observations.length, beforeWithdrawalClick, 'withdrawn analytics consent prevents subsequent event ingestion');
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

test('measurement network failures do not interrupt the page or Audit flow', async () => {
  const p = await page(1280, true);
  p.failMeasurementRequests();
  try {
    await p.goto('/');
    assert.ok(p.measurementAttempts > 0, 'the consented page view attempted ingestion');
    assert.deepEqual(p.observations, [], 'failed requests are not treated as durably ingested');
    await p.evaluate(`${diagnoseButton}.click()`);
    await p.wait(`!!${dialog}`);
    assert.deepEqual(p.errors, [], 'measurement transport failure does not throw into page code');
  } finally { await p.close(); }
});

test('keyboard-only questions, focus trap and close work on mobile', async () => {
  const p = await page(390, false);
  try {
    await p.goto('/?audit=open'); await p.wait(`!!${dialog}`);
    for (let index = 0; index < 5; index++) {
      const question = await p.evaluate(`${dialog}.querySelector('legend').textContent`);
      await p.evaluate(`${dialog}.querySelector('fieldset').focus()`);
      await p.key('Tab');
      assert.equal(await p.evaluate('document.activeElement.type'), 'radio');
      await p.key(' ');
      await p.wait(`!${dialog}.querySelector('legend') || ${dialog}.querySelector('legend').textContent !== ${JSON.stringify(question)}`);
    }
    await p.wait(`${dialog}.textContent.includes('Your diagnosis')`);
    await p.evaluate(`${dialog}.querySelector('button[aria-label="Close reply workflow audit"]').focus()`);
    await p.key('Tab', true);
    assert.equal(await p.evaluate(`${dialog}.contains(document.activeElement)`), true);
    await p.key('Escape'); await p.wait(`!${dialog}`);
    assert.deepEqual(p.observations, []);
  } finally { await p.close(); }
});

test('failed capture, retry, consent denial, backdrop close and legacy links', async () => {
  const p = await page(390, false);
  try {
    const redirect = await fetch(base + '/audit?utm_source=meta&tag=a&tag=b&fbclid=fixture', { redirect: 'manual' });
    assert.equal(redirect.status, 307); assert.equal(redirect.headers.get('location'), '/?utm_source=meta&tag=a&tag=b&fbclid=fixture&audit=open');
    await p.goto('/audit?utm_source=meta&fbclid=fixture'); await p.wait(`!!${dialog}`);
    await diagnose(p);
    p.setOutcome({ error: 'Fixture failure' }, 503); await submit(p); await p.wait(`!!${dialog}.querySelector('[role=alert]')`);
    assert.equal(await p.evaluate(`window.__events.filter(e=>e.event==='LEAD_CAPTURED').length`), 0);
    p.setOutcome({ success: true }); await submit(p); await p.wait(`${dialog}.textContent.includes('Your Reply Workflow Map')`);
    assert.equal(p.captures.length, 2); assert.equal(p.captures[1].advertisingConsent, false);
    assert.deepEqual(p.captures[1].attribution, {}); assert.deepEqual(p.observations, []);
    assert.equal(await p.evaluate(`window.__pixels.length`), 0);
    await p.evaluate(`${dialog}.parentElement.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}))`); await p.wait(`!${dialog}`);
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});


// This is a real mobile Chromium interaction against the current homepage:
// pricing qualification and the final close section must activate the $10 offer.
test('mobile Micro-Pilot popup appears after qualified pricing and final CTA views', async () => {
  const p = await page(390, false);
  const offer = "document.querySelector('[role=dialog][aria-labelledby=micro-pilot-title]')";
  try {
    await p.goto('/');
    assert.equal(await p.evaluate(`!!${offer}`), false, 'do not interrupt the initial visit');
    await p.evaluate("document.getElementById('pricing').scrollIntoView({block:'center',behavior:'instant'})");
    await pause(400);
    await p.evaluate("document.getElementById('commercial-close').scrollIntoView({block:'center',behavior:'instant'})");
    await p.wait(`!!${offer}`, 'qualified mobile visitor receives the one-time offer');
    assert.equal(await p.evaluate(`${offer}.textContent.includes('25 TOTAL PROSPECTS')`), true);
    assert.equal(await p.evaluate(`${offer}.querySelector('a[href*="plan_8qLWfJZHQUYZf"]') !== null`), true);
    await p.key('Escape');
    await p.wait(`!${offer}`, 'escape closes the offer');
    await p.evaluate("document.getElementById('commercial-close').scrollIntoView({block:'center',behavior:'instant'})");
    await pause(300);
    assert.equal(await p.evaluate(`!!${offer}`), false, 'one-time session offer must not reopen');
  } finally { await p.close(); }
});
