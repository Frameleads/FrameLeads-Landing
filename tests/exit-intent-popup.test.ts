import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const popupSource = readFileSync(new URL("../src/components/ExitIntentPopup.tsx", import.meta.url), "utf8");
const landingSource = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const suppressionStart = popupSource.indexOf("const params = new URLSearchParams(window.location.search);");
const observersStart = popupSource.indexOf("new IntersectionObserver", suppressionStart);
const exitListenerStart = popupSource.indexOf('document.addEventListener("mouseout", handleExitIntent)', suppressionStart);
const checkoutListenerStart = popupSource.indexOf('document.addEventListener("click", handleCheckoutClick, true)', suppressionStart);
const suppressionBlock = popupSource.slice(suppressionStart, observersStart);

function isAuditEmailCoreVisit(href: string): boolean {
  const url = new URL(href);
  const params = new URLSearchParams(url.search);
  return params.get("utm_source") === "website_audit"
    && params.get("utm_medium") === "email"
    && url.hash === "#core";
}

test("suppresses Micro-Pilot for Audit email visitors landing on Core", () => {
  assert.equal(isAuditEmailCoreVisit("https://frameleads.io/?utm_source=website_audit&utm_medium=email&utm_campaign=audit_nurture&utm_content=test#core"), true);
  assert.match(suppressionBlock, /params\.get\("utm_source"\) === "website_audit"/);
  assert.match(suppressionBlock, /params\.get\("utm_medium"\) === "email"/);
  assert.match(suppressionBlock, /window\.location\.hash === "#core"/);
  assert.match(suppressionBlock, /hasTriggered\.current = true/);
  assert.match(suppressionBlock, /sessionStorage\.setItem\(SESSION_KEY, "true"\)/);
  assert.match(suppressionBlock, /return;/);
  assert.ok(suppressionStart >= 0 && suppressionStart < observersStart);
  assert.ok(suppressionStart < exitListenerStart);
  assert.ok(suppressionStart < checkoutListenerStart);
});

test("does not suppress Audit email without Core hash or unrelated Core traffic", () => {
  assert.equal(isAuditEmailCoreVisit("https://frameleads.io/?utm_source=website_audit&utm_medium=email&utm_content=test"), false);
  assert.equal(isAuditEmailCoreVisit("https://frameleads.io/?utm_source=organic&utm_medium=email#core"), false);
  assert.equal(isAuditEmailCoreVisit("https://frameleads.io/?utm_source=meta&utm_medium=paid_social#core"), false);
  assert.equal(isAuditEmailCoreVisit("https://frameleads.io/#core"), false);
});

test("preserves Micro-Pilot suppression and routes the purchase through V3", () => {
  assert.match(popupSource, /const SESSION_KEY = "microPilotShown";/);
  assert.match(landingSource, /href="\/checkout\/core"/);
  assert.match(popupSource, /const MICRO_PILOT_URL = "\/checkout\/micro-pilot";/);
  assert.match(popupSource, /a\[href\^="\/checkout\/"\]/);
});

test("Micro-Pilot offer describes its finite verified limits and preserves raw-message access", () => {
  assert.match(popupSource, /25 TOTAL PROSPECTS/);
  assert.match(popupSource, /3 first-time prospect reply analyses with interest, Why Now evidence, and the recommended next action/);
  assert.match(popupSource, /A suggested reply when the governance rules permit it/);
  assert.match(popupSource, /Research up to 3 qualified prospects once each/);
  assert.match(popupSource, /One company context, 2 sales rules, and 1 governance rule/);
  assert.match(popupSource, /Original replies and completed Decision Replays remain readable afterward/);
  assert.doesNotMatch(popupSource, /25 PROSPECTS \/ MONTH/);
});

test("mobile exit offer is anchored to the current homepage final CTA", () => {
  const currentHome = landingSource.split("export function LegacyHome()")[0];
  assert.match(currentHome, /<section id="commercial-close"/);
  assert.match(popupSource, /const finalCloseSection = document\.getElementById\("commercial-close"\)/);
  assert.match(popupSource, /if \(!pricingViewed\) return;/);
  assert.match(popupSource, /entry\.intersectionRatio >= 0\.5/);
  assert.match(popupSource, /window\.matchMedia\("\(pointer: coarse\)"\)\.matches\) openOffer\(\)/);
});

test("public pricing and purchase CTAs use the final branded V3 routes", () => {
  const currentHome = landingSource.split("export function LegacyHome()")[0];
  assert.match(currentHome, /enterprise \? "499" : "149"/);
  assert.doesNotMatch(currentHome, /enterprise \? "697" : "147"/);
  assert.match(currentHome, /href="\/checkout\/core"/);
  assert.match(currentHome, /href="\/checkout\/enterprise"/);
  assert.doesNotMatch(currentHome, /https:\/\/whop\.com\/checkout\/plan_(?:sAEhr77rTrhX4|jdy5Z44fMKMAz)/);
});
