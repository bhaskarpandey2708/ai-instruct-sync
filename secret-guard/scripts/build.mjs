#!/usr/bin/env node
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

for (const f of files) {
  const input = path.join(srcDir, f);
  const code = fs.readFileSync(input, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: options,
    fileName: f.replace(/\.ts$/, ".mts"),
    reportDiagnostics: true,
  });

  let out = result.outputText;
  if (f === "cli.ts" && code.startsWith("#!")) {
    out = "#!/usr/bin/env node\n" + out.replace(/^#!.*\n/, "");
  }

  fs.writeFileSync(path.join(outDir, f.replace(/\.ts$/, ".js")), out);
  console.log("emit", f.replace(/\.ts$/, ".js"));
}

const dts = {
  "types.d.ts": `export type Severity = "ok" | "info" | "warn" | "error";
export type FindingKind = "agent-file" | "mcp-env" | "mcp-arg" | "env-example" | "tracked-secret-file";
export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  file: string;
  line?: number;
  column?: number;
  pattern: string;
  message: string;
  snippet: string;
  fix?: string;
}
export interface ScanOptions {
  cwd?: string;
  includeUser?: boolean;
  maxFiles?: number;
  maxBytes?: number;
}
export interface ScanReport {
  cwd: string;
  scannedAt: string;
  filesScanned: number;
  findings: Finding[];
  summary: { error: number; warn: number; info: number; ok: boolean };
}
`,
  "index.d.ts": `export { scan, worstSeverity } from "./scan.js";
export { toSarif } from "./sarif.js";
export { findSecretHits, isAllowlistedSecretText, looksLikeHardcodedSecret, redact } from "./patterns.js";
export type { Finding, FindingKind, ScanOptions, ScanReport, Severity } from "./types.js";
`,
  "scan.d.ts": `import type { ScanOptions, ScanReport } from "./types.js";
export declare function scan(cwdOrOptions?: string | ScanOptions, maybe?: ScanOptions): ScanReport;
export declare function worstSeverity(report: ScanReport): "ok" | "info" | "warn" | "error";
`,
  "patterns.d.ts": `export declare const SECRET_PATTERNS: { id: string; re: RegExp }[];
export declare const PLACEHOLDER_PATTERNS: { id: string; re: RegExp }[];
export interface SecretHit { id: string; match: string; index: number; }
export declare function isAllowlistedSecretText(snippet: string): boolean;
export declare function findSecretHits(text: string, max?: number): SecretHit[];
export declare function looksLikeHardcodedSecret(value: string): boolean;
export declare function redact(match: string): string;
export declare function lineColAt(text: string, index: number): { line: number; column: number };
`,
  "sarif.d.ts": `import type { ScanReport } from "./types.js";
export declare function toSarif(report: ScanReport): object;
`,
  "cli.d.ts": `export {};
`,
  "fs.d.ts": `export declare function safeRead(path: string, max?: number): string | null;
export declare function listFilesRecursive(dir: string, max?: number): string[];
export declare function isGitWorkTree(cwd: string): boolean;
export declare function gitTrackedFiles(cwd: string, globs: string[]): string[];
export declare function stripJsonComments(raw: string): string;
export declare function tryParseJson(raw: string): unknown | null;
`,
  "paths.d.ts": `export declare function collectAgentFiles(cwd: string, maxFiles: number): string[];
export declare function collectMcpConfigPaths(cwd: string, includeUser: boolean): string[];
`,
};

for (const [name, body] of Object.entries(dts)) {
  fs.writeFileSync(path.join(outDir, name), body);
}

console.log("build ok → dist/");
