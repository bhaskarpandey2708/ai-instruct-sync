import { test } from "node:test";
import assert from "node:assert/strict";

import { runSuite } from "../src/core.js";
test("eval suite pass/fail", () => {
  const r = runSuite([
    { id: "a", actual: "hello world", expectContains: ["hello"] },
    { id: "b", actual: "leak sk-ant-x", forbidContains: ["sk-ant"] },
  ]);
  assert.equal(r.passed, 1);
  assert.equal(r.failed, 1);
  assert.equal(r.ok, false);
});

