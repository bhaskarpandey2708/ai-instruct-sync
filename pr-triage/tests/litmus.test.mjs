import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parseUnifiedDiff, triage, untestedChangedFiles } from "../dist/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function fileDiff(path, hunkBody, oldPath = path) {
  return [
    `diff --git a/${oldPath} b/${path}`,
    `--- a/${oldPath}`,
    `+++ b/${path}`,
    "@@ -10,6 +10,5 @@",
    ...hunkBody,
  ].join("\n");
}

const AUTH_DIFF = fileDiff("src/auth/login.ts", [
  " const token = req.headers.authorization;",
  "-try {",
  "-  validateToken(token);",
  "-} catch (err) {",
  "-  return res.status(401).end();",
  "-}",
  "+processToken(token);",
]);

const README_DIFF = fileDiff("README.md", [
  " # My project",
  "+One more sentence about the project.",
]);

const TESTED_PAIR_DIFF = [
  fileDiff("src/utils/math.ts", [" export function add(a, b) {", "+  return a + b;", " }"]),
  fileDiff("tests/math.test.ts", ["+test('add', () => assert.equal(add(1,2), 3));"]),
].join("\n");

test("parses unified diffs into files + hunks with counts", () => {
  const files = parseUnifiedDiff(AUTH_DIFF + "\n" + README_DIFF);
  assert.equal(files.length, 2);
  const auth = files.find((f) => f.file === "src/auth/login.ts");
  assert.ok(auth);
  assert.equal(auth.hunks.length, 1);
  assert.equal(auth.hunks[0].added, 1);
  assert.equal(auth.hunks[0].removed, 5);
  assert.equal(auth.status, "modified");
});

test("risk ranking: auth change with removed error handling beats README tweak", () => {
  const files = parseUnifiedDiff(AUTH_DIFF + "\n" + README_DIFF);
  const report = triage(files);
  assert.equal(report.ranked[0].file, "src/auth/login.ts");
  const ids = report.ranked[0].signals.map((s) => s.id);
  assert.ok(ids.includes("path/security"), "security path signal");
  assert.ok(ids.includes("content/error-handling-removed"), "error handling removed");
  assert.ok(ids.includes("coverage/untested"), "untested signal");
  const readme = report.ranked.find((h) => h.file === "README.md");
  assert.ok(readme.score <= 5, `docs damped, got ${readme.score}`);
  assert.ok(report.ranked[0].score > 40, `auth score ${report.ranked[0].score}`);
});

test("test coverage pairing: file with matching test change is not flagged", () => {
  const untested = untestedChangedFiles(parseUnifiedDiff(TESTED_PAIR_DIFF));
  assert.deepEqual(untested, []);
  const flagged = untestedChangedFiles(parseUnifiedDiff(AUTH_DIFF));
  assert.deepEqual(flagged, ["src/auth/login.ts"]);
});

test("placeholder and credential-shaped additions are flagged", () => {
  const fakeKey = ["sk-", "abc123def456ghi789jkl012"].join("");
  const diff = fileDiff("src/service.ts", [
    "+// TODO implement this properly",
    `+const key = "${fakeKey}";`,
  ]);
  const report = triage(parseUnifiedDiff(diff));
  const ids = report.ranked[0].signals.map((s) => s.id);
  assert.ok(ids.includes("content/ai-placeholder"), "placeholder flagged");
  assert.ok(ids.includes("content/secret-shaped"), "credential-shaped flagged");
});

test("empty/garbage input produces empty report, no throw", () => {
  const report = triage(parseUnifiedDiff("not a diff at all\nrandom text"));
  assert.equal(report.files, 0);
  assert.equal(report.ranked.length, 0);
});

test("CLI end-to-end: ranking output, --json, --min-score gate", () => {
  const dir = mkdtempSync(join(tmpdir(), "pr-triage-"));
  try {
    const diffPath = join(dir, "change.diff");
    writeFileSync(diffPath, AUTH_DIFF + "\n" + README_DIFF + "\n");

    const run = spawnSync(process.execPath, [join(ROOT, "dist", "cli.js"), diffPath], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /src\/auth\/login\.ts:10/);

    const json = spawnSync(
      process.execPath,
      [join(ROOT, "dist", "cli.js"), diffPath, "--json"],
      { encoding: "utf8" },
    );
    const parsed = JSON.parse(json.stdout);
    assert.equal(parsed.ranked[0].file, "src/auth/login.ts");

    const gate = spawnSync(
      process.execPath,
      [join(ROOT, "dist", "cli.js"), diffPath, "--min-score", "40"],
      { encoding: "utf8" },
    );
    assert.equal(gate.status, 1, "attention gate trips on risky diff");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
