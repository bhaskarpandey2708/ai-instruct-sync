import { test } from "node:test";
import assert from "node:assert/strict";

import { progress, DEFAULT_CHECKLIST } from "../src/core.js";
test("progress pct", () => {
  const r = progress({ laptop: true, github: true });
  assert.equal(r.done, 2);
  assert.equal(r.total, DEFAULT_CHECKLIST.length);
  assert.ok(r.pct > 0 && r.pct < 100);
});

