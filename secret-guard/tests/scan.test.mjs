import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scan, worstSeverity } from "../dist/scan.js";
import { findSecretHits, isAllowlistedSecretText } from "../dist/patterns.js";
import { toSarif } from "../dist/sarif.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fx = (name) => join(root, "fixtures", name);

test("allowlists example keys", () => {
  assert.equal(isAllowlistedSecretText("sk-ant-api03-example"), true);
  assert.equal(findSecretHits("ANTHROPIC_API_KEY=sk-ant-api03-example").length, 0);
});

test("detects live-looking anthropic/openai keys", () => {
  const hits = findSecretHits(
    "key=sk-ant-api03-THIS_IS_A_REAL_LOOKING_KEY_ABC123XYZ789",
  );
  assert.ok(hits.some((h) => h.id === "anthropic"));
});

test("clean fixture is ok", () => {
  const report = scan({ cwd: fx("clean"), includeUser: false });
  assert.equal(report.summary.error, 0);
  assert.equal(worstSeverity(report), "ok");
});

test("leaky rules fixture finds secrets", () => {
  const report = scan({ cwd: fx("leaky-rules"), includeUser: false });
  assert.ok(report.summary.error >= 1);
  assert.equal(worstSeverity(report), "error");
  assert.ok(report.findings.some((f) => f.kind === "agent-file"));
});

test("mcp hardcoded env is flagged", () => {
  const report = scan({ cwd: fx("mcp-hardcoded"), includeUser: false });
  assert.ok(report.summary.error >= 1);
  assert.ok(report.findings.some((f) => f.kind === "mcp-env" || f.pattern === "github-pat"));
});

test("env.example secrets are warnings", () => {
  const report = scan({ cwd: fx("env-example"), includeUser: false });
  assert.ok(report.findings.some((f) => f.kind === "env-example"));
  // env-example findings are warn severity
  assert.ok(report.findings.some((f) => f.kind === "env-example" && f.severity === "warn"));
});

test("sarif export has results", () => {
  const report = scan({ cwd: fx("leaky-rules"), includeUser: false });
  const sarif = toSarif(report);
  assert.equal(sarif.version, "2.1.0");
  assert.ok(sarif.runs[0].results.length >= 1);
});

test("snippets are redacted", () => {
  const report = scan({ cwd: fx("leaky-rules"), includeUser: false });
  for (const f of report.findings) {
    assert.ok(f.snippet.includes("…") || f.snippet === "****" || f.snippet.length <= 16);
    assert.ok(!f.snippet.includes("THIS_IS_A_REAL_LOOKING"));
  }
});
