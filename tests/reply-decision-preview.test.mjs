import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync("src/reply-decision-preview.ts", "utf8");
const component = readFileSync("src/components/ReplyDecisionPreview.tsx", "utf8");
const route = readFileSync("src/app/reply-decision-preview/page.tsx", "utf8");
const homepage = readFileSync("src/app/page.tsx", "utf8");

test("three buyer-problem scenarios cover ambiguous, pricing and security handoff", () => {
  for (const id of ['id: "ambiguous"', 'id: "pricing"', 'id: "handoff"']) assert.ok(source.includes(id));
  for (const phrase of ["possible interest", "Commercial exceptions", "Security or compliance", "human", "illustrative"]) {
    assert.match(source.toLowerCase(), new RegExp(phrase.toLowerCase()));
  }
  assert.match(source, /No invented lead score/);
  assert.match(source, /No discount is granted/);
  assert.match(source, /No security assurance is fabricated/);
});

test("experience is ungated, read-only and truthful about synthetic examples", () => {
  assert.match(component, /No signup, no form, no live email sent/);
  assert.match(component, /fictional companies, illustrative seller rules/);
  assert.match(component, /not live AI evaluations/i);
  assert.doesNotMatch(component, /<form\b|fetch\(|navigator\.sendBeacon|dangerouslySetInnerHTML|localStorage/);
  assert.match(route, /robots: \{ index: false, follow: false \}/);
});

test("preview makes outcome and authority clearer than generic reply categorization", () => {
  for (const label of ["Understand the reply", "Read the context", "Apply the seller&#39;s rules", "Recommended next action", "Human"]) {
    assert.ok(component.includes(label) || source.includes(label), "Missing: " + label);
  }
  assert.match(component, /scenario\.authorityDetail/);
  assert.match(component, /scenario\.safeguard/);
  assert.match(component, /scenario\.currentWorkaround/);
});

test("one-click scenario selection and responsive no-squeeze layout", () => {
  assert.match(component, /onClick=\{\(\) => selectScenario\(s\.id\)\}/);
  assert.match(component, /aria-pressed=\{selected\}/);
  assert.match(component, /md:grid-cols-3/);
  assert.match(component, /lg:grid-cols-\[minmax\(0,\.78fr\)_minmax\(0,1\.22fr\)\]/);
  assert.match(component, /max-w-\[1220px\]/);
  assert.match(component, /min-w-0/);
  assert.match(component, /break-words/);
  assert.match(component, /scrollIntoView/);
});

test("conversion path uses existing pilot and optional audit without altering homepage", () => {
  assert.match(component, /href="\/checkout\/micro-pilot"/);
  assert.match(component, /href="\/\?audit=open"/);
  assert.match(component, /\$10 Micro-Pilot/);
  assert.match(homepage, /AuditModal/);
  assert.doesNotMatch(homepage, /ReplyDecisionPreview/);
});

test("fictional inbox personas use locally hosted AI-generated portraits and explicit disclosure", () => {
  assert.match(component, /reply-preview-prospects\.jpg/);
  assert.match(component, /<Image/);
  assert.match(component, /onError=\{\(\) => setFailed\(true\)\}/);
  assert.match(component, /Fictional prospect/);
  for (const name of ["Maya Chen", "Daniel Brooks", "Nadia Hassan"]) assert.ok(source.includes(name));
  assert.match(component, /Illustrative inbound email/);
});

test("sample decision reveal animates after 2.6 seconds, supports replay and reduced motion", () => {
  assert.match(component, /\[650, 1300, 1950, 2600\]/);
  assert.match(component, /useReducedMotion/);
  assert.match(component, /setRevealCount\(revealIndex \+ 1\)/);
  assert.match(component, /revealCount > 5/);
  assert.match(component, /revealCount > 0/);
  assert.match(component, /Skip animation/);
  assert.match(component, /setSequence\(\(current\) => current \+ 1\)/);
  assert.match(component, /timersRef\.current\.forEach\(window\.clearTimeout\)/);
  assert.match(component, /not a live AI analysis/);
});

test("scenario description sits below the title and cards use layered charcoal warmth", () => {
  assert.match(component, /flex flex-col items-start gap-2/);
  assert.match(component, /radial-gradient\(ellipse_at_100%_0%/);
  assert.match(component, /hover:-translate-y-0\.5/);
});

test("decision gateway provides an accessible inline disclosure and matching CTA", () => {
  assert.match(component, /The Decision Intelligence Layer/);
  assert.match(component, /See what happens between a reply and the next move/);
  assert.match(component, /FrameLeads connects reply intent, prospect context and seller rules/);
  assert.match(component, /Explore 3 reply scenarios/);
  assert.match(component, /<details ref=\{gatewayRef\}/);
  assert.match(component, /<summary onClick=\{\(event\) => \{ event\.preventDefault\(\); openScenarios\(\); \}\} aria-label="Explore FrameLeads reply decision scenarios"/);
  assert.match(component, /gatewayRef\.current\.open = true/);
  assert.match(component, /src="\/images\/neon_orange_tech_network_hub\.png"/);
  assert.match(component, /width=\{1916\} height=\{821\}/);
  assert.match(component, /sizes="\(max-width: 900px\) 100vw, 900px" unoptimized/);
  assert.match(component, /className="block h-auto w-full"/);
  for (const concept of ["Incoming reply", "Recommended action"]) {
    assert.ok(component.includes(concept), "Missing gateway concept: " + concept);
  }
});


test("brand-bolt loader visibly pulses before any decision layer is revealed", () => {
  assert.match(component, /src="\/icon-192\.png"/);
  assert.match(component, /Processing reply/);
  assert.match(component, /boxShadow: \[/);
  assert.match(component, /drop-shadow\(/);
  assert.match(component, /stage < 4 \? <DecisionProcessing/);
  assert.match(component, /\[650, 1300, 1950, 2600\]/);
  assert.match(component, /scrollIntoView/);
});

test("seven decision concepts use six compact icon modules", () => {
  assert.match(component, /data-testid="compact-decision-grid"/);
  assert.match(component, /lg:grid-cols-2/);
  assert.match(component, /decisionIconPaths/);
  for (const title of ["AI interpretation", "Relevant context", "Why human review \/ seller rule", "Intent and governance", "Recommended next action", "Final safeguard"]) {
    assert.ok(component.includes(title), "Missing layer: " + title);
  }
  assert.match(component, /REVEAL_INTERVAL_MS = 640/);
  assert.match(component, /revealIndex \* REVEAL_INTERVAL_MS/);
});
