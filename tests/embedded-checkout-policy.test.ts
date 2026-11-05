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
  assert.equal(tierInformation("enterprise").hostedCheckout, "https://whop.com/checkout/plan_uGDGf5WKW7hlE");
  assert.equal(tierInformation("core").displayedPrice, "$149");
  assert.equal(tierInformation("enterprise").displayedPrice, "$499");
  // This is the new-buyer published reference offer. Existing SaaS customer
  // entitlements are intentionally not modified by Landing checkout copy.
  assert.equal(tierInformation("enterprise").monthlyQuota, 10_000);
  assert.equal(tierInformation("enterprise").usageLabel, "10,000 prospects per month");
  const homepage = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.ok(homepage.includes("enterpriseDetail: \"10,000 / month\""));
  assert.ok(homepage.includes('["Prospect volume", "10,000 / month"]'));
  assert.doesNotMatch(homepage, /20,000 \/ month/);
  assert.equal(tierInformation("core").billingInterval, "month");
  assert.equal(tierInformation("enterprise").billingInterval, "month");
});

test("homepage and all checkout tiers present the finalized prices without stale monthly amounts", () => {
  const homepage = fs.readFileSync("src/app/page.tsx", "utf8");
  // The approved homepage uses a template literal for the two public prices.
  assert.match(homepage, /enterprise \? "499" : "149"/);
  assert.doesNotMatch(homepage, /enterprise \? "697" : "147"/);
  assert.equal(tierInformation("micro-pilot").displayedPrice, "$10");
  assert.equal(tierInformation("micro-pilot").usageLabel, "25 total prospects");
});

test("Whop native loader and existing SaaS login return target are fixed", () => {
  assert.equal(WHOP_EMBED_LOADER, "https://js.whop.com/static/checkout/loader.js");
  assert.equal(WHOP_CHECKOUT_RETURN_URL, "https://app.frameleads.io/login?source=whop-checkout");
});

test("production native form keeps its exact plan gate and existing hosted fallback", () => {
  assert.deepEqual(embeddedCheckoutPolicy("core", {}), { available: false, reason: "preview_only" });
  const enabled = { FRAMELEADS_WHOP_NATIVE_CHECKOUT_ENABLED: "true", WHOP_ENVIRONMENT: "production", VERCEL_ENV: "production", FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED: "true", WHOP_MICRO_PLAN_ID: "plan_8qLWfJZHQUYZf", WHOP_CORE_PLAN_ID: "plan_GQTDPXnvijugf", WHOP_ENTERPRISE_PLAN_ID: "plan_uGDGf5WKW7hlE" };
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, FRAMELEADS_WHOP_NATIVE_CHECKOUT_ENABLED: undefined }), {
    available: false, reason: "disabled", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED: undefined }), {
    available: false, reason: "terms_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, WHOP_CORE_PLAN_ID: "plan_wrong" }), {
    available: false, reason: "plan_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", enabled), { available: true, environment: "production", planId: "plan_GQTDPXnvijugf", returnUrl: WHOP_CHECKOUT_RETURN_URL, hostedFallback: "https://whop.com/checkout/plan_GQTDPXnvijugf" });
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).available, true);
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).planId, "plan_uGDGf5WKW7hlE");
  assert.equal(embeddedCheckoutPolicy("enterprise", enabled).hostedFallback, "https://whop.com/checkout/plan_uGDGf5WKW7hlE");
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", enabled), { available: true, environment: "production", planId: "plan_8qLWfJZHQUYZf", returnUrl: WHOP_CHECKOUT_RETURN_URL, hostedFallback: "https://whop.com/checkout/plan_8qLWfJZHQUYZf" });
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...enabled, WHOP_MICRO_PLAN_ID: "plan_other" }), {
    available: false, reason: "plan_unverified", environment: "production", hostedFallback: "https://whop.com/checkout/plan_8qLWfJZHQUYZf", returnUrl: WHOP_CHECKOUT_RETURN_URL,
  });
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...enabled, WHOP_ENVIRONMENT: "sandbox" }), { available: false, reason: "wrong_environment" });
});

