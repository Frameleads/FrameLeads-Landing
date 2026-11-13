import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
import { spawnSync } from "node:child_process";

const zipPath = "public/resources/frameleads-affiliate-product-proof.zip";
const assets = [
  ["01-outbound-sandbox.png", "01-outbound-sandbox.png"],
  ["02-incoming-reply-20261102.png", "02-inbox-triage.png"],
  ["03-intent-context-20261102.png", "03-intent-and-context.png"],
  ["04-decision-packet-20261102.png", "04-decision-packet.png"],
] as const;

test("affiliate product proof kit is deterministically built from the same four How It Works images", () => {
  const script = spawnSync(process.execPath, ["scripts/build-affiliate-proof-kit.mjs"], { encoding: "utf8" });
  assert.equal(script.status, 0, script.stderr || script.stdout);
  const firstZip = fs.readFileSync(zipPath);
  assert.equal(firstZip.readUInt32LE(0), 0x04034b50);
  assert.equal(firstZip.readUInt32LE(firstZip.length - 22), 0x06054b50);
  assert.equal(firstZip.readUInt16LE(firstZip.length - 12), assets.length + 1);
  const rerun = spawnSync(process.execPath, ["scripts/build-affiliate-proof-kit.mjs"], { encoding: "utf8" });
  assert.equal(rerun.status, 0);
  assert.ok(firstZip.equals(fs.readFileSync(zipPath)), "ZIP must be deterministic");

  const index = firstZip.readUInt32LE(firstZip.length - 6);
  let cursor = index;
  const entries = new Map<string, Buffer>();
  for (let i = 0; i < assets.length + 1; i++) {
    assert.equal(firstZip.readUInt32LE(cursor), 0x02014b50);
    const method = firstZip.readUInt16LE(cursor + 10);
    const size = firstZip.readUInt32LE(cursor + 20);
    const decompressedSize = firstZip.readUInt32LE(cursor + 24);
    const nameLength = firstZip.readUInt16LE(cursor + 28);
    const extraLength = firstZip.readUInt16LE(cursor + 30);
    const commentLength = firstZip.readUInt16LE(cursor + 32);
    const localOffset = firstZip.readUInt32LE(cursor + 42);
    const name = firstZip.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    assert.equal(firstZip.readUInt32LE(localOffset), 0x04034b50);
    const dataStart = localOffset + 30 + firstZip.readUInt16LE(localOffset + 26)
      + firstZip.readUInt16LE(localOffset + 28);
    const raw = firstZip.subarray(dataStart, dataStart + size);
    const bytes = method === 8 ? inflateRawSync(raw) : raw;
    assert.equal(bytes.length, decompressedSize);
    entries.set(name, bytes);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  for (const [sourceName, archiveName] of assets) {
    const original = fs.readFileSync(path.join("public/images/product-proof", sourceName));
    assert.ok(entries.get(archiveName)?.equals(original), archiveName + " must be exactly the published asset");
  }
  const readme = entries.get("README-PARTNER-GUIDELINES.txt")?.toString("utf8") ?? "";
  assert.match(readme, /demo\/synthetic prospect data/);
  assert.match(readme, /Never imply FrameLeads autonomously sends or approves/);
  assert.doesNotMatch(readme, /@gmail\.com|secret_[A-Z]|sb_secret_/i);
});

test("affiliate Preview contains downloadable proof section with approved image references", () => {
  const page = fs.readFileSync("src/app/affiliates/page.tsx", "utf8");
  const component = fs.readFileSync("src/components/AffiliateProofKit.tsx", "utf8");
  assert.ok(page.includes("<AffiliateProofKit />"));
  assert.ok(component.includes('href="/resources/frameleads-affiliate-product-proof.zip"'));
  for (const [source] of assets) {
    assert.ok(component.includes("/images/product-proof/" + source));
  }
  assert.match(component, /Coming next:/);
  assert.match(component, /illustrative prospect data/);
  assert.doesNotMatch(component, /Google Drive|customer success stories|guaranteed 10x/i);
});
