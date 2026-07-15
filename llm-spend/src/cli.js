#!/usr/bin/env node
/**
 * llm-spend — multi-provider LLM cost, tokens, and budget report (free OSS CLI)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { main, parseUsageText } from "./core.js";

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);

function printHelp() {
  console.log(`${bold("llm-spend")} — multi-provider LLM cost & budget observability

Roll up OpenAI · Anthropic · Google · Azure · open models from a usage export.
Local, read-only, zero dependencies. Free CLI (MIT).

${bold("Usage")}
  llm-spend [file]                 report from JSON / JSONL usage file
  llm-spend --budget 50 [file]     set period budget USD
  llm-spend --strict [file]        exit 1 if over budget
  llm-spend --json [file]          machine-readable report
  llm-spend --help

${bold("Input formats")}
  • JSON:  { "events": [ ... ], "budgetUsd": 100 }
  • JSON:  [ { "provider","model","inputTokens","outputTokens", ... }, ... ]
  • JSONL: one event object per line
  • If no file: ./usage.json, ./usage.jsonl, or built-in fixtures/sample.json

${bold("Event fields")} (flexible)
  provider, model, inputTokens, outputTokens, tokens, costUsd,
  project, ts, pricePer1k (legacy)

${bold("Exit codes")}
  0  within budget (or no --strict)
  1  over budget when --strict / --check
  2  bad usage / missing file

Examples
  llm-spend fixtures/sample.json
  llm-spend --budget 25 --strict usage.jsonl
  cat export.jsonl | llm-spend --json -
`);
}

function parseArgs(argv) {
  const flags = {
    json: false,
    strict: false,
    help: false,
    budget: null,
    file: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") flags.help = true;
    else if (a === "--json") flags.json = true;
    else if (a === "--strict" || a === "--check") flags.strict = true;
    else if (a === "--budget" || a === "-b") flags.budget = Number(argv[++i]);
    else if (a.startsWith("--budget=")) flags.budget = Number(a.slice(9));
    else if (a === "-") flags.file = "-";
    else if (!a.startsWith("-") && !flags.file) flags.file = a;
  }
  return flags;
}

function loadInput(file) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  if (file === "-") {
    return { text: readFileSync(0, "utf8"), label: "stdin" };
  }
  const candidates = [];
  if (file) candidates.push(resolve(file));
  candidates.push(resolve("usage.json"), resolve("usage.jsonl"));
  candidates.push(join(root, "fixtures", "sample.json"));

  for (const p of candidates) {
    if (existsSync(p)) return { text: readFileSync(p, "utf8"), label: p };
  }
  return null;
}

/** @param {unknown} text */
function extractEvents(text) {
  const trimmed = String(text).trim();
  if (!trimmed) return { events: [], budgetUsd: undefined };

  // Prefer full-file JSON when it parses cleanly
  try {
    const data = JSON.parse(trimmed);
    if (Array.isArray(data)) return { events: data, budgetUsd: undefined };
    if (data && typeof data === "object") {
      const events = Array.isArray(data.events)
        ? data.events
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.usage)
            ? data.usage
            : data.model || data.provider || data.tokens || data.inputTokens
              ? [data]
              : [];
      const budgetUsd = data.budgetUsd != null ? Number(data.budgetUsd) : undefined;
      return { events, budgetUsd };
    }
  } catch {
    /* fall through to JSONL */
  }
  return { events: parseUsageText(trimmed), budgetUsd: undefined };
}

function fmtUsd(n) {
  const x = Number(n) || 0;
  if (x >= 1) return `$${x.toFixed(2)}`;
  if (x >= 0.01) return `$${x.toFixed(3)}`;
  return `$${x.toFixed(4)}`;
}

