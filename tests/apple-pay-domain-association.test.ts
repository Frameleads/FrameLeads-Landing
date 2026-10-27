import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

// Apple Pay/Whop uses this publicly served payload to verify frameleads.io.
// It must be served without a filename extension, redirect or transformation.
test("Whop-issued Apple Pay association file remains byte-for-byte unchanged", () => {
  const bytes = readFileSync("public/.well-known/apple-developer-merchantid-domain-association");
  assert.equal(bytes.byteLength, 228);
  assert.match(bytes.toString("ascii"), /^[0-9a-f]+$/i);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "5d3b5ecee0a3778d40f056bf81bb80dbd36f47e83435a5b41b963f5d414def4c",
  );
  const parsed: unknown = JSON.parse(Buffer.from(bytes.toString("ascii"), "hex").toString("utf8"));
  assert.ok(parsed && typeof parsed === "object" && "version" in parsed && parsed.version === 1);
});
