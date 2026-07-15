import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "src/cli.js");

test("cycle: main() does not throw on empty object", () => {
  assert.doesNotThrow(() => main({}));
  const out = main({});
  assert.notEqual(out, undefined);
  assert.notEqual(out, null);
  assert.equal(out.usage.eventCount, 0);
});

test("cycle: main() accepts empty events", () => {
  assert.doesNotThrow(() => main({ events: [] }));
});

test("cycle: CLI --help exits 0", () => {
  const r = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.ok((r.stdout || "").includes("llm-spend"));
  assert.ok((r.stdout || "").length > 40);
});

test("cycle: CLI demo path (no args) exits 0", () => {
  const r = spawnSync(process.execPath, [cli], {
    encoding: "utf8",
    cwd: root,
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout, /llm-spend|By provider|totalCostUsd|Budget/i);
});
