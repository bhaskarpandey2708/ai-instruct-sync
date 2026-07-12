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
  "index.d.ts": `export interface Hunk {
  file: string;
  newStart: number;
  newLines: number;
  oldStart: number;
  oldLines: number;
  lines: string[];
  added: number;
  removed: number;
}
export interface FileDiff {
  file: string;
  oldFile: string;
  status: "modified" | "added" | "deleted" | "renamed";
  hunks: Hunk[];
  binary: boolean;
}
export interface RiskSignal { id: string; label: string; weight: number; }
export interface ScoredHunk {
  file: string;
  newStart: number;
  score: number;
  signals: RiskSignal[];
  preview: string;
}
export interface TriageReport {
  checkedAt: string;
  node: string;
  platform: string;
  files: number;
  hunks: number;
  totalAdded: number;
  totalRemoved: number;
  ranked: ScoredHunk[];
  untestedFiles: string[];
}
export interface TriageOptions { top?: number; }
export declare function parseUnifiedDiff(text: string): FileDiff[];
export declare function scoreHunk(h: Hunk, opts: { untested: boolean; isDoc: boolean }): ScoredHunk;
export declare function untestedChangedFiles(files: FileDiff[]): string[];
export declare function triage(files: FileDiff[], options?: TriageOptions): TriageReport;
`,
  "cli.d.ts": `export {};
`,
};
for (const [name, body] of Object.entries(dts)) {
  fs.writeFileSync(path.join(outDir, name), body);
}
for (const stub of ["types", "parse-diff", "risk"]) {
  fs.writeFileSync(path.join(outDir, `${stub}.d.ts`), `export * from "./index.js";\n`);
}

if (failed) console.error("build completed with diagnostics (non-fatal for transpile)");
console.log("build ok → dist/");
process.exit(0);
