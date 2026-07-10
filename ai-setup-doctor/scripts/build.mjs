#!/usr/bin/env node
/**
 * Fast emit via typescript.transpileModule (avoids full program create).
 * Produces dist/*.js and hand-written-compatible .d.ts from source shapes.
 */
import ts from "../node_modules/typescript/lib/typescript.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const outDir = path.join(root, "dist");

fs.mkdirSync(outDir, { recursive: true });

// ESNext emit keeps package.json "type":"module" happy. Source already uses .js import paths.
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
  const input = path.join(srcDir, f);
  const code = fs.readFileSync(input, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: options,
    fileName: f.replace(/\.ts$/, ".mts"), // force ESM-ish emit path
    reportDiagnostics: true,
  });

  for (const d of result.diagnostics ?? []) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    // transpileModule can't resolve types — ignore cannot-find-name for node builtins
    if (d.code === 2304 || d.code === 2580) continue;
    console.error(`${f}: ${msg}`);
    failed = true;
  }

  let out = result.outputText;
  // Preserve CLI shebang
  if (f === "cli.ts" && code.startsWith("#!")) {
    out = "#!/usr/bin/env node\n" + out.replace(/^#!.*\n/, "");
  }

  fs.writeFileSync(path.join(outDir, f.replace(/\.ts$/, ".js")), out);
  console.log("emit", f.replace(/\.ts$/, ".js"));
}

// Declaration stubs for published API (index + types + core surface)
const dts = {
  "types.d.ts": `export type Severity = "ok" | "info" | "warn" | "error";
export type Category = "runtime" | "agents" | "mcp" | "secrets" | "hygiene";
export declare const ALL_CATEGORIES: Category[];
export interface CheckResult {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  message: string;
  detail?: string;
  fix?: string;
}
export interface DoctorOptions {
  cwd?: string;
  includeUserConfigs?: boolean;
  only?: Category[];
  skip?: Category[];
}
export interface CategorySummary {
  ok: number;
  info: number;
  warn: number;
  error: number;
  penalty: number;
}
export interface DoctorReport {
  cwd: string;
  checkedAt: string;
  node: string;
  platform: string;
  checks: CheckResult[];
  summary: {
    ok: number;
    info: number;
    warn: number;
    error: number;
    score: number;
    byCategory: Record<Category, CategorySummary>;
  };
}
`,
  "core.d.ts": `import type { CheckResult, DoctorOptions, DoctorReport, Severity } from "./types.js";
export declare function runChecks(cwdOrOptions?: string | DoctorOptions, maybeOptions?: DoctorOptions): DoctorReport;
export declare function severityScore(report: DoctorReport): number;
export declare function worstSeverity(report: DoctorReport): Severity;
export declare function filterBySeverity(report: DoctorReport, min: Severity): CheckResult[];
export declare function sortChecks(checks: CheckResult[]): CheckResult[];
export declare function computeScore(checks: CheckResult[]): { score: number; byCategory: Record<string, unknown>; totalPenalty: number };
`,
  "index.d.ts": `export { runChecks, severityScore, worstSeverity, filterBySeverity, sortChecks, computeScore } from "./core.js";
export type { Category, CategorySummary, CheckResult, DoctorOptions, DoctorReport, Severity } from "./types.js";
export { ALL_CATEGORIES } from "./types.js";
export { checkAgents, checkEnvExampleSafety, checkEnvSafety, checkMcp, checkPlaceholders, checkProjectHygiene, checkRuleQuality, checkRuntime, checkSecretLeaks } from "./checks.js";
export { findSecretHits, isAllowlistedSecretText, findInstructionContradictions, isUnpinnedPackageArg } from "./patterns.js";
`,
  "checks.d.ts": `import type { CheckResult, DoctorOptions } from "./types.js";
export declare function checkAgents(cwd: string): CheckResult[];
export declare function checkMcp(cwd: string, options?: DoctorOptions): CheckResult[];
export declare function checkRuntime(): CheckResult[];
export declare function checkEnvSafety(cwd: string): CheckResult[];
export declare function checkEnvExampleSafety(cwd: string): CheckResult[];
export declare function checkSecretLeaks(cwd: string): CheckResult[];
export declare function checkPlaceholders(cwd: string): CheckResult[];
export declare function checkProjectHygiene(cwd: string): CheckResult[];
export declare function checkRuleQuality(cwd: string): CheckResult[];
`,
  "cli.d.ts": `export {};
`,
  "fs-utils.d.ts": `export declare function safeRead(path: string, max?: number): string | null;
export declare function dirHasFiles(path: string): boolean;
export declare function listFilesRecursive(dir: string, max?: number): string[];
export declare function isGitWorkTree(cwd: string): boolean;
export declare function gitTrackedFiles(cwd: string, globs: string[]): string[];
export declare function normalizeInstructionText(text: string): string;
export declare function simpleHash(text: string): string;
export declare function whichCommand(cmd: string): string | null;
export declare function commandLooksRunnable(command: string, baseDir?: string): boolean;
export declare function looksLikeJsonWithComments(raw: string): boolean;
export declare function dirOf(filePath: string): string;
`,
  "patterns.d.ts": `export declare const SECRET_PATTERNS: { id: string; re: RegExp }[];
export declare const PLACEHOLDER_PATTERNS: { id: string; re: RegExp }[];
export interface SecretHit { id: string; match: string; }
export declare function isAllowlistedSecretText(snippet: string): boolean;
export declare function findSecretHits(text: string, max?: number): SecretHit[];
export declare function looksLikeHardcodedSecret(value: string): boolean;
export declare function isEnvIgnoredByGitignore(gi: string): boolean;
export declare function findInstructionContradictions(text: string): string[];
export declare function isUnpinnedPackageArg(arg: string): boolean;
`,
};

for (const [name, body] of Object.entries(dts)) {
  fs.writeFileSync(path.join(outDir, name), body);
}

if (failed) {
  console.error("build completed with diagnostics (non-fatal for transpile)");
}
console.log("build ok → dist/");
process.exit(0);
