import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { referralCheckoutDecision } from "../src/checkout-embed-policy.ts";
import { initializeWhopCheckout } from "../src/whop-loader.ts";
import { shouldUseNativeYouTubePlayer } from "../src/vsl-device.ts";

const checkoutSource = readFileSync(new URL("../src/components/EmbeddedWhopCheckout.tsx", import.meta.url), "utf8");
const videoSource = readFileSync(new URL("../src/components/VideoSection.tsx", import.meta.url), "utf8");
const normalCheckout = { embedEnabled: true, hostedFallback: "https://whop.com/checkout/test", referralHintPresent: false };

test("Whop SDK is not imported or initialized for disabled checkout, missing fallback, or referrals", async () => {
  for (const opts of [
    { ...normalCheckout, embedEnabled: false },
    { ...normalCheckout, hostedFallback: "" },
    { ...normalCheckout, referralHintPresent: true },
  ]) {
    let imports = 0, initialized = 0, ready = 0, errors = 0;
    await initializeWhopCheckout(opts,
      async () => { imports++; return { loadWhop: () => { initialized++; return "instance"; } }; },
      () => true,
      () => { ready++; }, () => { errors++; });
    assert.deepEqual({ imports, initialized, ready, errors }, { imports: 0, initialized: 0, ready: 0, errors: 0 });
  }
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: null }), "pending");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: false }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: true }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: false, advertisingConsent: null }), "allowed");
});

test("Whop SDK initializes after asynchronous import and reports the instance once", async () => {
  let loaded = 0, ready = 0, errors = 0;
  const instance = { id: "mock-whop-elements" };
  await initializeWhopCheckout(
    normalCheckout,
    async () => ({ loadWhop: () => { loaded++; return instance; } }),
    () => true,
    actual => { ready++; assert.equal(actual, instance); },
    () => { errors++; },
  );
  assert.deepEqual({ loaded, ready, errors }, { loaded: 1, ready: 1, errors: 0 });
});

test("navigation or StrictMode cleanup prevents pending Whop import from calling SDK or updating state", async () => {
  let resolveSdk!: (sdk: { loadWhop: () => string }) => void;
  let active = true, initialized = 0, ready = 0, errors = 0;
  const pending = new Promise<{ loadWhop: () => string }>(resolve => { resolveSdk = resolve; });
  const operation = initializeWhopCheckout(normalCheckout, () => pending,
    () => active, () => { ready++; }, () => { errors++; });
  active = false;
  resolveSdk({ loadWhop: () => { initialized++; return "late-element"; } });
  await operation;
  assert.deepEqual({ initialized, ready, errors }, { initialized: 0, ready: 0, errors: 0 });
});

test("inactive checkout skips SDK import even before it starts", async () => {
  let calls = 0;
  await initializeWhopCheckout(normalCheckout,
    async () => { calls++; return { loadWhop: () => "x" }; },
    () => false, () => { calls++; }, () => { calls++; });
  assert.equal(calls, 0);
});

test("Whop import rejection and loader exception use existing hosted fallback state", async () => {
  for (const failedSdk of [
    async () => { throw new Error("SDK chunk blocked"); },
    async () => ({ loadWhop: () => { throw new Error("SDK initialization failed"); } }),
  ]) {
    let ready = 0, errors = 0;
    await initializeWhopCheckout(normalCheckout, failedSdk, () => true,
      () => { ready++; }, () => { errors++; });
    assert.equal(ready, 0);
    assert.equal(errors, 1);
  }
});

test("late rejected Whop import never updates an unmounted checkout", async () => {
  let rejectSdk!: (error: Error) => void;
  let active = true, errors = 0;
  const pending = new Promise<{ loadWhop: () => string }>((_, reject) => { rejectSdk = reject; });
  const operation = initializeWhopCheckout(normalCheckout, () => pending,
    () => active, () => { throw Error("Must not update"); }, () => { errors++; });
  active = false;
  rejectSdk(new Error("SDK import rejected after unmount"));
  await operation;
  assert.equal(errors, 0);
});

test("checkout wiring preserves referral gate, Whop-owned payment, and verified-entitlement handoff", () => {
  assert.ok(checkoutSource.includes('() => import("@whop/elements")'), "SDK is imported only after hydration");
  assert.ok(checkoutSource.includes('return () => { active = false; };'), "effect cleans up async import");
  assert.ok(checkoutSource.includes('if (!embedEnabled || !hostedFallback || referralHintPresent) return;'), "disabled and referral checkouts are excluded");
  assert.ok(checkoutSource.includes('if (decision === "pending")'), "pending consent remains isolated");
  assert.ok(checkoutSource.includes('if (decision === "hosted")'), "referrals remain hosted");
  assert.ok(checkoutSource.includes('if (elementsUnavailable)'), "provider failures retain hosted fallback");
  assert.ok(checkoutSource.includes('onComplete={(completion) => {'), "SDK completion callback preserved");
  assert.ok(checkoutSource.includes('if (completion.result === "payment" && returnUrl)'), "payment callback cannot grant entitlement");
  assert.ok(checkoutSource.includes('Sign in with the same Whop account to verify your membership'), "entitlement verification remains separate");
  assert.ok(!checkoutSource.includes('setWhopElements(loadWhop())'), "no sync setState during an effect");
});

test("mobile device classification preserves iOS Android iPadOS and desktop behavior", () => {
  const cases: Array<[string, number, boolean]> = [
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122", 0, false],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 0, false],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", 5, true],
    ["Mozilla/5.0 (iPad; CPU OS 16_1 like Mac OS X)", 5, true],
    ["Mozilla/5.0 (Linux; Android 15; Pixel)", 5, true],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1.15", 5, true],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1.15", 1, false],
  ];
  for (const [ua, touches, expected] of cases) {
    assert.equal(shouldUseNativeYouTubePlayer(ua, touches), expected, ua);
  }
});

test("video hydration and player wiring preserve one-tap mobile and desktop click-to-load", () => {
  assert.ok(videoSource.includes('useSyncExternalStore(subscribeToDevice, getClientDevice, getServerDevice)'), "device choice is hydration-safe");
  assert.ok(videoSource.includes('const getServerDevice = () => false'), "SSR starts without a video iframe");
  assert.ok(videoSource.includes('const playerMounted = isLoaded || nativeMobilePlayer'), "mobile iframe mounts after hydration");
  assert.ok(videoSource.includes('const nativeEmbedUrl = embedUrl.replace("autoplay=1", "autoplay=0")'), "mobile iframe does not request autoplay");
  assert.ok(videoSource.includes('src={nativeMobilePlayer ? nativeEmbedUrl : embedUrl}'), "native and desktop URLs remain distinct");
  assert.ok(videoSource.includes('if (!nativeMobilePlayer)'), "mobile does not get scripted playVideo on iframe readiness");
  assert.ok(videoSource.includes('onClick={() => setIsLoaded(true)}'), "desktop poster remains click to load");
  assert.ok(videoSource.includes('className="pointer-events-none absolute inset-0 z-10"'), "mobile overlay cannot steal the first tap");
  assert.ok(videoSource.includes('if (watched >= 30)') && videoSource.includes('observeMeasurement("VSL_ENGAGED")'), "engagement threshold remains unchanged");
  assert.ok(!videoSource.includes('setNativeMobilePlayer('), "no synchronous device state effect");
});
