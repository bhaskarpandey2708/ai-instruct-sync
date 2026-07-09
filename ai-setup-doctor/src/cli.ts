#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { runChecks, worstSeverity } from "./core.js";
import type { CheckResult, DoctorReport, Severity } from "./types.js";

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);

function icon(sev: Severity): string {
  if (sev === "ok") return green("✓");
  if (sev === "info") return cyan("ℹ");
  if (sev === "warn") return yellow("⚠");
  return red("✗");
}

function printReport(report: DoctorReport): void {
  console.log(bold("ai-setup-doctor") + dim(` — ${report.cwd}`));
  console.log(dim(`Node ${report.node} · ${report.platform} · ${report.checkedAt}`));
  console.log();

  for (const c of report.checks) {
    printCheck(c);
  }

  const { summary } = report;
  const scoreColor =
    summary.score >= 85 ? green : summary.score >= 60 ? yellow : red;
  console.log();
  console.log(
    bold("Score ") +
      scoreColor(String(summary.score)) +
      dim("/100") +
      `  ${green(`${summary.ok} ok`)} · ${cyan(`${summary.info} info`)} · ${yellow(`${summary.warn} warn`)} · ${red(`${summary.error} error`)}`,
  );

  const worst = worstSeverity(report);
  if (worst === "error") {
    console.log(red("Action needed: fix errors above (secrets / Node / broken MCP JSON)."));
  } else if (worst === "warn") {
    console.log(yellow("Looking decent — address warnings when you can."));
  } else {
    console.log(green("Setup looks healthy."));
  }
}

function printCheck(c: CheckResult): void {
  console.log(`  ${icon(c.severity)} ${bold(c.title)}  ${c.message}`);
  if (c.detail) {
    for (const line of c.detail.split("\n")) {
      console.log(dim(`      ${line}`));
    }
  }
  if (c.fix) {
    console.log(cyan(`      → ${c.fix}`));
  }
}

function printHelp(): void {
  console.log(`${bold("ai-setup-doctor")} — diagnose AI coding setup issues

Usage
  ai-setup-doctor [check] [options]

Commands
  check          Run diagnostics (default)
  help           Show this help

Options
  --cwd <dir>    Project directory (default: .)
  --json         Machine-readable output
  --strict       Exit 1 on warnings as well as errors

Examples
  npx ai-setup-doctor
  npx ai-setup-doctor check --cwd ./my-app
  npx ai-setup-doctor --json
`);
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cwd: { type: "string" },
      json: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0] ?? "check";
  if (values.help || cmd === "help" || cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }

  if (cmd !== "check") {
    console.error(red(`Unknown command: ${cmd}`));
    printHelp();
    process.exit(1);
  }

  const cwdArg = typeof values.cwd === "string" ? values.cwd : process.cwd();
  const cwd = resolve(cwdArg);
  const report = runChecks(cwd);

  if (values.json === true) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (report.summary.error > 0) process.exit(1);
  if (values.strict === true && report.summary.warn > 0) process.exit(1);
  process.exit(0);
}

main();