test("Preview Sandbox requires its own company, all tier plans, safe hosted URLs and SaaS Preview return", () => {
  const sandbox = {
    VERCEL_ENV: "preview",
    WHOP_ENVIRONMENT: "sandbox",
    FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED: "true",
    FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "true",
    WHOP_SANDBOX_COMPANY_ID: "biz_SandboxTest",
    FRAMELEADS_WHOP_SANDBOX_RETURN_URL: "https://frameleads-git-checkout-preview.vercel.app/login?source=whop-checkout",
    WHOP_MICRO_SANDBOX_PLAN_ID: "plan_sandboxMicro",
    WHOP_CORE_SANDBOX_PLAN_ID: "plan_sandboxCore",
    WHOP_ENTERPRISE_SANDBOX_PLAN_ID: "plan_sandboxEnterprise",
    WHOP_MICRO_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxMicro",
    WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxCore",
    WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL: "https://whop.com/checkout/plan_sandboxEnterprise",
  };
  for (const [tier, key, id, url] of [
    ["micro-pilot", "WHOP_MICRO_SANDBOX_PLAN_ID", "plan_sandboxMicro", "https://whop.com/checkout/plan_sandboxMicro"],
    ["core", "WHOP_CORE_SANDBOX_PLAN_ID", "plan_sandboxCore", "https://whop.com/checkout/plan_sandboxCore"],
    ["enterprise", "WHOP_ENTERPRISE_SANDBOX_PLAN_ID", "plan_sandboxEnterprise", "https://whop.com/checkout/plan_sandboxEnterprise"],
  ] as const) {
    const info = embeddedCheckoutPolicy(tier, sandbox);
    assert.deepEqual(info, {
      available: true,
      environment: "sandbox",
      planId: id,
      hostedFallback: url,
      returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
    });
    assert.equal(info.hostedFallback?.includes(tierInformation(tier).productionPlanId), false);
    assert.equal(sandbox[key], id);
  }
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...sandbox, WHOP_MICRO_SANDBOX_CHECKOUT_URL: undefined }), {
    available: false, reason: "sandbox_unconfigured", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  for (const [tier, key] of [
    ["micro-pilot", "WHOP_MICRO_SANDBOX_CHECKOUT_URL"],
    ["core", "WHOP_CORE_SANDBOX_CHECKOUT_URL"],
    ["enterprise", "WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL"],
  ] as const) {
    const missing = { ...sandbox, [key]: undefined };
    assert.equal(embeddedCheckoutPolicy(tier, missing).available, false, `${tier} fails closed when any tier Sandbox link is missing`);
    assert.equal(embeddedCheckoutPolicy(tier, missing).hostedFallback, undefined);
  }
  assert.deepEqual(embeddedCheckoutPolicy("micro-pilot", { ...sandbox, FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED: "false" }), {
    available: false, reason: "sandbox_terms_unverified", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  for (const badReturn of [WHOP_CHECKOUT_RETURN_URL, "http://frameleads-git-checkout-preview.vercel.app/login?source=whop-checkout", "https://frameleads-git-checkout-preview.vercel.app/login"]) {
    assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, FRAMELEADS_WHOP_SANDBOX_RETURN_URL: badReturn }), {
      available: false, reason: "sandbox_unconfigured", environment: "sandbox",
    });
  }
  for (const retiredPlanId of ["plan_sAEhr77rTrhX4", "plan_jdy5Z44fMKMAz", "plan_GQTDPXnvijugf", "plan_uGDGf5WKW7hlE"]) {
    assert.equal(embeddedCheckoutPolicy("core", {
      ...sandbox,
      WHOP_CORE_SANDBOX_PLAN_ID: retiredPlanId,
      WHOP_CORE_SANDBOX_CHECKOUT_URL: `https://whop.com/checkout/${retiredPlanId}`,
    }).available, false, `production or retired plan ${retiredPlanId} cannot be used in Sandbox`);
  }
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_CORE_SANDBOX_CHECKOUT_URL: "https://example.com/checkout/plan_sandboxCore" }), {
    available: false, reason: "sandbox_unconfigured", environment: "sandbox", returnUrl: sandbox.FRAMELEADS_WHOP_SANDBOX_RETURN_URL,
  });
  assert.equal(embeddedCheckoutPolicy("core", { ...sandbox, WHOP_ENTERPRISE_SANDBOX_PLAN_ID: "plan_sandboxCore" }).available, false, "Sandbox plans must be distinct across tiers");
  assert.deepEqual(embeddedCheckoutPolicy("core", { ...sandbox, VERCEL_ENV: "production" }), { available: false, reason: "wrong_environment" });
});

