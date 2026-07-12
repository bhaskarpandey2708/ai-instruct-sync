import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("cycle: main() does not throw on empty object", () => {
  assert.doesNotThrow(() => main({}));
  const out = main({});
  assert.notEqual(out, undefined);
  assert.notEqual(out, null);
});

test("cycle: main() accepts undefined-ish fields", () => {
  assert.doesNotThrow(() => main({ events: [], rows: [], items: [], tools: [], inventory: [], activities: [], cases: [], invoices: [], suppliers: [], people: [], sessions: [], meds: [], cards: [], deals: [], controls: [], artifacts: [], busy: [], patients: [], appts: [] }));
});

test("cycle: CLI --help exits 0", () => {
  const cli = path.join(root, "src/cli.js");
  const r = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.ok((r.stdout || "").length > 10);
});
