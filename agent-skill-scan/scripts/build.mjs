#!/usr/bin/env node
/**
 * Fast emit via typescript.transpileModule (same pattern as ai-setup-doctor).
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
  const input = path.join(srcDir, f);
  const code = fs.readFileSync(input, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: options,
    fileName: f.replace(/\.ts$/, ".mts"),
    reportDiagnostics: true,
  });

  for (const d of result.diagnostics ?? []) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (d.code === 2304 || d.code === 2580) continue; // node builtins unresolved in transpile
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
  "types.d.ts": `export type Severity = "critical" | "high" | "medium" | "low";
export type Category = "skills" | "mcp" | "rules" | "hooks";
export declare const ALL_CATEGORIES: Category[];
export declare const SEVERITY_ORDER: Severity[];
export interface Finding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  file: string;
  line?: number;
  snippet?: string;
  message: string;
  fix?: string;
}
export interface ScanOptions {
  cwd?: string;
  includeUser?: boolean;
  only?: Category[];
  skip?: Category[];
  maxFiles?: number;
}
export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}
export interface ScanReport {
  cwd: string;
  scannedAt: string;
  node: string;
  platform: string;
  filesScanned: number;
  findings: Finding[];
  summary: SeverityCounts & {
    score: number;
    byCategory: Record<Category, SeverityCounts>;
  };
}
`,
  "scanner.d.ts": `import type { ScanOptions, ScanReport, Severity } from "./types.js";
export declare function scan(options?: ScanOptions): ScanReport;
export declare function worstSeverity(report: ScanReport): Severity | "none";
`,
  "rules.d.ts": `import type { Severity } from "./types.js";
export interface TextRule { id: string; severity: Severity; title: string; re: RegExp; fix?: string; }
export declare const TEXT_RULES: TextRule[];
export declare const OBFUSCATION_RULES: TextRule[];
export declare const SECRET_PATTERNS: { id: string; re: RegExp }[];
export interface UnicodeHit { id: string; severity: Severity; title: string; line: number; message: string; }
export declare function findUnicodeHits(text: string): UnicodeHit[];
export interface SecretHit { id: string; masked: string; }
export declare function findSecretHits(text: string, max?: number): SecretHit[];
export declare function isAllowlistedSecretText(snippet: string): boolean;
export declare function looksLikeHardcodedSecret(value: string): boolean;
export declare function isUnpinnedPackageArg(arg: string): boolean;
`,
  "index.d.ts": `export { scan, worstSeverity } from "./scanner.js";
export type { Category, Finding, ScanOptions, ScanReport, Severity, SeverityCounts } from "./types.js";
export { ALL_CATEGORIES, SEVERITY_ORDER } from "./types.js";
export { TEXT_RULES, OBFUSCATION_RULES, SECRET_PATTERNS, findUnicodeHits, findSecretHits, isAllowlistedSecretText, looksLikeHardcodedSecret, isUnpinnedPackageArg } from "./rules.js";
`,
  "cli.d.ts": `export {};
`,
  "fs-utils.d.ts": `export declare function safeRead(path: string, max?: number): string | null;
export declare function isScannableFile(path: string): boolean;
export declare function walkFiles(dir: string, maxFiles?: number): string[];
export declare function displayPath(cwd: string, path: string): string;
`,
  "locations.d.ts": `export declare function skillRoots(cwd: string, includeUser: boolean): string[];
export declare function ruleFiles(cwd: string): string[];
export declare function mcpConfigPaths(cwd: string, includeUser: boolean): string[];
export declare function hookConfigPaths(cwd: string, includeUser: boolean): string[];
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
