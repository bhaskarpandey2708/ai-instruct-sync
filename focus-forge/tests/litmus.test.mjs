import { test } from "node:test";
import assert from "node:assert/strict";

import { sessionScore, weeklyReview } from "../src/core.js";
test("focus scoring", () => {
  assert.ok(sessionScore({ plannedMin: 50, actualMin: 50, distractions: 0 }).deep);
  assert.equal(weeklyReview([{ plannedMin: 25, actualMin: 25, distractions: 0 }]).sessions, 1);
});

