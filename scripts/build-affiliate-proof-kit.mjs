import fs from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

const root = process.cwd();
const imageRoot = path.join(root, "public/images/product-proof");
const target = path.join(root, "public/resources/frameleads-affiliate-product-proof.zip");

const approvedImages = [
  ["01-outbound-sandbox.png", "01-outbound-sandbox.png"],
  ["02-incoming-reply-20261102.png", "02-inbox-triage.png"],
  ["03-intent-context-20261102.png", "03-intent-and-context.png"],
  ["04-decision-packet-20261102.png", "04-decision-packet.png"],
];

const readme = `FRAMELEADS / AFFILIATE PRODUCT-PROOF KIT
Edition: November 2026

These are approved screenshots of the FrameLeads application, using illustrative
demo/synthetic prospect data. No screenshot represents a paid customer result.

WHAT'S INCLUDED
01 — Outbound Sandbox: a prepared prospect-specific outreach workspace.
02 — Inbox Triage: incoming replies and queue prioritization.
03 — Intent and Context: why an interested prospect still needs a decision.
04 — Decision Packet: governance recommendations and human review for
     commercial exceptions; no unauthorized reply is sent.

USE
• You may share these original, unaltered screenshots to explain the
  FrameLeads product, including in review posts, articles and video edits.
• Frame them as product demonstrations, not proof of revenue, conversion
  rates, commercial success or specific customer outcomes.
• Never imply FrameLeads autonomously sends or approves consequential replies.
• Don't claim the sample prospect names, scores or companies are real buyers.
• For commissions, links and current rules, consult your own Whop affiliate
  dashboard and the latest partner instructions.

This bundle is the same approved four-screen set currently featured in
FrameLeads' How It Works section: https://frameleads.io/#how-it-works
Updated walkthrough screen recordings can be added later without changing
your affiliate relationship.

© 2026 FrameLeads · BrandFlow Studio
`;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let n = index;
  for (let j = 0; j < 8; j++) n = (n & 1) ? ((n >>> 1) ^ 0xedb88320) : (n >>> 1);
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, bytes } of files) {
    const filename = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(bytes, { level: 9 });
    const checksum = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // DEFLATE
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x0021, 12); // 1980-01-01, reproducible
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(filename.length, 26);
    local.writeUInt16LE(0, 28);
    const entry = Buffer.concat([local, filename, compressed]);
    locals.push(entry);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x0021, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(bytes.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, filename]));
    offset += entry.length;
  }
  const dir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, dir, end]);
}

const files = approvedImages.map(([file, assetName]) => {
  const bytes = fs.readFileSync(path.join(imageRoot, file));
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Product-proof asset is not a PNG: " + file);
  }
  return { name: assetName, bytes };
});
files.push({ name: "README-PARTNER-GUIDELINES.txt", bytes: Buffer.from(readme, "utf8") });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, makeZip(files));
console.log("FrameLeads affiliate proof kit built from four approved How It Works images.");
