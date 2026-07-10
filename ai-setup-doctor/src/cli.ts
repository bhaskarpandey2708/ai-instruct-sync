#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { runChecks, worstSeverity } from "./core.js";
import type { Category, CheckResult, DoctorReport, Severity } from "./types.js";
import { ALL_CATEGORIES } from "./types.js";

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

function parseCategoryList(raw: unknown): Category[] | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const parts = raw.split(/[,+\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const out: Category[] = [];
  for (const p of parts) {
    if (!(ALL_CATEGORIES as string[]).includes(p)) {
      console.error(red(`Unknown category: ${p}`));
      console.error(dim(`Valid: ${ALL_CATEGORIES.join(", ")}`));
      process.exit(2);
    }
    out.push(p as Category);
  }
  return out;
}

function printReport(report: DoctorReport, verbose: boolean, quiet: boolean): void {
  console.log(bold("ai-setup-doctor") + dim(` — ${report.cwd}`));
  console.log(dim(`Node ${report.node} · ${report.platform} · ${report.checkedAt}`));
  console.log();

  for (const c of report.checks) {
    if (quiet && c.severity === "ok") continue;
    printCheck(c, verbose);
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

  if (verbose && summary.byCategory) {
    const parts = ALL_CATEGORIES.filter((cat) => {
      const b = summary.byCategory[cat];
      return b && b.ok + b.info + b.warn + b.error > 0;
    }).map((cat) => {
      const b = summary.byCategory[cat];
      return `${cat}:${b.error ? red(String(b.error) + "e") : "0e"}/${b.warn ? yellow(String(b.warn) + "w") : "0w"}`;
    });
    if (parts.length) console.log(dim("  by category  ") + parts.join("  "));
  }

  const worst = worstSeverity(report);
  if (worst === "error") {
    console.log(red("Action needed: fix errors above (secrets / Node / broken MCP JSON)."));
  } else if (worst === "warn") {
    console.log(yellow("Looking decent — address warnings when you can."));
  } else {
    console.log(green("Setup looks healthy."));
  }
}

function printCheck(c: CheckResult, verbose: boolean): void {
  const cat = verbose ? dim(` [${c.category}]`) : "";
  console.log(`  ${icon(c.severity)} ${bold(c.title)}${cat}  ${c.message}`);
  if (c.detail && (verbose || c.severity === "error" || c.severity === "warn")) {
    for (const line of c.detail.split("\n")) {
      console.log(dim(`      ${line}`));
    }
  }
  if (c.fix && (verbose || c.severity === "error" || c.severity === "warn" || c.severity === "info")) {
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
  --cwd <dir>       Project directory (default: .)
  --json            Machine-readable output
  --strict          Exit 1 on warnings as well as errors
  --min-score <n>   Exit 1 if score is below n (0-100)
  --only <list>     Only these categories (comma-separated)
  --skip <list>     Skip categories
  --no-user         Ignore user-home MCP configs (project only)
  --quiet, -q       Hide ok checks (show issues only)
  --verbose, -v     Always show detail lines + categories + breakdown

Categories
  ${ALL_CATEGORIES.join(", ")}

Examples
  npx ai-setup-doctor
  npx ai-setup-doctor check --cwd ./my-app
  npx ai-setup-doctor --json --strict
  npx ai-setup-doctor --only secrets,mcp --verbose
  npx ai-setup-doctor --quiet --min-score 80
  npx ai-setup-doctor --skip runtime --no-user
`);
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cwd: { type: "string" },
      json: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      only: { type: "string" },
      skip: { type: "string" },
      verbose: { type: "boolean", default: false, short: "v" },
      quiet: { type: "boolean", default: false, short: "q" },
      "min-score": { type: "string" },
      "no-user": { type: "boolean", default: false },
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
  const report = runChecks({
    cwd,
    includeUserConfigs: values["no-user"] !== true,
    only: parseCategoryList(values.only),
    skip: parseCategoryList(values.skip),
  });

  if (values.json === true) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, values.verbose === true, values.quiet === true);
  }

  let exit = 0;
  if (report.summary.error > 0) exit = 1;
  if (values.strict === true && report.summary.warn > 0) exit = 1;
  if (typeof values["min-score"] === "string") {
    const min = Number(values["min-score"]);
    if (!Number.isFinite(min) || min < 0 || min > 100) {
      console.error(red("--min-score must be a number between 0 and 100"));
      process.exit(2);
    }
    if (report.summary.score < min) exit = 1;
  }
  process.exit(exit);
}

main();
