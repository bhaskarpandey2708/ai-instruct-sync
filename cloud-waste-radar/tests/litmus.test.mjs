import { test } from "node:test";
import assert from "node:assert/strict";

import { findWaste } from "../src/core.js";
test("detects idle ebs and eip", () => {
  const r = findWaste([
    { id: "vol-1", type: "ebs", attached: false, monthlyUsd: 8 },
    { id: "eip-1", type: "eip", associated: false, monthlyUsd: 3.6 },
  ]);
  assert.equal(r.count, 2);
  assert.ok(r.monthlySavingsUsd > 10);
});

