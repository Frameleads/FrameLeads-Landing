import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isNativeMobilePlaybackDevice } from "../src/vsl-device.ts";

const source = readFileSync(new URL("../src/components/VideoSection.tsx", import.meta.url), "utf8");

test("iOS iPhone, iPad, iPod and Android keep native first-tap playback", () => {
  for (const ua of [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
    "Mozilla/5.0 (iPod touch; CPU iPhone OS 16_0 like Mac OS X)",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
    "mozilla/5.0 (linux; android 15; SM-T999)",
  ]) assert.equal(isNativeMobilePlaybackDevice(ua, 0), true, ua);
});

test("iPadOS desktop user agent with multitouch is treated as mobile", () => {
  assert.equal(isNativeMobilePlaybackDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5), true);
  assert.equal(isNativeMobilePlaybackDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 1), false);
});

test("Mac desktop, Windows and Linux keep click-to-load poster behavior", () => {
  for (const [ua, touches] of [
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 0],
    ["Mozilla/5.0 (X11; Ubuntu; Linux x86_64)", 0],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 5],
  ] as const) assert.equal(isNativeMobilePlaybackDevice(ua, touches), false, ua);
});

test("mobile native playback and desktop autoplay contracts remain distinct", () => {
  assert.ok(source.includes('const nativeEmbedUrl = embedUrl.replace("autoplay=1", "autoplay=0")'));
  assert.ok(source.includes("src={nativeMobilePlayer ? nativeEmbedUrl : embedUrl}"));
  assert.ok(source.includes('aria-label="Play FrameLeads VSL"'));
  assert.ok(source.includes("onClick={() => setIsLoaded(true)}"));
  assert.ok(source.includes('className="pointer-events-none absolute inset-0 z-10"'));
  assert.ok(source.includes("if (!nativeMobilePlayer)"));
  assert.ok(source.includes("if (cancelled || nativeMobilePlayer || triedMutedFallback || !player) return;"));
  assert.ok(source.includes("useSyncExternalStore("));
});
