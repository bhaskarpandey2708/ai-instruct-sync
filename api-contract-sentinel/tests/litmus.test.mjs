import { test } from "node:test";
import assert from "node:assert/strict";

import { diffOpenApi } from "../src/core.js";
test("detects breaking path removal", () => {
  const r = diffOpenApi(
    { paths: { "/v1/users": { get: {} } } },
    { paths: {} },
  );
  assert.equal(r.ok, false);
  assert.ok(r.breaks.some(b => b.type === "path_removed"));
});
test("required field is breaking", () => {
  const r = diffOpenApi(
    { paths: { "/x": { post: { requestBody: { requiredProps: ["a"] } } } } },
    { paths: { "/x": { post: { requestBody: { requiredProps: ["a", "b"] } } } } },
  );
  assert.ok(r.breaks.some(b => b.type === "required_field_added"));
});

