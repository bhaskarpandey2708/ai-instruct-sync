import { test } from "node:test";
import assert from "node:assert/strict";

import { emailRisk, velocityRisk, compositeSignals } from "../src/core.js";
test("disposable email high risk", () => {
  assert.equal(emailRisk("x@mailinator.com").band, "high");
});
test("velocity spikes", () => {
  const ts = Date.now();
  const r = velocityRisk([{ ts }, { ts: ts-1000 }, { ts: ts-2000 }, { ts: ts-3000 }, { ts: ts-4000 }]);
  assert.ok(r.score >= 60);
});

