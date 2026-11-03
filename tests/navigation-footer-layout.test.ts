import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const nav = readFileSync(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");

test("desktop header centers navigation independently of actions", () => {
  assert.ok(nav.includes("lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"));
  assert.ok(nav.includes('aria-label="Primary navigation"'));
  assert.ok(nav.includes("justify-center gap-5 lg:flex xl:gap-7"));
  assert.ok(nav.includes("hidden items-center justify-end gap-5 lg:flex"));
  const desktopActions = nav.slice(nav.indexOf('className="hidden items-center justify-end gap-5 lg:flex"'), nav.indexOf('className="ml-auto inline-flex h-10'));
  assert.ok(desktopActions.indexOf(">Log In</Link>") < desktopActions.indexOf("Try it Risk-Free"));
  assert.ok(desktopActions.includes('href={loginHref}'));
  assert.ok(!desktopActions.includes("border border-white px-4"));
  assert.ok(nav.includes("lg:hidden")); // Responsive mobile navigation preserved
});

test("footer contains brand, product and company without redundant Workflow group", () => {
  const footer = page.slice(page.indexOf('<footer className="relative z-10 w-full'));
  assert.ok(footer.includes('aria-label="Footer navigation"'));
  assert.ok(footer.includes('aria-label="Footer product navigation"'));
  assert.ok(footer.includes('aria-label="Footer company navigation"'));
  assert.ok(footer.includes("Decision intelligence for founder-led outbound teams."));
  assert.ok(!footer.includes(">Workflow</p>"));
  for (const anchor of ["#capabilities", "#simulation", "#pricing", "#faq", "/privacy", "/terms"]) {
    assert.ok(footer.includes(anchor), "Missing footer anchor: " + anchor);
  }
  assert.ok(footer.includes("onClick={launchAudit}"));
  assert.ok(footer.includes("mailto:akram@frameleads.io"));
  assert.ok(footer.includes("https://app.frameleads.io/login"));
});

test("new navigation is outside and below the original page-bottom gradient", () => {
  const glow = page.indexOf('premium-edge-glow premium-edge-glow--bottom');
  const transition = page.indexOf('h-48 bg-gradient-to-b from-transparent to-[#1A1A1A]');
  const finishMain = page.indexOf('</main>');
  const finishRoot = page.indexOf('</div>\n  <footer className="relative z-10 w-full');
  const footer = page.indexOf('aria-label="Footer navigation"');
  assert.ok(glow >= 0 && glow < finishMain);
  assert.ok(finishMain < transition && transition < finishRoot);
  assert.ok(finishRoot < footer);
  assert.ok(page.includes('border-t border-white/[.08] bg-[#1A1A1A]'));
  assert.ok(page.includes("© 2026 FrameLeads. A BrandFlow Studio Company."));
});

test("approved scenario preview, pricing, audit and Micro-Pilot modal remain mounted", () => {
  assert.ok(page.includes("<ReplyDecisionPreview embedded />"));
  assert.ok(page.includes("<PricingCard tier=\"core\" />"));
  assert.ok(page.includes("<PricingCard tier=\"enterprise\" />"));
  assert.ok(page.includes("<AuditModal returnFocusRef={auditTrigger}"));
  assert.ok(page.includes("<ExitIntentPopup openRequest={isMicroPilotRequested}"));
  assert.ok(page.includes("pricing-ambient-card"));
});
