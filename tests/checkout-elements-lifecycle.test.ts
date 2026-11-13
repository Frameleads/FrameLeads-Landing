import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleCheckoutElementsLoad } from "../src/checkout-elements-lifecycle.ts";

test("Whop SDK is never loaded for disabled, unconfigured, or referral-hosted checkout", () => {
  for (const enabled of [false]) {
    const scheduled: Array<() => void> = [];
    let calls = 0;
    const cleanup = scheduleCheckoutElementsLoad(
      enabled,
      () => { calls += 1; return { initialized: true }; },
      () => { calls += 10; },
      () => { calls += 100; },
      task => scheduled.push(task),
    );
    assert.equal(scheduled.length, 0);
    cleanup();
    assert.equal(calls, 0);
  }
});

test("Whop payment initialization is deferred until the post-hydration task", () => {
  const scheduled: Array<() => void> = [];
  const events: string[] = [];
  const elements = { secure: true };
  scheduleCheckoutElementsLoad(
    true,
    () => { events.push("load"); return elements; },
    value => { assert.equal(value, elements); events.push("ready"); },
    () => events.push("unavailable"),
    task => scheduled.push(task),
  );
  assert.deepEqual(events, []);
  assert.equal(scheduled.length, 1);
  scheduled[0]();
  assert.deepEqual(events, ["load", "ready"]);
});

test("unmounted or replaced checkout never initializes stale payment elements", () => {
  const scheduled: Array<() => void> = [];
  const events: string[] = [];
  const cleanup = scheduleCheckoutElementsLoad(
    true,
    () => { events.push("load"); return "sdk"; },
    () => events.push("ready"),
    () => events.push("unavailable"),
    task => scheduled.push(task),
  );
  cleanup();
  scheduled[0]();
  assert.deepEqual(events, []);
});

test("SDK loading error reports fallback without exposing exception details", () => {
  const scheduled: Array<() => void> = [];
  const events: string[] = [];
  scheduleCheckoutElementsLoad(
    true,
    () => { throw new Error("provider detail must not escape"); },
    () => events.push("ready"),
    () => events.push("unavailable"),
    task => scheduled.push(task),
  );
  scheduled[0]();
  assert.deepEqual(events, ["unavailable"]);
});

test("SDK initialization is queued once per active effect, not synchronously", async () => {
  const events: string[] = [];
  scheduleCheckoutElementsLoad(
    true,
    () => { events.push("load"); return true; },
    () => events.push("ready"),
    () => events.push("unavailable"),
  );
  assert.deepEqual(events, []);
  await Promise.resolve();
  assert.deepEqual(events, ["load", "ready"]);
});
