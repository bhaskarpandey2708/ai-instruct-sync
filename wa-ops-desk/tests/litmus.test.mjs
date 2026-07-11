import { test } from "node:test";
import assert from "node:assert/strict";

import { routeMessage } from "../src/core.js";
test("routes order to staff", () => {
  const r = routeMessage({ text: "Where is my order?" }, [{ id: "s1", labels: ["orders"], load: 1 }]);
  assert.equal(r.label, "orders");
  assert.equal(r.assignee, "s1");
});

