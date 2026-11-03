import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync("src/reply-decision-preview.ts", "utf8");
const component = readFileSync("src/components/ReplyDecisionPreview.tsx", "utf8");
const hero = readFileSync("src/components/HeroIntro.tsx", "utf8");
const route = readFileSync("src/app/reply-decision-preview/page.tsx", "utf8");
const homepage = readFileSync("src/app/page.tsx", "utf8");

test("all three source-grounded illustrative buyer situations remain intact", () => {
  for (const id of ['id: "ambiguous"', 'id: "pricing"', 'id: "handoff"']) assert.ok(source.includes(id));
  for (const phrase of ["No invented lead score", "No discount is granted", "No security assurance is fabricated"]) assert.ok(source.includes(phrase));
});

test("network gateway is completely absent from the scenario preview", () => {
  for (const removed of ["DecisionNetworkVisual", "gatewayRef", "neon_orange_tech_network_hub.png", "decision-gateway", "Click the FrameLeads core", "DecisionNetworkVisual"]) {
    assert.ok(!component.includes(removed), "Obsolete network gateway remains: " + removed);
  }
});

test("homepage has a clear dedicated scenario CTA without replacing the Audit", () => {
  assert.ok(homepage.includes("HeroIntro"));
  assert.ok(hero.includes('href="/reply-decision-preview#scenarios"'));
  assert.ok(hero.includes("Explore 3 reply scenarios"));
  assert.ok(hero.includes("Find My Reply Bottleneck"));
  assert.ok(hero.includes("onAudit"));
  assert.ok(homepage.includes("AuditModal"));
});

test("scenario route opens the choices directly with pricing example visible", () => {
  assert.ok(component.includes('id="scenarios"'));
  assert.ok(component.includes('useState<ReplyScenario["id"]>("pricing")'));
  assert.ok(component.includes("Preselected example is readable immediately"));
  assert.ok(component.includes('aria-pressed={selected}'));
  assert.ok(component.includes("onClick={() => selectScenario(scenario.id)}"));
});

test("compact result follows the approved outcome-first wireframe", () => {
  assert.ok(component.includes("FRAMELEADS / REPLY INTELLIGENCE"));
  assert.ok(component.includes('data-testid="compact-decision-packet"'));
  assert.ok(component.includes("md:grid-cols-2"));
  assert.ok(component.includes("Incoming reply"));
  assert.ok(component.includes("Decision ready"));
  assert.ok(component.includes("scenario.nextAction"));
  assert.ok(component.includes("scenario.why"));
  assert.ok(component.includes("scenario.authority"));
});

test("explanation remains accessible and compact rather than seven stacked cards", () => {
  assert.ok(component.includes('data-testid="decision-explanation"'));
  assert.ok(component.includes("How the decision was reached"));
  for (const word of ["Intent", "Context", "Rules", "Approval"]) assert.ok(component.includes(word));
  for (const field of ["scenario.intent", "scenario.confidence", "scenario.context", "scenario.rule", "scenario.ruleSource", "scenario.authorityDetail", "scenario.safeguard"]) assert.ok(component.includes(field));
  assert.ok(!component.includes("NumberedSection"));
});

test("2.6 second illustrative processing is preserved with cancellation", () => {
  assert.ok(component.includes("[2600, 3240, 3880, 4520]"));
  assert.ok(component.includes("window.setTimeout"));
  assert.ok(component.includes("timers.forEach(window.clearTimeout)"));
  assert.ok(component.includes("Processing the sample reply"));
  assert.ok(component.includes("Skip animation"));
  assert.ok(component.includes("setCycle((value) => value + 1)"));
});

test("motion is optional and accessible", () => {
  assert.ok(component.includes("useReducedMotion"));
  assert.ok(component.includes("reducedMotion ? 0 : ms"));
  assert.ok(component.includes("aria-label"));
  assert.ok(component.includes("focus-visible:outline"));
  assert.ok(component.includes('role="status"'));
});

test("the preview contains no live writes or misleading customer proof", () => {
  for (const banned of ["fetch(", "navigator.sendBeacon", "dangerouslySetInnerHTML", "<form", "localStorage", "window.location.href"]) {
    assert.ok(!component.includes(banned), "Unexpected live behavior: " + banned);
  }
  assert.ok(component.includes("Fictional prospects and illustrative seller rules"));
  assert.ok(component.includes("No live inference"));
  assert.ok(route.includes("robots: { index: false, follow: false }"));
});

test("pricing and optional audit destinations are preserved", () => {
  assert.ok(component.includes('href="/checkout/micro-pilot"'));
  assert.ok(component.includes('href="/?audit=open"'));
  assert.ok(component.includes("$10 Micro-Pilot"));
  assert.ok(component.includes("25 prospects"));
  assert.ok(component.includes("up to three reply decision analyses"));
});

test("the chosen example has readable mobile layout", () => {
  assert.ok(component.includes("grid-cols-2"));
  assert.ok(component.includes("sm:grid-cols-4"));
  assert.ok(component.includes("md:grid-cols-2"));
  assert.ok(component.includes("min-w-0"));
  assert.ok(component.includes("break-words"));
  assert.ok(component.includes("overflow-x-clip"));
});

test("broken prospect image is not used as misleading proof", () => {
  assert.ok(component.includes("Fictional prospect"));
  assert.ok(component.includes("scenario.prospectName"));
  assert.ok(!component.includes("reply-preview-prospects.jpg"));
});
