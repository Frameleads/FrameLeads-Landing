import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const page = fs.readFileSync("src/app/affiliates/page.tsx", "utf8");
const form = fs.readFileSync("src/components/AffiliateRegistrationForm.tsx", "utf8");
const walkthrough = fs.readFileSync("src/components/AffiliateWalkthrough.tsx", "utf8");
const backend = fs.readFileSync("src/affiliate-native.ts", "utf8");
const confirmation = fs.readFileSync("src/app/api/affiliates/confirm/route.ts", "utf8");

test("approved hero, recurring badge and CTA copy are present in real page", () => {
  assert.ok(page.includes("Introduce them to FrameLeads, the decision layer"));
  assert.doesNotMatch(page, /Introduce them to FrameLeads—/);
  assert.ok(form.includes("30% · recurring"));
  assert.doesNotMatch(form, /30% · one-time/);
  assert.ok(form.includes(' : "Apply to join"}'));
  assert.doesNotMatch(form, /<span aria-hidden="true">→<\/span>/);
  assert.ok(page.includes("<AffiliateWalkthrough />"));
});

test("visual steps are anonymized and show the desired Whop walkthrough", () => {
  for (const title of [
    "Apply", "Open your invitation", "Copy your referral links", "Read your partner guidance",
    "Your affiliate dashboard", "Affiliate instructions", "Refer buyers", "30.00%",
    "Read inside Whop",
  ]) assert.ok(walkthrough.includes(title), "missing " + title);
  assert.ok(walkthrough.includes("<CurvedArrow"), "must draw orange callout arrows");
  assert.ok(walkthrough.includes("blur-[7px]"), "instructions must be obscured");
  for (const privateIdentity of [
    "akramwalid", "akramwalid137", "akram@frameleads.io", "aff_MVmZHGhp7TSGeR",
    "trq_FFLhOQrYU9utaY",
  ]) assert.equal(walkthrough.toLowerCase().includes(privateIdentity.toLowerCase()), false);
});

test("recurring messaging agrees with planned Whop integration; production remains gated", () => {
  assert.ok(page.includes("eligible initial and recurring subscription payments"));
  assert.ok(form.includes("commissions are recurring"));
  assert.ok(backend.includes('applies_to_payments: "all_payments"'));
  assert.ok(backend.includes('applies_to_payments === "all_payments"'));
  assert.ok(confirmation.includes("30% recurring on eligible payments"));
  assert.ok(backend.includes('AFFILIATE_NATIVE_REGISTRATION_ENABLED === "true"'));
  assert.ok(backend.includes('AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED === "true"'));
  assert.ok(backend.includes('if (env.VERCEL_ENV === "preview") return "preview";'));
});
