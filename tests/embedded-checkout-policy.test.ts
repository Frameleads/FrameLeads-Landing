import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { checkoutTier, embeddedCheckoutPolicy, tierInformation, referralCheckoutDecision, WHOP_EMBED_LOADER, WHOP_CHECKOUT_RETURN_URL } from "../src/checkout-embed-policy.ts";

test("supports all three FrameLeads tiers with existing offer and plan mappings", () => {
  assert.equal(checkoutTier("micro-pilot"), true);
  assert.equal(checkoutTier("core"), true);
  assert.equal(checkoutTier("enterprise"), true);
  assert.equal(checkoutTier("anything-else"), false);
  assert.equal(tierInformation("micro-pilot").productionPlanId, "plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").hostedCheckout, "https://whop.com/checkout/plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").displayedPrice, "$10");
  assert.equal(tierInformation("micro-pilot").billingInterval, "one-time");
  assert.equal(tierInformation("micro-pilot").recurring, false);
  assert.equal(tierInformation("micro-pilot").monthlyQuota, 25);
  assert.equal(tierInformation("micro-pilot").usageLabel, "25 total prospects");
  assert.equal(tierInformation("micro-pilot").benefits[0], "25 total prospects");
  assert.equal(tierInformation("core").productionPlanId, "plan_GQTDPXnvijugf");
  assert.equal(tierInformation("core").hostedCheckout, "https://whop.com/checkout/plan_GQTDPXnvijugf");
  assert.equal(tierInformation("enterprise").productionPlanId, "plan_uGDGf5WKW7hlE");
  assert.equal(tierInformation¶»§q«^