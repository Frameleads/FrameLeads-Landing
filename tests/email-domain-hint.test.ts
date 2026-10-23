import assert from "node:assert/strict";
import test from "node:test";
import { suggestAuditEmailCorrection } from "../src/email-domain-hint.ts";

test("recognizes the observed gmaill.com typo without changing the local part", () => {
  assert.equal(suggestAuditEmailCorrection("AkramWALID993@gmaill.com"), "AkramWALID993@gmail.com");
  assert.equal(suggestAuditEmailCorrection("  akram@gmial.com  "), "akram@gmail.com");
});
test("does not alter valid custom business addresses or already-correct domains", () => {
  for (const email of ["akram@frameleads.io", "user@gmail.com", "user@mygmaill.com", "user@engineering.example", "", "x@@gmail.con"]) {
    assert.equal(suggestAuditEmailCorrection(email), null);
  }
});
