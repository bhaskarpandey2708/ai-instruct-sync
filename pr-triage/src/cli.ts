#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import type { ScoredHunk, TriageReport } from "./types.js";
import { parseUnifiedDiff } from "./parse-diff.js";
import { triage } from "./risk.js";

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);

function band(score: number): string {
  if (score >= 40) return red(bold("REVIEW FIRST"));
  if (score >= 20) return yellow("REVIEW");
  if (score >= 8) return cyan("SKIM");
  return green("LOW");
}

function printHunk(h: ScoredHunk): void {
  console.log(`  ${band(h.score)} ${bold(String(Math.round(h.score)).padStart(3))}  ${h.file}:${h.newStart}`);
  if (h.preview) console.log(dim(`        ${h.preview}`));
  const labels = h.signals.filter((s) => s.weight > 0).map((s) => s.label).join(" · ");
  if (labels) console.log(dim(`        ${labels}`));
}

function printReport(r: TriageReport): void {
  console.log(bold("pr-triage") + dim(` — ${r.files} files · ${r.hunks} hunks · +${r.totalAdded}/-${r.totalRemoved}`));
  console.log(dim(`Node ${r.node} · ${r.platform} · ${r.checkedAt}`));
  console.log();
  if (r.ranked.length === 0) {
    console.log(green("  Nothing to review — empty or unparseable diff."));
  } else {
    for (const h of r.ranked) printHunk(h);
  }
  if (r.untestedFiles.length > 0) {
    console.log();
    console.log(yellow(`  ${r.untestedFiles.length} changed file(s) with no matching test change:`));
    for (const f of r.untestedFiles.slice(0, 10)) console.log(dim(`    ${f}`));
  }
  console.log();
  const first = r.ranked[0];
  if (first && first.score >= 40) {
    console.log(red("Start with the REVIEW FIRST hunks — highest blast radius."));
  } else if (first && first.score >= 20) {
    console.log(yellow("Moderate-risk change — focus on the REVIEW hunks."));
  } else {
    console.log(green("Low-risk diff — a quick skim should do."));
  }
}

function printHelp(): void {
  console.log(`${bold("pr-triage")} — risk-rank a diff so humans review the 20% that matters

Reads a unified diff (git diff / PR patch), scores every hunk on blast radius,
removed error handling, missing test changes, placeholder/AI artifacts, and
credential-shaped strings — then ranks them. Read-only, offline, zero deps.

Usage
  pr-triage [diff-file] [options]     rank a saved diff/patch file
  git diff main | pr-triage           rank from stdin
  pr-triage --ref main                run git diff <ref> itself

Options
  --ref <ref>       Diff working tree against a git ref (uses local git)
  --cwd <dir>       Repo directory for --ref (default: .)
  --top <n>         Show top N hunks (default 20)
  --json            Machine-readable report
  --min-score <n>   Exit 1 if the top hunk scores >= n (CI attention gate)

Exit codes
  0 ranked OK · 1 --min-score tripped · 2 usage error
`);
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      ref: { type: "string" },
      cwd: { type: "string" },
      top: { type: "string" },
      json: { type: "boolean", default: false },
      "min-score": { type: "string" },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.help || positionals[0] === "help") {
    printHelp();
    process.exit(0);
  }

  let top = 20;
  if (typeof values.top === "string") {
    top = Number(values.top);
    if (!Number.isFinite(top) || top < 1) {
      console.error(red("--top must be a positive number"));
      process.exit(2);
    }
  }

  let diffText = "";
  if (typeof values.ref === "string" && values.ref) {
    const cwd = resolve(typeof values.cwd === "string" ? values.cwd : process.cwd());
    try {
      diffText = execFileSync("git", ["diff", values.ref], {
        cwd,
        encoding: "utf8",
        maxBuffer: 50_000_000,
        timeout: 30_000,
      });
    } catch {
      console.error(red(`git diff ${values.ref} failed in ${cwd}`));
      process.exit(2);
    }
  } else if (positionals[0] && positionals[0] !== "-") {
    try {
      diffText = readFileSync(resolve(positionals[0]), "utf8");
    } catch {
      console.error(red(`Cannot read diff file: ${positionals[0]}`));
      process.exit(2);
    }
  } else {
    try {
      diffText = readFileSync(0, "utf8"); // stdin
    } catch {
      diffText = "";
    }
    if (!diffText.trim()) {
      printHelp();
      process.exit(2);
    }
  }

  const files = parseUnifiedDiff(diffText);
  const report = triage(files, { top });

  if (values.json === true) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (typeof values["min-score"] === "string") {
    const min = Number(values["min-score"]);
    if (!Number.isFinite(min)) {
      console.error(red("--min-score must be a number"));
      process.exit(2);
    }
    const worst = report.ranked[0]?.score ?? 0;
    if (worst >= min) process.exit(1);
  }
  process.exit(0);
}

main();
