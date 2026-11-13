import test from "node:test";
import assert from "node:assert/strict";
import { deriveFeedbackContext, parseFeedbackPayload } from "../src/feedback-validation.ts";

test("accepts a selected buyer objection", () => {
  assert.deepEqual(parseFeedbackPayload({ reason: "price", plan_context: "core" }), {
    reason: "price", optional_message: null, plan_context: "core",
  });
});

test("accepts free-text-only feedback without a preset category", () => {
  assert.deepEqual(parseFeedbackPayload({ optional_message: "Need a walkthrough", plan_context: "enterprise" }), {
    reason: null, optional_message: "Need a walkthrough", plan_context: "enterprise",
  });
});

test("rejects empty and unknown complaints", () => {
  assert.equal(parseFeedbackPayload({ plan_context: "general" }), null);
  assert.equal(parseFeedbackPayload({ reason: "other", plan_context: "general" }), null);
  assert.equal(parseFeedbackPayload({ reason: "price", plan_context: "fake" }), null);
  assert.equal(parseFeedbackPayload({ reason: "price", plan_context: "core", is_admin: true }), null);
  assert.equal(parseFeedbackPayload({ reason: "price", plan_context: "core", optional_message: "A".repeat(1201) }), null);
});

test("allows exactly 1200 characters and trims whitespace", () => {
  const parsed = parseFeedbackPayload({ plan_context: "general", optional_message: "  " + "x".repeat(1200) + "  " });
  assert.equal(parsed?.optional_message?.length, 1200);
});

test("derives checkout plan from same-origin URL, overriding the visitor hint", () => {
  assert.deepEqual(
    deriveFeedbackContext("https://frameleads.io/api/feedback", "https://frameleads.io/checkout/micro-pilot?promo=secret", "enterprise"),
    { source_page: "/checkout/micro-pilot", plan_context: "micro_pilot" }
  );
});

test("ignores cross-origin referrer and never stores its query string", () => {
  assert.deepEqual(
    deriveFeedbackContext("https://frameleads.io/api/feedback", "https://untrusted.example/checkout/core?email=secret", "general"),
    { source_page: "/", plan_context: "general" }
  );
});

test("preserves pricing-card context on the homepage", () => {
  assert.deepEqual(
    deriveFeedbackContext("https://frameleads.io/api/feedback", "https://frameleads.io/", "enterprise"),
    { source_page: "/", plan_context: "enterprise" }
  );
});