function printHuman(report, label) {
  const u = report.usage;
  const b = report.budget;
  console.log(bold("llm-spend") + dim(` — ${label}`));
  console.log(
    dim(
      `${u.eventCount} events · ${u.totalTokens.toLocaleString("en-US")} tokens · ${fmtUsd(u.totalCostUsd)} estimated`,
    ),
  );
  console.log();

  console.log(bold("By provider"));
  const providers = Object.entries(u.byProvider);
  if (!providers.length) console.log(dim("  (no events)"));
  for (const [name, row] of providers) {
    console.log(
      `  ${cyan(name.padEnd(12))} ${fmtUsd(row.costUsd).padStart(10)}  ${dim(`${row.tokens.toLocaleString("en-US")} tok · ${row.calls} calls`)}`,
    );
  }
  console.log();

  console.log(bold("By model"));
  const models = Object.entries(u.byModel).slice(0, 12);
  for (const [name, row] of models) {
    console.log(
      `  ${name.padEnd(22)} ${fmtUsd(row.costUsd).padStart(10)}  ${dim(`${row.tokens.toLocaleString("en-US")} tok · ${row.calls} calls`)}`,
    );
  }
  if (Object.keys(u.byModel).length > 12) {
    console.log(dim(`  … +${Object.keys(u.byModel).length - 12} more models`));
  }
  console.log();

  const projects = Object.entries(u.byProject);
  if (projects.length > 1 || (projects[0] && projects[0][0] !== "default")) {
    console.log(bold("By project"));
    for (const [name, row] of projects.slice(0, 10)) {
      console.log(
        `  ${name.padEnd(16)} ${fmtUsd(row.costUsd).padStart(10)}  ${dim(`${row.calls} calls`)}`,
      );
    }
    console.log();
  }

  const days = Object.entries(u.byDay).filter(([d]) => d !== "unknown");
  if (days.length) {
    console.log(bold("By day"));
    for (const [name, row] of days.slice(0, 14)) {
      console.log(`  ${name}  ${fmtUsd(row.costUsd).padStart(10)}  ${dim(`${row.calls} calls`)}`);
    }
    console.log();
  }

  const bar = report.verdict === "over" ? red : report.verdict === "warn" ? yellow : green;
  const tag =
    report.verdict === "over"
      ? red(bold("OVER"))
      : report.verdict === "warn"
        ? yellow("WARN")
        : green("OK");

  console.log(bold("Budget"));
  console.log(
    `  ${tag}  ${bar(fmtUsd(b.totalCostUsd))} / ${fmtUsd(b.budgetUsd)}  ${dim(`(${b.usedPct}% · ${fmtUsd(b.remainingUsd)} left)`)}`,
  );
  if (report.verdict === "over") {
    console.log(red(bold("  Over budget — wire --strict into CI or a pre-deploy gate.")));
  } else if (report.verdict === "warn") {
    console.log(yellow("  ≥80% of budget used — consider smaller models or a freeze."));
  } else {
    console.log(green("  Within budget."));
  }
}

function mainCli() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  const loaded = loadInput(flags.file);
  if (!loaded) {
    console.error("llm-spend: no usage file found. Pass a JSON/JSONL path or create usage.json");
    process.exit(2);
  }

  let events;
  let budgetFromFile;
  try {
    const extracted = extractEvents(loaded.text);
    events = extracted.events;
    budgetFromFile = extracted.budgetUsd;
  } catch (e) {
    console.error(`llm-spend: failed to parse ${loaded.label}: ${e.message}`);
    process.exit(2);
  }

  const budgetUsd =
    flags.budget != null && Number.isFinite(flags.budget)
      ? flags.budget
      : budgetFromFile != null && Number.isFinite(budgetFromFile)
        ? budgetFromFile
        : 100;

  const report = main({ events, budgetUsd }, { budgetUsd });

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          product: "llm-spend",
          id: "P05",
          source: loaded.label,
          ...report,
        },
        null,
        2,
      ),
    );
  } else {
    printHuman(report, loaded.label);
  }

  if (flags.strict && report.verdict === "over") process.exit(1);
  process.exit(0);
}

mainCli();
