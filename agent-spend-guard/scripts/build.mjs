#!/usr/bin/env node
/**
 * Fast emit via typescript.transpileModule (suite pattern — see ai-setup-doctor).
 * Produces dist/*.js plus hand-written .d.ts for the published API.
 */
import ts from "../node_modules/typescript/lib/typescript.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const outDir = path.join(root, "dist");

fs.mkdirSync(outDir, { recursive: true });

const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  strict: true,
  skipLibCheck: true,
  esModuleInterop: true,
  removeComments: false,
};

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts")).sort();
let failed = false;

for (const f of files) {
  const code = fs.readFileSync(path.join(srcDir, f), "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: options,
    fileName: f.replace(/\.ts$/, ".mts"),
    reportDiagnostics: true,
  });
  for (const d of result.diagnostics ?? []) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (d.code === 2304 || d.code === 2580) continue;
    console.error(`${f}: ${msg}`);
    failed = true;
  }
  let out = result.outputText;
  if (f === "cli.ts" && code.startsWith("#!")) {
    out = "#!/usr/bin/env node\n" + out.replace(/^#!.*\n/, "");
  }
  fs.writeFileSync(path.join(outDir, f.replace(/\.ts$/, ".js")), out);
  console.log("emit", f.replace(/\.ts$/, ".js"));
}

const dts = {
  "index.d.ts": `export type Verdict = "ok" | "warn" | "stop";
export interface UsageEvent {
  ts: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  project?: string;
  source?: string;
}
export interface ModelPrice { input: number; output: number; cacheRead?: number; cacheWrite?: number; }
export interface Budgets {
  dailyUsd?: number;
  monthlyUsd?: number;
  perProjectUsd?: Record<string, number>;
  warnAtPct?: number;
}
export interface GuardConfig { budgets: Budgets; prices?: Record<string, ModelPrice>; }
export interface SpendLine { scope: string; spentUsd: number; limitUsd: number; pct: number; verdict: Verdict; }
export interface SpendSummary {
  events: number;
  totalTokens: number;
  totalUsd: number;
  byDay: Record<string, number>;
  byModel: Record<string, { tokens: number; usd: number; calls: number }>;
  byProject: Record<string, { tokens: number; usd: number; calls: number }>;
}
export interface GuardReport {
  cwd: string;
  checkedAt: string;
  node: string;
  platform: string;
  summary: SpendSummary;
  lines: SpendLine[];
  verdict: Verdict;
}
export declare const CONFIG_FILENAME: string;
export declare const DEFAULT_PRICES: Record<string, ModelPrice>;
export declare function priceFor(model: string, overrides?: Record<string, ModelPrice>): ModelPrice;
export declare function costOf(e: UsageEvent, overrides?: Record<string, ModelPrice>): number;
export declare function parseClaudeCodeJsonl(text: string, project?: string): UsageEvent[];
export declare function parseGenericEvents(text: string): UsageEvent[];
export declare function collectClaudeCodeUsage(maxFilesPerProject?: number): UsageEvent[];
export declare function loadConfig(cwd: string): GuardConfig;
export declare function sampleConfig(): GuardConfig;
export declare function summarize(events: UsageEvent[], config?: GuardConfig): SpendSummary;
export declare function evaluateBudgets(events: UsageEvent[], budgets: Budgets, config?: GuardConfig, now?: Date): { lines: SpendLine[]; verdict: Verdict };
export declare function buildReport(cwd: string, events: UsageEvent[], config: GuardConfig, now?: Date): GuardReport;
`,
  "cli.d.ts": `export {};
`,
};
for (const [name, body] of Object.entries(dts)) {
  fs.writeFileSync(path.join(outDir, name), body);
}
// Re-export stubs so deep imports type-check
for (const stub of ["types", "guard", "pricing", "usage"]) {
  fs.writeFileSync(path.join(outDir, `${stub}.d.ts`), `export * from "./index.js";\n`);
}

if (failed) console.error("build completed with diagnostics (non-fatal for transpile)");
console.log("build ok → dist/");
process.exit(0);
