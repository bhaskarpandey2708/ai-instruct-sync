import { test } from "node:test";
import assert from "node:assert/strict";

import { medsDue, scheduleNext } from "../src/core.js";
test("meds due and reschedule", () => {
  const now = 1000;
  assert.equal(medsDue([{ id: "m1", nextAt: 500 }, { id: "m2", nextAt: 2000 }], now).length, 1);
  assert.ok(scheduleNext({ everyHours: 8 }, now).nextAt === now + 8 * 3600000);
});

