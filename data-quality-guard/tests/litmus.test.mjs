import { test } from "node:test";
import assert from "node:assert/strict";

import { runExpectations } from "../src/core.js";
test("dq checks", () => {
  const r = runExpectations(
    [{ id: 1, amount: 10 }, { id: 2, amount: 5 }, { id: 2, amount: 99 }],
    [{ id: "u", type: "unique", column: "id" }, { id: "r", type: "range", column: "amount", min: 0, max: 50 }],
  );
  assert.equal(r.ok, false);
});

