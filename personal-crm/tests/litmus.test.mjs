import { test } from "node:test";
import assert from "node:assert/strict";

import { peopleNeedingNudge, recordTouch } from "../src/core.js";
test("nudge list", () => {
  const now = Date.now();
  const r = peopleNeedingNudge([{ id: "a", lastTouch: now - 40*86400000 }, { id: "b", lastTouch: now }], now, 30);
  assert.equal(r.length, 1);
  assert.equal(recordTouch({ id: "a" }, now, "hi").notes.length, 1);
});

