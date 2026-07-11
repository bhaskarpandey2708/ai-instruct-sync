import { test } from "node:test";
import assert from "node:assert/strict";

import { mapEvidence } from "../src/core.js";
test("coverage", () => {
  const r = mapEvidence(
    [{ id: "CC6.1", title: "Access" }, { id: "CC7.2", title: "Logging" }],
    [{ id: "aws-iam", controls: ["CC6.1"] }],
  );
  assert.equal(r.covered, 1);
  assert.equal(r.coveragePct, 50);
});

