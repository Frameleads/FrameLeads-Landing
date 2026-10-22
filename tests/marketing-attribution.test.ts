import assert from "node:assert/strict";
import test from "node:test";
import { captureAffiliateCode, mergeMarketingAttribution, sanitizeMarketingEventProperties } from "../src/marketing-events.ts";

test("a later submitted affiliate code reaches Brand Brain as another observation", () => {
  assert.deepEqual(
    mergeMarketingAttribution(
      { affiliateCode: "partner_alpha", utmCampaign: "first-campaign" },
      { affiliateCode: "partner_beta", utmCampaign: "second-campaign" },
    ),
    { affiliateCode: "partner_beta", utmCampaign: "first-campaign" },
  );
});

test("a missing or invalid new code does not erase the stored referral", () => {
  const existing = { affiliateCode: "partner_alpha" };
  assert.deepEqual(mergeMarketingAttribution(existing, {}), existing);
  assert.deepEqual(mergeMarketingAttribution(existing, { affiliateCode: "bad code" }), existing);
});

test("affiliate referral capture requires both advertising consent and an approved privacy basis", () => {
  assert.equal(captureAffiliateCode("partner_alpha", true), undefined);
  assert.equal(captureAffiliateCode("partner_alpha", true, true), "partner_alpha");
  assert.equal(captureAffiliateCode("partner_alpha", false, true), undefined);
  assert.equal(captureAffiliateCode("bad code", true, true), undefined);
  assert.equal(captureAffiliateCode("x".repeat(65), true, true), undefined);
});

test("affiliate identifiers are excluded from generic analytics properties", () => {
  assert.deepEqual(
    sanitizeMarketingEventProperties({ attribution: { affiliateCode: "partner_alpha", utmCampaign: "launch" } }),
    { attribution: { utmCampaign: "launch" } },
  );
});
