import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  parseUsageEvents,
  budgetStatus,
  main,
  normalizeEvent,
  parseUsageText,
} from "../src/core.js";
import { costOf, priceFor } from "../src/prices.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sample = path.join(root, "fixtures", "sample.json");
const over = path.join(root, "fixtures", "over-budget.json");
const cli = path.join(root, "src", "cli.js");

test("aggregates multi-provider spend", () => {
  const r = parseUsageEvents([
    { provider: "openai", model: "gpt-4o", inputTokens: 1000, outputTokens: 500 },
    { provider: "anthropic", model: "claude-sonnet", inputTokens: 2000, outputTokens: 800 },
  ]);
  assert.equal(r.eventCount, 2);
  assert.ok(r.totalTokens > 0);
  assert.ok(r.totalCostUsd > 0);
  assert.equal(r.byProvider.openai.calls, 1);
  assert.equal(r.byProvider.anthropic.calls, 1);
  assert.ok(r.byModel["gpt-4o"]);
});

test("budget over / warn / ok", () => {
  assert.equal(budgetStatus(12, 10).over, true);
  assert.equal(budgetStatus(5, 10).over, false);
  assert.equal(budgetStatus(9, 10).warn, true);
  assert.equal(budgetStatus(5, 10).warn, false);
});

test("prices known models and fallback", () => {
  assert.ok(priceFor("gpt-4o").input > 0);
  assert.ok(priceFor("claude-sonnet-4").input > 0);
  assert.ok(priceFor("totally-unknown-xyz").input > 0);
  const c = costOf({ model: "gpt-4o", inputTokens: 1_000_000, outputTokens: 0 });
  assert.ok(Math.abs(c - 2.5) < 0.01);
});

test("normalize accepts provider aliases and legacy tokens", () => {
  const a = normalizeEvent({ vendor: "openai", model: "gpt-4o-mini", tokens: 1000 });
  assert.equal(a.provider, "openai");
  assert.ok(a.costUsd > 0);
  const b = normalizeEvent({
    provider: "openai",
    tokens: 1000,
    pricePer1k: 0.01,
  });
  assert.equal(b.costUsd, 0.01);
});

test("main() on sample fixture", () => {
  const input = JSON.parse(readFileSync(sample, "utf8"));
  const r = main(input);
  assert.equal(r.product, "llm-spend");
  assert.ok(r.usage.eventCount >= 5);
  assert.ok(r.usage.totalCostUsd > 0);
  assert.ok(r.usage.byProvider.openai);
  assert.ok(r.usage.byProvider.anthropic);
  assert.ok(r.usage.byProject["chat-api"]);
  assert.ok(["ok", "warn", "over"].includes(r.verdict));
});

test("main() over-budget fixture", () => {
  const input = JSON.parse(readFileSync(over, "utf8"));
  const r = main(input);
  assert.equal(r.verdict, "over");
  assert.equal(r.budget.over, true);
});

test("parseUsageText JSONL", () => {
  const text = [
    JSON.stringify({ provider: "openai", model: "gpt-4o", inputTokens: 100, outputTokens: 50 }),
    JSON.stringify({ provider: "google", model: "gemini-1.5-pro", inputTokens: 200, outputTokens: 20 }),
  ].join("\n");
  const events = parseUsageText(text);
  assert.equal(events.length, 2);
  const r = parseUsageEvents(events);
  assert.equal(r.eventCount, 2);
});

test("CLI human report exits 0 on sample", () => {
  const r = spawnSync(process.execPath, [cli, sample], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout, /llm-spend/);
  assert.match(r.stdout, /By provider/);
  assert.match(r.stdout, /Budget/);
});

test("CLI --json includes product and usage", () => {
  const r = spawnSync(process.execPath, [cli, "--json", sample], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const j = JSON.parse(r.stdout);
  assert.equal(j.product, "llm-spend");
  assert.equal(j.id, "P05");
  assert.ok(j.usage.totalCostUsd > 0);
});

test("CLI --strict exits 1 when over budget", () => {
  const r = spawnSync(process.execPath, [cli, "--strict", over], { encoding: "utf8" });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /OVER|Over budget/i);
});

test("CLI --budget overrides file budget", () => {
  const r = spawnSync(process.execPath, [cli, "--json", "--budget", "0.001", sample], {
    encoding: "utf8",
  });
  assert.equal(r.status, 0);
  const j = JSON.parse(r.stdout);
  assert.equal(j.budget.budgetUsd, 0.001);
  assert.equal(j.verdict, "over");
});
