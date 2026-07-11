import { test } from "node:test";
import assert from "node:assert/strict";

import { riskRollup, staleCheckins } from "../src/core.js";
test("risk rollup", () => {
  const r = riskRollup([{ id: "s1", risk: "high" }, { id: "s2", risk: "low" }]);
  assert.equal(r.bands.high, 1);
  assert.equal(staleCheckins([{ id: "s1", lastCheckin: 0 }], Date.now(), 14).length, 1);
});

