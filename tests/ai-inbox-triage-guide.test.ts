import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";

const guide = readFileSync(new URL("../src/app/ai-inbox-triage/page.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/app/about/page.tsx", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");

test("outbound reply guide has accurate, unique canonical metadata", () => {
  assert.ok(guide.includes('https://frameleads.io/ai-inbox-triage'));
  assert.ok(guide.includes('title: "AI Inbox Triage for B2B Outbound Sales | FrameLeads"'));
  assert.ok(guide.includes('alternates: { canonical }'));
  assert.ok(guide.includes('"@type": "Article"'));
  assert.ok(guide.includes('"@type": "BreadcrumbList"'));
  assert.ok(!guide.includes('"@type": "FAQPage"'));
});

test("10 user questions map to 10 visible, directly linked answer sections", () => {
  const questions = [...guide.matchAll(/\{ id: "([a-z-]+)", q:/g)].map((x) => x[1]);
  const answers = [...guide.matchAll(/<Section id="([a-z-]+)"/g)].map((x) => x[1]);
  assert.equal(questions.length, 10);
  assert.deepEqual(questions, answers);
  assert.ok(guide.includes('aria-label="Jump to an outbound reply management question"'));
  assert.ok(guide.includes('href={"#" + item.id}'));
  assert.ok(guide.includes('scroll-mt-28'));
});

test("first guide contains all product-relevant questions, safeguards and proof", () => {
  for (const phrase of [
    "AI lead generation", "outbound automation", "cold email replies", "buyer intent",
    "pricing", "objections", "human", "Instantly", "Smartlead", "SDR",
    "FrameLeads", "test/demo", "not a verified ranking of Google search volume",
    "Explore Reply Scenarios",
  ]) {
    assert.ok(guide.includes(phrase), "Missing expected topic: " + phrase);
  }
  for (const screenshot of [
    "02-incoming-reply-20261102.png", "04-decision-packet-20261102.png",
  ]) {
    assert.ok(guide.includes(screenshot));
    assert.ok(existsSync(new URL("../public/images/product-proof/" + screenshot, import.meta.url)), "Screenshot not found: " + screenshot);
  }
});

test("the guide is crawlably linked without modifying the primary homepage navbar", () => {
  const footer = home.slice(home.indexOf('aria-label="Footer product navigation"'), home.indexOf('aria-label="Footer company navigation"'));
  assert.ok(footer.includes('href="/ai-inbox-triage"'));
  assert.ok(about.includes('<Link href="/ai-inbox-triage">AI Inbox Triage guide for B2B outbound teams</Link>'));
  assert.ok(sitemap.includes('"/ai-inbox-triage"'));
  assert.ok(home.includes('<ReplyDecisionPreview embedded />'));
  assert.ok(home.includes('<ExitIntentPopup openRequest={isMicroPilotRequested}'));
});
