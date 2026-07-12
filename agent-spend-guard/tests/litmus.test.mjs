import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildReport,
  costOf,
  evaluateBudgets,
  parseClaudeCodeJsonl,
  parseGenericEvents,
  priceFor,
  summarize,
} from "../dist/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const NOW = new Date("2026-07-12T10:00:00Z");
const TODAY = "2026-07-12";

function ev(overrides = {}) {
  return {
    ts: `${TODAY}T09:00:00Z`,
    model: "claude-sonnet-5",
    inputTokens: 1_000_000,
    outputTokens: 0,
    ...overrides,
  };
}

test("pricing: prefix match + cost math", () => {
  assert.equal(priceFor("claude-sonnet-5").input, 3);
  assert.equal(priceFor("some-unknown-model").input, 5); // default fallback
  // 1M input tokens of sonnet at $3/M
  assert.ok(Math.abs(costOf(ev()) - 3) < 1e-9);
  // Overrides win
  assert.ok(Math.abs(costOf(ev(), { "claude-sonnet": { input: 6, output: 30 } }) - 6) < 1e-9);
});

test("parses Claude Code JSONL transcripts (malformed lines skipped)", () => {
  const lines = [
    JSON.stringify({
      timestamp: `${TODAY}T08:00:00Z`,
      message: { model: "claude-sonnet-5", usage: { input_tokens: 500, output_tokens: 200, cache_read_input_tokens: 100 } },
    }),
    "not json at all",
    JSON.stringify({ message: { usage: { input_tokens: 0, output_tokens: 0 } } }), // zero — skipped
    JSON.stringify({ type: "user", message: { content: "hi" } }), // no usage — skipped
  ].join("\n");
  const events = parseClaudeCodeJsonl(lines, "demo-project");
  assert.equal(events.length, 1);
  assert.equal(events[0].model, "claude-sonnet-5");
  assert.equal(events[0].inputTokens, 500);
  assert.equal(events[0].cacheReadTokens, 100);
  assert.equal(events[0].project, "demo-project");
});

test("parses generic event arrays", () => {
  const events = parseGenericEvents(
    JSON.stringify([
      { ts: `${TODAY}T01:00:00Z`, model: "gpt-4o", inputTokens: 10, outputTokens: 5, project: "x" },
      { bogus: true },
    ]),
  );
  assert.equal(events.length, 2); // bogus row normalizes to zero-token unknown event
  assert.equal(events[0].model, "gpt-4o");
  assert.equal(parseGenericEvents("{}").length, 0);
});

test("summarize aggregates by day/model/project", () => {
  const s = summarize([
    ev(),
    ev({ model: "claude-haiku-4", inputTokens: 0, outputTokens: 1000, project: "app" }),
  ]);
  assert.equal(s.events, 2);
  assert.ok(s.totalUsd > 3);
  assert.ok(s.byModel["claude-sonnet-5"]);
  assert.ok(s.byProject["app"]);
  assert.ok(s.byDay[TODAY] > 0);
});

test("budget verdicts: ok → warn → stop, worst wins", () => {
  const cheap = ev({ inputTokens: 100_000 }); // ~$0.30
  const dear = ev({ inputTokens: 10_000_000 }); // ~$30

  const ok = evaluateBudgets([cheap], { dailyUsd: 10 }, undefined, NOW);
  assert.equal(ok.verdict, "ok");

  const warn = evaluateBudgets([ev({ inputTokens: 3_000_000 })], { dailyUsd: 10 }, undefined, NOW);
  assert.equal(warn.verdict, "warn"); // $9 of $10 at default 0.8 threshold

  const stop = evaluateBudgets([dear], { dailyUsd: 10 }, undefined, NOW);
  assert.equal(stop.verdict, "stop");

  // Per-project limit trips independently of global
  const proj = evaluateBudgets(
    [ev({ project: "hot-app", inputTokens: 5_000_000 })],
    { monthlyUsd: 1000, perProjectUsd: { "hot-app": 10 } },
    undefined,
    NOW,
  );
  assert.equal(proj.verdict, "stop");
  assert.equal(proj.lines.length, 2);

  // Events outside the window don't count
  const oldEvent = ev({ ts: "2026-06-01T00:00:00Z", inputTokens: 50_000_000 });
  const windowed = evaluateBudgets([oldEvent], { dailyUsd: 1, monthlyUsd: 1 }, undefined, NOW);
  assert.equal(windowed.verdict, "ok");
});

test("buildReport carries summary + verdict", () => {
  const report = buildReport("/tmp/x", [ev({ inputTokens: 10_000_000 })], { budgets: { dailyUsd: 5 } }, NOW);
  assert.equal(report.verdict, "stop");
  assert.ok(report.summary.totalUsd > 5);
  assert.equal(report.lines[0].verdict, "stop");
});

test("CLI end-to-end: check exits 1 over budget, 0 within", () => {
  const dir = mkdtempSync(join(tmpdir(), "spend-guard-"));
  try {
    // Usage that costs ~$30 today at sonnet pricing
    const usage = [
      { ts: new Date().toISOString(), model: "claude-sonnet-5", inputTokens: 10_000_000, outputTokens: 0, project: "demo" },
    ];
    writeFileSync(join(dir, "usage.json"), JSON.stringify(usage));
    writeFileSync(join(dir, ".spend-guard.json"), JSON.stringify({ budgets: { dailyUsd: 10 } }));

    const over = spawnSync(process.execPath, [
      join(ROOT, "dist", "cli.js"), "check", "--cwd", dir, "--usage", join(dir, "usage.json"), "--no-user",
    ], { encoding: "utf8" });
    assert.equal(over.status, 1, over.stdout + over.stderr);
    assert.match(over.stdout, /STOP|kill-switch/i);

    writeFileSync(join(dir, ".spend-guard.json"), JSON.stringify({ budgets: { dailyUsd: 100 } }));
    const within = spawnSync(process.execPath, [
      join(ROOT, "dist", "cli.js"), "check", "--cwd", dir, "--usage", join(dir, "usage.json"), "--no-user",
    ], { encoding: "utf8" });
    assert.equal(within.status, 0, within.stdout + within.stderr);

    const json = spawnSync(process.execPath, [
      join(ROOT, "dist", "cli.js"), "status", "--cwd", dir, "--usage", join(dir, "usage.json"), "--no-user", "--json",
    ], { encoding: "utf8" });
    const parsed = JSON.parse(json.stdout);
    assert.equal(parsed.summary.events, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
