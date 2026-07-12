#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GuardReport, UsageEvent, Verdict } from "./types.js";
import { CONFIG_FILENAME, buildReport, loadConfig, sampleConfig } from "./guard.js";
import { collectClaudeCodeUsage, parseClaudeCodeJsonl, parseGenericEvents } from "./usage.js";

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);

function verdictLabel(v: Verdict): string {
  if (v === "stop") return red(bold("STOP"));
  if (v === "warn") return yellow("WARN");
  return green("OK");
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function printReport(report: GuardReport, verbose: boolean): void {
  console.log(bold("agent-spend-guard") + dim(` — ${report.cwd}`));
  console.log(
    dim(`Node ${report.node} · ${report.platform} · ${report.checkedAt} · ${report.summary.events} usage events`),
  );
  console.log();

  const s = report.summary;
  console.log(
    `  ${bold("Spend")} ${usd(s.totalUsd)}  ${dim(`· ${s.totalTokens.toLocaleString()} tokens across ${s.events} calls`)}`,
  );

  const models = Object.entries(s.byModel).sort((a, b) => b[1].usd - a[1].usd).slice(0, 5);
  for (const [model, m] of models) {
    console.log(dim(`    ${model}  ${usd(m.usd)} · ${m.tokens.toLocaleString()} tok · ${m.calls} calls`));
  }
  if (verbose) {
    const projects = Object.entries(s.byProject).sort((a, b) => b[1].usd - a[1].usd).slice(0, 8);
    for (const [project, p] of projects) {
      console.log(dim(`    ${project}  ${usd(p.usd)} · ${p.calls} calls`));
    }
  }
  console.log();

  if (report.lines.length === 0) {
    console.log(dim(`  No budgets configured — create ${CONFIG_FILENAME} (try: agent-spend-guard init)`));
  }
  for (const l of report.lines) {
    const bar = l.pct >= 1 ? red : l.pct >= 0.8 ? yellow : green;
    console.log(
      `  ${verdictLabel(l.verdict)} ${bold(l.scope)}  ${bar(usd(l.spentUsd))} / ${usd(l.limitUsd)} ${dim(`(${Math.round(l.pct * 100)}%)`)}`,
    );
  }

  console.log();
  if (report.verdict === "stop") {
    console.log(red(bold("Budget exceeded — kill-switch active (exit 1). Agents should stop.")));
  } else if (report.verdict === "warn") {
    console.log(yellow("Approaching budget — consider smaller models or a pause."));
  } else {
    console.log(green("Within budget."));
  }
}

function printHelp(): void {
  console.log(`${bold("agent-spend-guard")} — token budgets + kill-switch for AI coding agents

Reads real usage (Claude Code transcripts, generic event files), prices it,
and enforces daily / monthly / per-project USD budgets. Read-only; nothing
leaves your machine.

Usage
  agent-spend-guard [command] [options]

Commands
  status         Show spend vs budgets (default)
  check          Same as status but built for hooks/CI: exit 1 on STOP
  init           Write a sample ${CONFIG_FILENAME} to --cwd
  help           Show this help

Options
  --cwd <dir>        Project directory holding ${CONFIG_FILENAME} (default: .)
  --usage <file>     Add a usage file (repeatable): .jsonl transcript or JSON event array
  --no-user          Skip scanning ~/.claude/projects transcripts
  --json             Machine-readable report
  --strict           check: exit 1 on WARN as well as STOP
  --verbose, -v      Per-project breakdown

Kill-switch wiring
  Claude Code hook (settings.json → hooks.PreToolUse):
    { "type": "command", "command": "npx agent-spend-guard check --cwd ." }
  CI gate:
    npx agent-spend-guard check --strict

Config (${CONFIG_FILENAME})
  { "budgets": { "dailyUsd": 25, "monthlyUsd": 300,
                 "perProjectUsd": { "my-app": 100 }, "warnAtPct": 0.8 },
    "prices": { "claude-sonnet": { "input": 3, "output": 15 } } }

Exit codes
  0 ok/warn (status) · 1 stop (check; warn too with --strict) · 2 usage error
`);
}

function loadUsageFile(path: string): UsageEvent[] {
  const text = readFileSync(path, "utf8");
  if (path.endsWith(".jsonl")) return parseClaudeCodeJsonl(text);
  const generic = parseGenericEvents(text);
  if (generic.length > 0) return generic;
  return parseClaudeCodeJsonl(text);
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cwd: { type: "string" },
      usage: { type: "string", multiple: true },
      json: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      verbose: { type: "boolean", default: false, short: "v" },
      "no-user": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0] ?? "status";
  if (values.help || cmd === "help") {
    printHelp();
    process.exit(0);
  }

  const cwd = resolve(typeof values.cwd === "string" ? values.cwd : process.cwd());

  if (cmd === "init") {
    const path = join(cwd, CONFIG_FILENAME);
    if (existsSync(path)) {
      console.error(yellow(`${CONFIG_FILENAME} already exists at ${cwd} — not overwriting.`));
      process.exit(2);
    }
    writeFileSync(path, JSON.stringify(sampleConfig(), null, 2) + "\n");
    console.log(green(`Wrote ${path}`));
    console.log(dim("Edit the budgets, then run: agent-spend-guard status"));
    process.exit(0);
  }

  if (cmd !== "status" && cmd !== "check") {
    console.error(red(`Unknown command: ${cmd}`));
    printHelp();
    process.exit(2);
  }

  const config = loadConfig(cwd);
  const events: UsageEvent[] = [];

  const usageFiles = Array.isArray(values.usage) ? values.usage : [];
  for (const f of usageFiles) {
    if (typeof f !== "string") continue;
    try {
      events.push(...loadUsageFile(resolve(f)));
    } catch {
      console.error(red(`Cannot read usage file: ${f}`));
      process.exit(2);
    }
  }

  if (values["no-user"] !== true) {
    events.push(...collectClaudeCodeUsage());
  }

  const report = buildReport(cwd, events, config);

  if (values.json === true) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, values.verbose === true);
  }

  let exit = 0;
  if (cmd === "check") {
    if (report.verdict === "stop") exit = 1;
    if (values.strict === true && report.verdict === "warn") exit = 1;
  }
  process.exit(exit);
}

main();
