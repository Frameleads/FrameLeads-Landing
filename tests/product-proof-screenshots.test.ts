import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../src/components/ProductProofHowItWorks.tsx", import.meta.url), "utf8");
const assets = [
  { name: "02-incoming-reply-20261102.png", step: "02", width: 1497, height: 862, gitSha: "4af807eedba7a3e123a4d9ae008fd1d8f75f415b" },
  { name: "03-intent-context-20261102.png", step: "03", width: 1572, height: 831, gitSha: "18d71252422906e14e967ad8e4cb379a437ce09a" },
  { name: "04-decision-packet-20261102.png", step: "04", width: 1532, height: 867, gitSha: "805e06c251666bb69e2509ef2466b731f49fbf98" },
];

test("Outbound Sandbox first-step screenshot stays untouched", () => {
  assert.match(source, /number: "01", title: "Prepare outreach with context"[^\n]*src: "\/images\/product-proof\/01-outbound-sandbox\.png", width: 1497, height: 787/);
});

for (const { name, step, width, height, gitSha } of assets) {
  test(`How It Works step ${step} displays its verified original screenshot ${name}`, () => {
    const bytes = readFileSync(new URL(`../public/images/product-proof/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
    const expectedGitSha = createHash("sha1")
      .update(`blob ${bytes.length}\0`, "utf8").update(bytes).digest("hex");
    assert.equal(expectedGitSha, gitSha, "Image must be byte-identical to the supplied screenshot");
    assert.match(source, new RegExp(`number: "${step}"[^\\n]*src: "/images/product-proof/${name.replace(/\\./g, "\\\\.")}", width: ${width}, height: ${height}`));
  });
}

test("Screenshot viewer and visual treatment remain available for desktop and mobile", () => {
  assert.match(source, /function ScreenshotVisual/);
  assert.match(source, /id="proof-panel"/);
  assert.match(source, /id="proof-mobile-panel"/);
  assert.match(source, /lightboxOpen/);
  assert.match(source, /bg-\[radial-gradient\(ellipse_at_center/);
  assert.match(source, /observeMeasurement\("HOW_IT_WORKS_INTERACTED"\)/);
});
