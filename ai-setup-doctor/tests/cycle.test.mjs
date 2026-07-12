import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

test("cycle: package has name and version", () => {
  assert.ok(pkg.name);
  assert.ok(pkg.version);
  assert.match(pkg.version, /alpha|beta|\d+\.\d+\.\d+/);
});

test("cycle: LICENSE exists", () => {
  assert.ok(existsSync(path.join(root, "LICENSE")));
});

test("cycle: README exists", () => {
  assert.ok(existsSync(path.join(root, "README.md")));
});

test("cycle: npm test script defined", () => {
  assert.ok(pkg.scripts && pkg.scripts.test);
});
