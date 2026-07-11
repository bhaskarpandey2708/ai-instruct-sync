import { test } from "node:test";
import assert from "node:assert/strict";

import { invoiceHygiene } from "../src/core.js";
test("detects tax mismatch", () => {
  const r = invoiceHygiene([{ id: "1", gstin: "27AAPFU0939F1ZV", taxable: 1000, cgst: 50, sgst: 50 }]);
  assert.ok(r.issues.some(i => i.code === "tax_mismatch"));
});

