import test from "node:test";
import assert from "node:assert/strict";
import { chooseFeedbackDatabase } from "../src/feedback-target.ts";

const branchRef = "abcdefghijklmnopqrst";
const productionRef = "campgoqhyvniokwvjvtb";

test("staging preview uses only explicitly configured isolated Supabase branch", () => {
  assert.equal(
    chooseFeedbackDatabase(branchRef, "preview", undefined),
    `https://${branchRef}.supabase.co/rest/v1/rpc/accept_website_feedback`,
  );
  assert.equal(chooseFeedbackDatabase(undefined, "preview", undefined), null);
});

test("Preview and Development cannot write to production Brand Brain", () => {
  assert.equal(chooseFeedbackDatabase(productionRef, "preview", "true"), null);
  assert.equal(chooseFeedbackDatabase(productionRef, "development", "true"), null);
  assert.equal(chooseFeedbackDatabase(productionRef, undefined, "true"), null);
});

test("production release requires explicit opt-in and approved project reference", () => {
  assert.equal(chooseFeedbackDatabase(productionRef, "production", undefined), null);
  assert.equal(chooseFeedbackDatabase(branchRef, "production", "true"), null);
  assert.equal(
    chooseFeedbackDatabase(productionRef, "production", "true"),
    `https://${productionRef}.supabase.co/rest/v1/rpc/accept_website_feedback`,
  );
});

test("affiliate sandbox is excluded from feedback collection in every environment", () => {
  assert.equal(chooseFeedbackDatabase("kutkuprsehzxmbwasirw", "preview", undefined), null);
  assert.equal(chooseFeedbackDatabase("kutkuprsehzxmbwasirw", "production", "true"), null);
});

test("malformed or attacker-provided project references cannot construct remote URLs", () => {
  for (const ref of ["evil.com", "https://evil.com", "abc/def", "abc", "a".repeat(100), "ABCDEFGHIJKLMNOPQRST"]) {
    assert.equal(chooseFeedbackDatabase(ref, "preview", undefined), null);
  }
});
