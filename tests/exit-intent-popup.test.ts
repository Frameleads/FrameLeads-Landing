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
  assert.match(suppressionBlock, /params\.get\("utm_me¶»§q«^