test("Core direct affiliate Sandbox CTA is independent of ordinary all-tier Preview checkout", () => {
  const page = fs.readFileSync(new URL("../src/app/checkout/[plan]/page.tsx", import.meta.url), "utf8");
  const checkout = fs.readFileSync(new URL("../src/components/EmbeddedWhopCheckout.tsx", import.meta.url), "utf8");
  // Ordinary Preview checkout still needs all three Sandbox tiers; direct
  // partner verification is independently gated and may test Core alone.
  assert.match(page, /const directPartnerPreviewEnabled = plan === "core"/);
  assert.match(page, /WHOP_SANDBOX_COMPANY_ID === "biz_6YudF3G7nc8Wdw"/);
  assert.match(page, /WHOP_CORE_SANDBOX_PLAN_ID === "plan_kgrX8LpuAH2Ba"/);
  assert.match(page, /FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED === "true"/);
  assert.match(page, /AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"/);
  assert.match(page, /AFFILIATE_CONSENT_EVIDENCE_ENABLED === "true"/);
  assert.match(page, /WHOP_AFFILIATE_CHECKOUT_ENABLED === "true"/);
  assert.match(page, /directPartnerPreviewEnabled=\{directPartnerPreviewEnabled\}/);
  assert.match(checkout, /directPartnerPreviewEnabled = false/);
  assert.match(checkout, /if \(decision === "await_verified"\)/);
  assert.ok(checkout.indexOf('if (decision === "await_verified")') < checkout.indexOf('if (!hostedFallback)'),
    "a verified consented referral must reach its Core-only Sandbox CTA even without a generic hosted plan fallback");
  assert.match(checkout, /if \(!embedEnabled \|\| !hostedFallback \|\| decision !== "allowed"\) return/);
  assert.doesNotMatch(checkout, /process\.env\.NEXT_PUBLIC_FRAMELEADS_DIRECT_AFFILIATE_CHECKOUT_ENABLED/);
  const unconfigured = embeddedCheckoutPolicy("core", {
    VERCEL_ENV: "preview", WHOP_ENVIRONMENT: "sandbox",
    WHOP_SANDBOX_COMPANY_ID: "biz_6YudF3G7nc8Wdw",
    WHOP_CORE_SANDBOX_PLAN_ID: "plan_kgrX8LpuAH2Ba",
  });
  assert.equal(unconfigured.available, false, "ordinary plan checkout remains disabled with Core-only Sandbox setup");
});

test("partner-consented referrals cannot silently lose attribution on generic checkout", () => {
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: null }), "pending");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: false }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: true }), "hosted");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: true, affiliateConsent: true }), "await_verified");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: true, advertisingConsent: false, affiliateConsent: true }), "await_verified");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: false, advertisingConsent: true, affiliateConsent: true }), "allowed");
  assert.equal(referralCheckoutDecision({ rawReferralPresent: false, advertisingConsent: false }), "allowed");
});

