import { test } from "node:test";
import assert from "node:assert/strict";

import { sbomFromPackageLock, policyGate } from "../src/core.js";
test("sbom from lock packages", () => {
  const s = sbomFromPackageLock({ packages: { "": {}, "node_modules/left-pad": { version: "1.0.0", license: "MIT" } } });
  assert.equal(s.count, 1);
  assert.equal(s.components[0].name, "left-pad");
});
test("policy gate fails on GPL", () => {
  const s = { components: [{ name: "x", license: "GPL-3.0" }] };
  assert.equal(policyGate(s).ok, false);
});

