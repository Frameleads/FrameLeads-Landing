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
