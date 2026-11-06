import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const about = readFileSync(new URL("../src/app/about/page.tsx", import.meta.url), "utf8");
const homepage = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");

test("About page defines its own canonical metadata and official identity", () => {
  assert.ok(about.includes('canonical: "https://frameleads.io/about"'));
  assert.ok(about.includes('"@type": "AboutPage"'));
  assert.ok(about.includes("frameleads.io is the official website"));
  assert.ok(about.includes("BrandFlow Studio"));
});

test("question navigator contains ten directly linkable, visible answers", () => {
  const questions = [...about.matchAll(/\{ id: "([a-z-]+)", question:/g)].map((match) => match[1]);
  const answers = [...about.matchAll(/<Answer id="([a-z-]+)"/g)].map((match) => match[1]);
  assert.equal(questions.length, 10);
  assert.deepEqual(questions, answers);
  assert.ok(about.includes('aria-label="Jump to a FrameLeads question"'));
  assert.ok(about.includes('href={"#" + item.id}'));
  assert.ok(about.includes('scroll-mt-28'));
});

test("About page preserves approved positioning and an accessible next step", () => {
  for (const phrase of [
    "founder-led B2B",
    "after the reply",
    "human",
    "$149",
    "$499",
    "10,000 prospects",
    "Micro-Pilot",
    "/#reply-scenarios",
  ]) assert.ok(about.includes(phrase), "Missing required context: " + phrase);
});

test("Company footer points to About and sitemap lists the route", () => {
  const footer = homepage.slice(homepage.indexOf('aria-label="Footer company navigation"'), homepage.indexOf("<AuditModal"));
  assert.ok(footer.includes('href="/about"'));
  assert.ok(footer.includes(">About FrameLeads</Link>"));
  assert.ok(sitemap.includes('"/about"'));
});