test("native form uses Whop fields and contains no custom payment or ledger route", () => {
  const component = fs.readFileSync(new URL("../src/components/EmbeddedWhopCheckout.tsx", import.meta.url), "utf8");
  const page = fs.readFileSync(new URL("../src/app/checkout/[plan]/page.tsx", import.meta.url), "utf8");
  assert.match(component, /import .*CheckoutElement.*@whop\/elements-react/);
  assert.match(component, /<CheckoutElement/);
  assert.match(component, /plan=\{planId\}/);
  assert.match(component, /environment=\{environment\}/);
  assert.match(component, /elements=\{whopElements\}/);
  assert.doesNotMatch(component, /WhopCheckoutEmbed/);
  assert.match(component, /returnUrl=\{returnUrl\}/);
  assert.match(component, /if \(!hostedFallback\)/);
  assert.doesNotMatch(component, /observeMeasurement\("CHECKOUT_CLICK"\)/);
  assert.doesNotMatch(component, /track\(\s*["']purchase/i);
  assert.doesNotMatch(component, /data-whop-affiliate\s*=/);
  // The server page may describe receipt verification, but must never perform
  // payment-ledger writes or call Brand Brain directly during rendering.
  assert.doesNotMatch(page, /checkout\/continue|\bfetch\(|\bsupabase\b|from [^\n]*brand.?brain/i);
  assert.match(page, /hostedFallback=\{config\.hostedFallback \?\? ""\}/);
  assert.match(page, /environment=\{config\.environment \?\? "sandbox"\}/);
  assert.match(page, /embedEnabled=\{config\.available\}/);
  assert.doesNotMatch(component, /data-whop-checkout-(?:billing-interval|recurring)/);
});

test("homepage pricing cards lead through the approved V3 checkout page", () => {
  const page = fs.readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /href="\/checkout\/core"/);
  assert.match(page, /href="\/checkout\/enterprise"/);
  assert.match(fs.readFileSync(new URL("../src/components/ExitIntentPopup.tsx", import.meta.url), "utf8"), /href=\{MICRO_PILOT_URL\}/);
  assert.doesNotMatch(page, /href="https:\/\/whop\.com\/checkout\/plan_(?:sAEhr77rTrhX4|jdy5Z44fMKMAz)"/);
});

test("Micro-Pilot keeps its existing hosted checkout entry and offer unchanged", () => {
  const popup = fs.readFileSync(new URL("../src/components/ExitIntentPopup.tsx", import.meta.url), "utf8");
  assert.match(popup, /\/checkout\/micro-pilot/);
  assert.match(popup, /25 TOTAL PROSPECTS/);
  assert.doesNotMatch(popup, /25 PROSPECTS \/ MONTH/);
  assert.match(popup, /\$10 ONE-TIME/);
  assert.match(popup, /Run the Micro-Pilot — \$10/);
  assert.equal(tierInformation("micro-pilot").hostedCheckout, "https://whop.com/checkout/plan_8qLWfJZHQUYZf");
  assert.equal(tierInformation("micro-pilot").recurring, false);
});


test("checkout-click analytics fire only for actual native or hosted checkout link clicks", () => {
  const observer = fs.readFileSync("src/components/FirstPartyMeasurement.tsx", "utf8");
  const checkout = fs.readFileSync("src/components/EmbeddedWhopCheckout.tsx", "utf8");
  assert.match(observer, /const checkoutClick = \(event: MouseEvent\)/);
  assert.match(observer, /target\.closest<HTMLAnchorElement>\("a\[href\]"\)/);
  assert.match(observer, /nativeCheckout = url\.origin === window\.location\.origin/);
  assert.match(observer, /micro-pilot\|core\|enterprise/);
  assert.match(observer, /hostedWhopCheckout/);
  assert.match(observer, /if \(nativeCheckout \|\| hostedWhopCheckout\) observeMeasurement\("CHECKOUT_CLICK"\)/);
  assert.doesNotMatch(checkout, /observeMeasurement\(["']CHECKOUT_CLICK["']\)/);
});


test("Whop Elements only exposes hosted fallback on load failure", () => {
  const component = fs.readFileSync("src/components/EmbeddedWhopCheckout.tsx", "utf8");
  assert.match(component, /<WhopElements/);
  assert.match(component, /<Checkout[\s\S]*?plan=\{planId\}[\s\S]*?returnUrl=\{returnUrl\}/);
  assert.match(component, /onComplete=\{\(completion\) =>/);
  assert.match(component, /completion\.result === "payment"/);
  assert.match(component, /setCheckoutFinished\(true\)/);
  // Explicit verified partner initiation may navigate to a same-origin
  // checkout, but Whop's onComplete must never grant access or navigate.
  assert.match(component, /if \(response\.ok && next === "\/checkout\/affiliate\/core"\)/);
  assert.match(component, /window\.location\.assign\(next\)/);
  const onComplete = component.split("onComplete={(completion) => {")[1]?.split("}}")[0] ?? "";
  assert.doesNotMatch(onComplete, /window\.location\.(?:assign|replace)/);
  assert.doesNotMatch(component, /observeMeasurement\(["'](?:Purchase|PURCHASE)["']/);
  assert.match(component, /<CheckoutElement/);
  assert.match(component, /if \(elementsUnavailable\)/);
  assert.match(component, /onLoadError=\{\(\) => setElementsUnavailable\(true\)\}/);
  assert.doesNotMatch(component, /observeMeasurement\("Purchase"\)/);
});

test("Whop secure checkout uses supported summary typography classes without changing payment fields", () => {
  const component = fs.readFileSync("src/components/EmbeddedWhopCheckout.tsx", "utf8");
  for (const part of ["whop-CheckoutSeller", "whop-CheckoutItem", "whop-CheckoutPrice", "whop-CheckoutTotal", "whop-CheckoutPayButton"]) {
    assert.ok(component.includes(part), "Missing styling for " + part);
  }
  assert.match(component, /fontFamily: "'Acid Grotesk', sans-serif"/);
  assert.match(component, /<CheckoutElement/);
  assert.doesNotMatch(component, /document\.querySelector|contentDocument|\.contentWindow/);
  assert.doesNotMatch(component, /observeMeasurement\("Purchase"\)/);
});

test("checkout logo retains the approved charcoal badge with grey outline", () => {
  const order = fs.readFileSync("src/components/CheckoutOrderSummary.tsx", "utf8");
  assert.match(order, /border-\[#888888\]/);
  assert.match(order, /bg-\[#242424\]/);
  assert.match(order, /rounded-\[9px\]/);
  assert.match(order, /h-11 w-11/);
  assert.match(order, /src="\/logo\.png"/);
  // The source PNG contains large internal margins. Sizing the image crops
  // only those margins; the approved outer checkout badge remains 44px.
  assert.match(order, /overflow-hidden/);
  assert.match(order, /width=\{47\} height=\{47\}/);
  assert.match(order, /h-\[47px\] w-\[47px\] max-w-none shrink-0/);
});

test("checkout footer contains only FrameLeads policies and does not duplicate Whop legal text", () => {
  const page = fs.readFileSync("src/app/checkout/[plan]/page.tsx", "utf8");
  const checkoutFooter = page.slice(page.indexOf("<footer"), page.indexOf("</footer>") + "</footer>".length);
  assert.ok(checkoutFooter.includes('href="/terms"'));
  assert.ok(checkoutFooter.includes('href="/privacy"'));
  assert.ok(checkoutFooter.includes("FrameLeads Terms"));
  assert.doesNotMatch(checkoutFooter, /whop\.com|Powered by|Whop&apos;s|Buyer Terms/);
  assert.match(checkoutFooter, /aria-label="FrameLeads policies"/);
});


test("checkout completion never crosses Sandbox into the live SaaS or grants access from URL status", () => {
  const content = fs.readFileSync("src/app/checkout/complete/page.tsx", "utf8");
  assert.match(content, /embeddedCheckoutPolicy\("micro-pilot", process\.env\)/);
  assert.match(content, /environment === "preview"/);
  assert.match(content, /checkout\.environment === "sandbox"/);
  assert.match(content, /membership before granting access/);
  assert.doesNotMatch(content, /status === "success"|payment_id|grantEntitlement|track\(["']Purchase/);
});

test("Whop Elements initialization happens only in the browser after hydration", () => {
  const component = fs.readFileSync("src/components/EmbeddedWhopCheckout.tsx", "utf8");
  assert.doesNotMatch(component, /const whopElements = loadWhop\(\)/);
  assert.match(component, /useEffect\(\(\) => \{/);
  assert.match(component, /if \(!embedEnabled \|\| !hostedFallback \|\| decision !== "allowed"\) return/);
  assert.match(component, /affiliateConsent: hasCurrentAffiliateNoticeConsent\(consent\)/);
  assert.match(component, /setWhopElements\(loadWhop\(\)\)/);
  assert.match(component, /if \(!whopElements\)/);
  assert.match(component, /setElementsUnavailable\(true\)/);
  assert.doesNotMatch(component, /onComplete[\s\S]*?grantEntitlement/);
});
