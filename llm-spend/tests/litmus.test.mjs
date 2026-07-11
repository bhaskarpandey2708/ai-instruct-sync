import { test } from "node:test";
import assert from "node:assert/strict";

import { parseUsageEvents, budgetStatus } from "../src/core.js";
test("aggregates multi-provider spend", () => {
  const r = parseUsageEvents([
    { provider: "openai", tokens: 1000, pricePer1k: 0.01 },
    { provider: "anthropic", tokens: 2000, pricePer1k: 0.015 },
  ]);
  assert.equal(r.totalTokens, 3000);
  assert.ok(r.totalCostUsd > 0);
  assert.equal(r.byProvider.openai.calls, 1);
});
test("budget over triggers", () => {
  assert.equal(budgetStatus(12, 10).over, true);
  assert.equal(budgetStatus(5, 10).over, false);
});

