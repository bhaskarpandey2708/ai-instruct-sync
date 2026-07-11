import { test } from "node:test";
import assert from "node:assert/strict";

import { scoreShadowTools } from "../src/core.js";
test("flags unauthorized confidential tools", () => {
  const r = scoreShadowTools([
    { name: "ChatGPT", approved: false, dataClass: "confidential" },
    { name: "Claude Team", approved: true, dataClass: "internal" },
  ]);
  assert.equal(r.unauthorized.length, 1);
  assert.equal(r.severity, "medium");
});

