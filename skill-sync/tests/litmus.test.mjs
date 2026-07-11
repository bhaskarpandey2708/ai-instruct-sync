import { test } from "node:test";
import assert from "node:assert/strict";

import { validateSkillPackage, planInstall } from "../src/core.js";
test("validates skill package", () => {
  const r = validateSkillPackage({ name: "team", version: "1.0.0", skills: [{ id: "style", content: "use TS" }] });
  assert.equal(r.ok, true);
});
test("planInstall diffs", () => {
  const p = planInstall({ skills: [{ id: "a", content: "1" }] }, { skills: [{ id: "a", content: "2" }, { id: "b", content: "x" }] });
  assert.deepEqual(p.updated, ["a"]);
  assert.deepEqual(p.added, ["b"]);
});

