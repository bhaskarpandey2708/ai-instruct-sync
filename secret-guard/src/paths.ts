import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { listFilesRecursive } from "./fs.js";

/** Project paths that AI tools use — the leak surface classic scanners miss. */
export function collectAgentFiles(cwd: string, maxFiles: number): string[] {
  const roots: string[] = [];
  const candidates = [
    join(cwd, "AGENTS.md"),
    join(cwd, "CLAUDE.md"),
    join(cwd, "GEMINI.md"),
    join(cwd, "codex.md"),
    join(cwd, ".codex.md"),
    join(cwd, ".cursorrules"),
    join(cwd, ".clinerules"),
    join(cwd, ".aider.conf.yml"),
    join(cwd, ".env.example"),
    join(cwd, ".env.sample"),
    join(cwd, ".env.template"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) roots.push(p);
  }

  const dirs = [
    join(cwd, ".cursor"),
    join(cwd, ".claude"),
    join(cwd, ".windsurf"),
    join(cwd, ".continue"),
    join(cwd, ".codex"),
    join(cwd, ".aider"),
    join(cwd, ".cline"),
    join(cwd, ".zed"),
    join(cwd, ".gemini"),
    join(cwd, ".github", "instructions"),
    join(cwd, ".github"),
  ];

  const files: string[] = [...roots];
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    for (const f of listFilesRecursive(d, maxFiles)) {
      if (isTextyPath(f)) files.push(f);
      if (files.length >= maxFiles) return dedupe(files);
    }
  }

  // Copilot instructions file
  const copilot = join(cwd, ".github", "copilot-instructions.md");
  if (existsSync(copilot)) files.push(copilot);

  return dedupe(files).slice(0, maxFiles);
}

export function collectMcpConfigPaths(cwd: string, includeUser: boolean): string[] {
  const paths: string[] = [];
  const project = [
    join(cwd, ".cursor", "mcp.json"),
    join(cwd, ".vscode", "mcp.json"),
    join(cwd, "mcp.json"),
    join(cwd, ".mcp.json"),
  ];
  for (const p of project) {
    if (existsSync(p)) paths.push(p);
  }

  if (includeUser) {
    const home = homedir();
    const user = [
      join(home, ".cursor", "mcp.json"),
      join(home, ".claude.json"),
      join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      join(home, "Library", "Application Support", "Code", "User", "mcp.json"),
      join(home, ".codeium", "windsurf", "mcp_config.json"),
      join(home, ".gemini", "settings.json"),
      join(home, ".copilot", "mcp-config.json"),
    ];
    for (const p of user) {
      if (existsSync(p)) paths.push(p);
    }
  }
  return dedupe(paths);
}

function isTextyPath(p: string): boolean {
  const lower = p.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|zip|gz|tar|mp4|mov|pdf|node|wasm)$/i.test(lower)) {
    return false;
  }
  // Prefer known text / config extensions; allow extensionless rule files
  if (/\.(md|mdc|txt|json|jsonc|ya?ml|toml|env|example|sample|ts|js|mjs|cjs|py|sh)$/i.test(lower)) {
    return true;
  }
  // bare / extensionless rule files under agent dirs
  const base = lower.split(/[/\\]/).pop() ?? "";
  if (!base.includes(".")) return true;
  return false;
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}
