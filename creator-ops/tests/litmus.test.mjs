import { test } from "node:test";
import assert from "node:assert/strict";

import { pipelineSummary, calendarConflicts } from "../src/core.js";
test("pipeline + conflicts", () => {
  assert.equal(pipelineSummary([{ stage: "pitch", value: 1000 }, { stage: "won", value: 500 }]).pipelineValue, 1500);
  assert.equal(calendarConflicts([{ id: "a", start: 0, end: 10 }, { id: "b", start: 5, end: 15 }]).length, 1);
});

