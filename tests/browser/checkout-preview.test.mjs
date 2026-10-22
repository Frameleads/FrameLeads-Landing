import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Isolated real-browser DOM test. Whop, pixel and other external requests are
// intercepted; NO Sandbox or production payments, leads or pixels are sent.
const base = "http://127.0.0.1:3168";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let server, chrome, cdp;

class CDP {
  next = 0; waiting = new Map(); handlers = new Map();
  constructor(url) {
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", event => {
      const payload = JSON.parse(event.data);
      if (payload.id) {
        const p = this.waiting.get(payload.id);
        this.waiting.delete(payload.id);
        if (payload.error) p?.reject(Error(JSON.stringify(payload.error)));
        else p?.resolve(payload.result);
      } else for (const callback of this.handlers.get(payload.method) ?? []) callback(payload);
    });
  }
  on(event, callback) {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(callback);
    this.handlers.set(event, handlers);
  }
  async send(method, params = {}, sessionId) {
    await this.ready;
    return await new Promise((resolve, reject) => {
      const id = ++this.next;
      this.waiting.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
}

before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3168", "--hostname", "127.0.0.1"], {
    env: {
      ...process.env,
      FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED: "true",
      VERCEL_ENV: "preview",
      WHOP_ENVIRONMENT: "sandbox",
      WHOP_SANDBOX_CORE_PLAN_ID: "plan_kgrX8LpuAH2Ba",
      WHOP_SANDBOX_ACCOUNT_ID: "biz_6YudF3G7nc8Wdw",
      WHOP_SANDBOX_PRODUCT_ID: "prod_2RDEl6d8jhM9W",
      WHOP_SANDBOX_RETURN_URL: "https://synthetic-preview.example/checkout/complete",
      NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED: "false",
      NEXT_PUBLIC_META_TRACKING_ENABLED: "false",
      NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED: "false",
    }, stdio: "pipe",
  });
  let output = "";
  server.stdout.on("data", value => { output += value; });
  server.stderr.on("data", value => { output += value; });
  let ready = false;
  for (let count = 0; count < 150; count++) {
    if (server.exitCode !== null) throw Error("Next server failed: " + output);
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await sleep(150);
  }
  assert.ok(ready, "Next server must become ready: " + output);

  const binary = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find(value => value && existsSync(value));
  assert.ok(binary, "GitHub runner must have Chrome/Chromium; no test is silently skipped");
  const profile = mkdtempSync(path.join(tmpdir(), "frameleads-checkout-ci-"));
  chrome = spawn(binary, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-crash-reporter",
    "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0",
    "--user-data-dir=" + profile, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const endpoint = await new Promise((resolve, reject) => {
    const guard = setTimeout(() => reject(Error("Chromium CDP startup timeout")), 20000);
    chrome.stderr.on("data", chunk => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(guard); resolve(match[1]); }
    });
    chrome.once("error", reject);
  });
  cdp = new CDP(endpoint);
  await cdp.ready;
});

after(async () => {
  if (cdp) { await cdp.send("Browser.close").catch(() => {}); cdp.socket.close(); }
  chrome?.kill(); server?.kill();
});

async function page(url, choice = null, width = 1280) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);
  const errors = [];
  cdp.on("Fetch.requestPaused", async message => {
    if (message.sessionId !== sessionId) return;
    const { requestId, request } = message.params;
    // Never let browser fetch Whop payment form, ads pixels or external resources.
    const script = /\.js(?:\?|$)/.test(request.url);
    const body = script ? "/* external script deliberately blocked in synthetic checkout test */" : "";
    await send("Fetch.fulfillRequest", {
      requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: script ? "application/javascript" : "text/plain" }],
      body: Buffer.from(body).toString("base64"),
    }).catch(() => {});
  });
  cdp.on("Runtime.exceptionThrown", event => {
    if (event.sessionId === sessionId) errors.push(event.params.exceptionDetails.text);
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });
  await send("Fetch.enable", { patterns: [{ urlPattern: "https://*" }] });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    if (location.origin === ${JSON.stringify(base)}) {
      localStorage.clear(); sessionStorage.clear();
      ${choice === null ? "" : `localStorage.setItem("frameleads:privacy-consent:v1", JSON.stringify({analytics:${choice},advertising:${choice},savedAt:new Date().toISOString()}));`}
    }
  ` });
  await send("Page.navigate", { url: base + url });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = async (expression, label = expression) => {
    for (let count = 0; count < 120; count++) {
      try { if (await evaluate(expression)) return; } catch {}
      await sleep(100);
    }
    throw Error("Browser condition timed out: " + label);
  };
  await wait('document.readyState === "complete" && !!document.querySelector("main")', "checkout page hydrated");
  return { evaluate, wait, errors, close: () => cdp.send("Target.closeTarget", { targetId }) };
}

const embed = 'document.querySelector("[data-whop-checkout-plan-id]")';

test("Sandbox Core mounts Whop's isolated embed on the FrameLeads domain without a referral", async () => {
  const p = await page("/checkout/core", false);
  try {
    await p.wait(`!!${embed}`, "Sandbox checkout element");
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-checkout-environment")`), "sandbox");
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-checkout-plan-id")`), "plan_kgrX8LpuAH2Ba");
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-checkout-theme")`), "dark");
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-affiliate")`), null);
    assert.equal(await p.evaluate('location.host'), "127.0.0.1:3168");
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

test("Affiliate link with undecided consent holds payment and never credits a raw ?a=", async () => {
  const p = await page("/checkout/core?a=creator_alpha", null, 390);
  try {
    await p.wait('document.body.textContent.includes("Choose your optional privacy settings")');
    assert.equal(await p.evaluate(`!!${embed}`), false);
    assert.equal(await p.evaluate('document.body.textContent.includes("Privacy choices")'), true);
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

test("Declining optional referral tracking permits checkout; no affiliate identifier is injected", async () => {
  const p = await page("/checkout/core?a=creator_alpha", false, 390);
  try {
    await p.wait(`!!${embed}`, "declined referral can buy");
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-affiliate")`), null);
    assert.equal(await p.evaluate(`${embed}.getAttribute("data-whop-checkout-environment")`), "sandbox");
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

test("Consented but unverified referral cannot be silently sold as a direct checkout", async () => {
  const p = await page("/checkout/core?a=creator_alpha", true);
  try {
    await p.wait('document.body.textContent.includes("Referral verification is required")');
    assert.equal(await p.evaluate(`!!${embed}`), false);
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});

test("Enterprise lacks a verified Sandbox plan and stays disabled", async () => {
  const p = await page("/checkout/enterprise", false);
  try {
    await p.wait('document.body.textContent.includes("Checkout preview is not available")');
    assert.equal(await p.evaluate(`!!${embed}`), false);
    assert.deepEqual(p.errors, []);
  } finally { await p.close(); }
});
