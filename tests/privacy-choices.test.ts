import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../src/components/PrivacyChoices.tsx", import.meta.url), "utf8");

test("Whop Pixel remains advertising-consent gated and resumes after explicit re-consent", () => {
  assert.match(source, /<WhopAnalytics enabled=\{consent\?\.advertising === true\} \/>/);
  assert.match(source, /window\.whop\.__frameleadsPausedTrack = window\.whop\.track/);
  assert.match(source, /window\.whop\.__frameleadsPausedSetScope = window\.whop\.setScope/);
  assert.match(source, /window\.whop\.track = \(\) => \{\}/);
  assert.match(source, /window\.whop\.track = window\.whop\.__frameleadsPausedTrack/);
  assert.match(source, /window\.whop\.setScope = window\.whop\.__frameleadsPausedSetScope/);
  assert.match(source, /delete window\.whop\.__frameleadsPausedTrack/);
  assert.match(source, /window\.whop\.__frameleadsDisabled = false/);
  assert.match(source, /script\.id = "whop-pixel"/);
  assert.match(source, /script\.src = "https:\/\/t\.whop\.tw\/s\.js"/);
});


test("Privacy Choices popup and actions align left without changing consent controls", () => {
  assert.match(source, /sm:left-5 sm:w-\[min\(92vw,38rem\)\]/);
  assert.doesNotMatch(source, /sm:right-5 sm:w-\[min\(92vw,38rem\)\]/);
  assert.match(source, /mt-5 flex flex-wrap items-center justify-start gap-2/);
  for (const label of ["Reject optional", "Accept optional", "Manage choices", "Save preferences"]) {
    assert.ok(source.includes(label));
  }
  assert.ok(source.includes("savePrivacyConsent(next)"));
});
