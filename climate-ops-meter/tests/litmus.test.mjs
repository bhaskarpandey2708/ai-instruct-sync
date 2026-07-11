import { test } from "node:test";
import assert from "node:assert/strict";

import { estimateEmissions } from "../src/core.js";
test("emission estimate", () => {
  const r = estimateEmissions([{ type: "electricity_kwh", amount: 1000 }, { type: "diesel_l", amount: 10 }]);
  assert.ok(r.totalKgCO2e > 700);
});

