#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { scan, worstSeverity } from "./scan.js";
import { toSarif } from "./sarif.js";
import type { Finding, ScanReport, Severity } from "./types.js";

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

function printHelp(): void {
  console.log(`${bold("secret-guard")} — stop secrets leaking into AI configs

Usage
  secret-guard [scan] [options]

Commands
  scan           Scan project (default)
  help           Show this help

Options
  --cwd <dir>    Project directory (default: .)
  --json         Machine-readable JSON report
  --sarif        SARIF 2.1 output (for GitHub Code Scanning / CI)
  --strict       Exit 1 on warnings as well as errors
  --user         Also scan user-home MCP configs (~/.cursor, Claude Desktop, …)
  --quiet, -q    Only print findings (no summary chrome)
  --verbose, -v  Extra detail

Exit codes
  0  clean (no errors; warnings only if not --strict)
  1  findings that fail the run
  2  usage / argument error

Examples
  npx ai-secret-guard
  npx ai-secret-guard scan --cwd ./my-app
  npx ai-secret-guard --json --strict
  npx ai-secret-guard --sarif > secret-guard.sarif
  npx ai-secret-guard --user   # include ~/.cursor/mcp.json etc.

Why this exists
  Classic secret scanners miss AI-specific paths: CLAUDE.md, .cursor/rules,
  MCP env blocks, AGENTS.md. secret-guard is built for that surface.
`);
}

function printReport(report: ScanReport, verbose: boolean, quiet: boolean): void {
  if (!quiet) {
    console.log(bold("secret-guard") + dim(` — ${report.cwd}`));
    console.log(dim(`${report.filesScanned} file(s) scanned · ${report.scannedAt}`));
    console.log();
  }

  if (report.findings.length === 0) {
    console.log(`  ${icon("ok")} ${green("No secrets found in AI agent / MCP paths")}`);
  } else {
    for (const f of report.findings) {
      printFinding(f, verbose);
    }
  }

  if (!quiet) {
    const { summary } = report;
    console.log();
    console.log(
      bold("Summary  ") +
        `${red(`${summary.error} error`)} · ${yellow(`${summary.warn} warn`)} · ${cyan(`${summary.info} info`)}` +
        (summary.ok ? `  ${green("clean")}` : ""),
    );
    const worst = worstSeverity(report);
    if (worst === "error") {
      console.log(red("Action needed: remove or rotate secrets above, then re-run."));
    } else if (worst === "warn") {
      console.log(yellow("Warnings only — clean before merging if you use --strict."));
    } else {
      console.log(green("Looking good."));
    }
  }
}

function printFinding(f: Finding, verbose: boolean): void {
  const loc = f.line ? `${f.file}:${f.line}` : f.file;
  console.log(`  ${icon(f.severity)} ${bold(loc)}  ${f.message}`);
  console.log(dim(`      pattern ${f.pattern} · ${f.snippet}`));
  if (f.fix && (verbose || f.severity === "error" || f.severity === "warn")) {
    console.log(cyan(`      → ${f.fix}`));
  }
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cwd: { type: "string" },
      json: { type: "boolean", default: false },
      sarif: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      user: { type: "boolean", default: false },
      verbose: { type: "boolean", default: false, short: "v" },
      quiet: { type: "boolean", default: false, short: "q" },
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

  const cwd = resolve(typeof values.cwd === "string" ? values.cwd : process.cwd());
  const report = scan({
    cwd,
    includeUser: Boolean(values.user),
  });

  if (values.sarif) {
    console.log(JSON.stringify(toSarif(report), null, 2));
  } else if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, Boolean(values.verbose), Boolean(values.quiet));
  }

  const worst = worstSeverity(report);
  if (worst === "error") process.exit(1);
  if (values.strict && worst === "warn") process.exit(1);
  process.exit(0);
}

main();
