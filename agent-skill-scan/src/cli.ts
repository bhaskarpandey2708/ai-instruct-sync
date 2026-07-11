#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { scan, worstSeverity } from "./scanner.js";
import type { Category, Finding, ScanReport, Severity } from "./types.js";
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
  if (sev === "critical") return red(bold("✗"));
  if (sev === "high") return red("✗");
  if (sev === "medium") return yellow("⚠");
  return cyan("ℹ");
}

function sevLabel(sev: Severity): string {
  if (sev === "critical") return red(bold("CRITICAL"));
  if (sev === "high") return red("HIGH");
  if (sev === "medium") return yellow("MEDIUM");
  return cyan("LOW");
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

function printFinding(f: Finding, verbose: boolean): void {
  const loc = f.line ? `${f.file}:${f.line}` : f.file;
  console.log(`  ${icon(f.severity)} ${sevLabel(f.severity)} ${bold(f.title)}  ${dim(`[${f.id}]`)}`);
  console.log(dim(`      ${loc}`));
  if (f.snippet) console.log(dim(`      ${f.snippet}`));
  if (f.message !== f.title || verbose) console.log(`      ${f.message}`);
  if (f.fix) console.log(cyan(`      → ${f.fix}`));
}

function printReport(report: ScanReport, verbose: boolean): void {
  console.log(bold("agent-skill-scan") + dim(` — ${report.cwd}`));
  console.log(dim(`Node ${report.node} · ${report.platform} · ${report.scannedAt} · ${report.filesScanned} files scanned`));
  console.log();

  if (report.findings.length === 0) {
    console.log(green("  ✓ No findings — skills, MCP configs, rules, and hooks look clean."));
  } else {
    for (const f of report.findings) printFinding(f, verbose);
  }

  const s = report.summary;
  const scoreColor = s.score >= 85 ? green : s.score >= 60 ? yellow : red;
  console.log();
  console.log(
    bold("Score ") +
      scoreColor(String(s.score)) +
      dim("/100") +
      `  ${red(`${s.critical} critical`)} · ${red(`${s.high} high`)} · ${yellow(`${s.medium} medium`)} · ${cyan(`${s.low} low`)}`,
  );

  if (verbose) {
    const parts = ALL_CATEGORIES.filter((cat) => {
      const b = s.byCategory[cat];
      return b.critical + b.high + b.medium + b.low > 0;
    }).map((cat) => {
      const b = s.byCategory[cat];
      return `${cat}:${b.critical}c/${b.high}h/${b.medium}m/${b.low}l`;
    });
    if (parts.length) console.log(dim("  by category  ") + parts.join("  "));
  }

  const worst = worstSeverity(report);
  if (worst === "critical" || worst === "high") {
    console.log(red("Action needed: review the findings above before letting agents run this content."));
  } else if (worst === "medium") {
    console.log(yellow("Mostly clean — review the medium findings when you can."));
  } else if (worst === "low") {
    console.log(green("Healthy — a couple of hygiene nits above."));
  } else {
    console.log(green("Agent surface looks safe."));
  }
}

function printHelp(): void {
  console.log(`${bold("agent-skill-scan")} — security scan for agent skills, MCP servers, rules files, and hooks

Detects prompt injection, secret exfiltration, hidden-instruction Unicode,
dangerous shell patterns, hardcoded MCP credentials, and install-time hooks.
Read-only: nothing is modified or sent anywhere.

Usage
  agent-skill-scan [scan] [options]

Commands
  scan           Run the scan (default)
  help           Show this help

Options
  --cwd <dir>       Project directory (default: .)
  --json            Machine-readable output
  --strict          Exit 1 on medium findings as well as critical/high
  --min-score <n>   Exit 1 if score is below n (0-100)
  --only <list>     Only these categories (comma-separated)
  --skip <list>     Skip categories
  --no-user         Ignore user-home locations (project only)
  --max-files <n>   Per-root file cap for skill directories (default 400)
  --verbose, -v     Show category breakdown and extra detail

Categories
  ${ALL_CATEGORIES.join(", ")}

Exit codes
  0  clean (or low/medium only, without --strict)
  1  critical or high findings (with --strict: medium too; also --min-score misses)
  2  usage error

Examples
  npx agent-skill-scan
  npx agent-skill-scan --cwd ./my-app --json
  npx agent-skill-scan --only skills,mcp --verbose
  npx agent-skill-scan --strict --min-score 80
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
      "min-score": { type: "string" },
      "no-user": { type: "boolean", default: false },
      "max-files": { type: "string" },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0] ?? "scan";
  if (values.help || cmd === "help" || cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }

  if (cmd !== "scan") {
    console.error(red(`Unknown command: ${cmd}`));
    printHelp();
    process.exit(2);
  }

  let maxFiles: number | undefined;
  if (typeof values["max-files"] === "string") {
    maxFiles = Number(values["max-files"]);
    if (!Number.isFinite(maxFiles) || maxFiles < 1) {
      console.error(red("--max-files must be a positive number"));
      process.exit(2);
    }
  }

  const cwdArg = typeof values.cwd === "string" ? values.cwd : process.cwd();
  const report = scan({
    cwd: resolve(cwdArg),
    includeUser: values["no-user"] !== true,
    only: parseCategoryList(values.only),
    skip: parseCategoryList(values.skip),
    maxFiles,
  });

  if (values.json === true) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, values.verbose === true);
  }

  let exit = 0;
  if (report.summary.critical > 0 || report.summary.high > 0) exit = 1;
  if (values.strict === true && report.summary.medium > 0) exit = 1;
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
