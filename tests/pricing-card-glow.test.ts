import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const homepage = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const stylesheet = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("both existing pricing tiers reuse the scoped ambient lighting card without layout or offer changes", () => {
  assert.ok(homepage.includes("pricing-ambient-card relative isolate overflow-hidden rounded-2xl"));
  assert.ok(homepage.includes('<PricingCard tier="core" />'));
  assert.ok(homepage.includes('<PricingCard tier="enterprise" />'));
  assert.ok(homepage.includes('href="/checkout/core"'));
  assert.ok(homepage.includes('href="/checkout/enterprise"'));
  assert.ok(homepage.includes("enterprise ? \"499\" : \"149\""));
  assert.ok(homepage.includes("border-[#FF5A1F]/[.14]"));
});

test("pricing light originates inside the borders and softly rises from below on desktop hover", () => {
  for (const token of [
    ".pricing-ambient-card::before",
    ".pricing-ambient-card::after",
    "radial-gradient(ellipse 105% 68% at 50% 112%, rgba(255,90,31,.055)",
    "radial-gradient(ellipse 94% 61% at 50% 109%, rgba(255,90,31,.16)",
    "opacity: 0;",
    "transform: translateY(15%);",
    ".pricing-ambient-card:hover::after",
    "opacity: 1;",
    "transform: translateY(0);",
    "pointer-events: none;",
    "z-index: 0;"
  ]) {
    assert.ok(stylesheet.includes(token), "Missing card lighting layer: " + token);
  }
  assert.ok(stylesheet.includes("@media (hover: hover) and (pointer: fine)"));
  assert.ok(stylesheet.includes(".pricing-ambient-card:focus-within::after"));
  assert.ok(stylesheet.includes("@media (prefers-reduced-motion: reduce)"));
  // Inspect only CSS declarations with a pricing-card selector. The previous
  // slice included every unrelated rule after the pricing block, and falsely
  // failed on later FAQ, attention, and motion effects.
  const pricingRules = [...stylesheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => selector.includes(".pricing-ambient-card"))
    .map(([, , declarations]) => declarations)
    .join("\n");
  assert.ok(pricingRules.length > 0, "Missing pricing effect declarations");
  const rgbColors = [...pricingRules.matchAll(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,/g)];
  const allowed = new Set(["255,90,31", "26,26,26"]);
  for (const color of rgbColors) {
    assert.ok(allowed.has(color.slice(1).join(",")), "Off-palette translucent color in pricing effect");
  }
});
