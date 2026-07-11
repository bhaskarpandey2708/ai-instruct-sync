import { test } from "node:test";
import assert from "node:assert/strict";

import { nextReview, dueCards } from "../src/core.js";
test("SRS interval grows", () => {
  let c = { id: "1", reps: 0, interval: 0, ef: 2.5 };
  c = nextReview(c, 5);
  assert.equal(c.interval, 1);
  c = nextReview(c, 5);
  assert.equal(c.interval, 6);
});

