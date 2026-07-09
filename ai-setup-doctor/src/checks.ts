import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import type { CheckResult } from "./types.js";

const SECRET_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "aws-key", re: /AKIA[0-9A-Z]{16}/ },
  { id: "github-pat", re: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { id: "openai", re: /sk-[A-Za-z0-9]{20,}/ },
  { id: "generic-key", re: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { id: "private-key", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

function safeRead(path: string, max = 200_000): string | null {
  try {
    if (!existsSync(path) || !statSync(path).isFile()) return null;
    const size = statSync(path).size;
    if (size > max) return readFileSync(path, "utf8").slice(0, max);
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function dirHasFiles(path: string): boolean {
  try {
    if (!existsSync(path) || !statSync(path).isDirectory()) return false;
    return readdirSync(path).length > 0;
  } catch {
    return false;
  }
}

function listFilesRecursive(dir: string, max = 40): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    if (out.length >= max) return;
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const name of entries) {
      if (out.length >= max) break;
      if (name === "node_modules" || name === ".git" || name === "dist") continue;
      const p = join(d, name);
      try {
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else if (st.isFile()) out.push(p);
      } catch {
        /* skip */
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/** Detect installed / configured AI coding agents in a project. */
export function checkAgents(cwd: string): CheckResult[] {
  const agents: { id: string; name: string; paths: string[] }[] = [
    { id: "cursor", name: "Cursor", paths: [join(cwd, ".cursor"), join(cwd, ".cursor", "rules")] },
    { id: "windsurf", name: "Windsurf", paths: [join(cwd, ".windsurf"), join(cwd, ".windsurf", "rules")] },
    { id: "copilot", name: "GitHub Copilot", paths: [join(cwd, ".github", "copilot-instructions.md"), join(cwd, ".github", "instructions")] },
    { id: "claude", name: "Claude Code", paths: [join(cwd, "CLAUDE.md"), join(cwd, ".claude")] },
    { id: "gemini", name: "Gemini CLI", paths: [join(cwd, "GEMINI.md"), join(cwd, ".gemini")] },
    { id: "aider", name: "Aider", paths: [join(cwd, ".aider"), join(cwd, ".aider.conf.yml")] },
    { id: "continue", name: "Continue.dev", paths: [join(cwd, ".continue")] },
  ];

  const found: string[] = [];
  const missing: string[] = [];

  for (const a of agents) {
    const hit = a.paths.some((p) => existsSync(p));
    if (hit) found.push(a.name);
    else missing.push(a.name);
  }

  const results: CheckResult[] = [];
  if (found.length === 0) {
    results.push({
      id: "agents-none",
      title: "AI agents",
      severity: "warn",
      message: "No agent config detected in this project",
      detail: `Looked for Cursor, Windsurf, Copilot, Claude, Gemini, Aider, Continue under ${cwd}`,
      fix: "Add rules with: npx ai-instruct-sync@beta init .",
    });
  } else {
    results.push({
      id: "agents-found",
      title: "AI agents",
      severity: "ok",
      message: `Detected ${found.length} agent setup(s): ${found.join(", ")}`,
      detail: missing.length ? `Not detected: ${missing.join(", ")}` : undefined,
    });
  }

  // Multi-agent drift hint
  if (found.length >= 2) {
    results.push({
      id: "agents-multi",
      title: "Multi-agent project",
      severity: "info",
      message: "Multiple agents configured — rules can drift between tools",
      fix: "Run: npx ai-instruct-sync@beta status && npx ai-instruct-sync@beta diff",
    });
  }

  return results;
}

/** MCP config locations (project + user). */
export function checkMcp(cwd: string): CheckResult[] {
  const home = homedir();
  const candidates: { label: string; path: string }[] = [
    { label: "Cursor (project)", path: join(cwd, ".cursor", "mcp.json") },
    { label: "VS Code (project)", path: join(cwd, ".vscode", "mcp.json") },
    { label: "Claude Code (project)", path: join(cwd, ".mcp.json") },
    { label: "Windsurf (project)", path: join(cwd, ".windsurf", "mcp.json") },
    { label: "Cursor (user)", path: join(home, ".cursor", "mcp.json") },
    { label: "Claude Desktop (user)", path: join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json") },
  ];

  const found = candidates.filter((c) => existsSync(c.path));
  const results: CheckResult[] = [];

  if (found.length === 0) {
    results.push({
      id: "mcp-none",
      title: "MCP configs",
      severity: "info",
      message: "No MCP config files found (optional)",
      detail: "MCP is only needed if you use external tools/servers with your agent",
    });
    return results;
  }

  results.push({
    id: "mcp-found",
    title: "MCP configs",
    severity: "ok",
    message: `Found ${found.length} MCP config(s)`,
    detail: found.map((f) => `${f.label}: ${f.path}`).join("\n"),
  });

  // Parse for empty servers / broken JSON
  for (const f of found) {
    const raw = safeRead(f.path);
    if (raw === null) continue;
    try {
      const json = JSON.parse(raw) as Record<string, unknown>;
      const servers =
        (json.mcpServers as Record<string, unknown> | undefined) ||
        (json.servers as Record<string, unknown> | undefined) ||
        {};
      const count = Object.keys(servers || {}).length;
      if (count === 0) {
        results.push({
          id: `mcp-empty-${basename(f.path)}`,
          title: `MCP: ${f.label}`,
          severity: "warn",
          message: "Config exists but defines 0 servers",
          detail: f.path,
          fix: "Add an MCP server entry, or remove the empty file",
        });
      } else {
        results.push({
          id: `mcp-servers-${basename(f.path)}-${count}`,
          title: `MCP: ${f.label}`,
          severity: "ok",
          message: `${count} server(s) configured`,
          detail: f.path,
        });
      }
    } catch {
      results.push({
        id: `mcp-json-${basename(f.path)}`,
        title: `MCP: ${f.label}`,
        severity: "error",
        message: "Invalid JSON — agent may fail to load tools",
        detail: f.path,
        fix: `Validate JSON in ${f.path}`,
      });
    }
  }

  if (found.length >= 2) {
    results.push({
      id: "mcp-multi",
      title: "MCP multi-tool",
      severity: "info",
      message: "MCP configs live in multiple places — they can drift",
      fix: "Consider syncing with mcp-sync if you maintain several clients",
    });
  }

  return results;
}

/** Node runtime health. */
export function checkRuntime(): CheckResult[] {
  const major = Number(process.versions.node.split(".")[0]);
  const results: CheckResult[] = [];

  if (major < 20) {
    results.push({
      id: "node-old",
      title: "Node.js",
      severity: "error",
      message: `Node ${process.versions.node} is below 20 (many AI CLIs require ≥20)`,
      fix: "Upgrade Node: https://nodejs.org or use nvm/fnm",
    });
  } else {
    results.push({
      id: "node-ok",
      title: "Node.js",
      severity: "ok",
      message: `Node ${process.versions.node}`,
    });
  }

  return results;
}

/** .env presence + gitignore safety. */
export function checkEnvSafety(cwd: string): CheckResult[] {
  const results: CheckResult[] = [];
  const envPath = join(cwd, ".env");
  const envExample = join(cwd, ".env.example");
  const gitignore = join(cwd, ".gitignore");

  const hasEnv = existsSync(envPath);
  const hasExample = existsSync(envExample);
  const gi = safeRead(gitignore) || "";

  if (hasEnv) {
    const ignored =
      /(^|\/|\n)\.env(\n|$)/.test(gi) ||
      gi.split("\n").some((l) => l.trim() === ".env" || l.trim() === ".env*" || l.trim() === "*.env");
    if (!ignored) {
      results.push({
        id: "env-not-ignored",
        title: "Secrets: .env",
        severity: "error",
        message: ".env exists but may not be gitignored — risk of leaking keys",
        detail: envPath,
        fix: "Add `.env` to .gitignore immediately",
      });
    } else {
      results.push({
        id: "env-ignored",
        title: "Secrets: .env",
        severity: "ok",
        message: ".env is present and gitignored",
      });
    }
  } else {
    results.push({
      id: "env-absent",
      title: "Secrets: .env",
      severity: "info",
      message: "No project .env file (fine if secrets live elsewhere)",
    });
  }

  if (hasExample && !hasEnv) {
    results.push({
      id: "env-example-only",
      title: "Secrets: .env.example",
      severity: "info",
      message: ".env.example exists but no .env — local setup may be incomplete",
      fix: "Copy .env.example → .env and fill values",
    });
  }

  return results;
}

/** Scan agent/rule files for accidental secrets. */
export function checkSecretLeaks(cwd: string): CheckResult[] {
  const scanRoots = [
    join(cwd, ".cursor"),
    join(cwd, ".windsurf"),
    join(cwd, ".continue"),
    join(cwd, ".github"),
    join(cwd, ".claude"),
    join(cwd, ".aider"),
  ];
  const flatFiles = [
    join(cwd, "CLAUDE.md"),
    join(cwd, "GEMINI.md"),
    join(cwd, "AGENTS.md"),
    join(cwd, ".mcp.json"),
  ];

  const files = new Set<string>();
  for (const root of scanRoots) {
    for (const f of listFilesRecursive(root, 30)) {
      if (/\.(md|mdc|json|yml|yaml|txt)$/i.test(f)) files.add(f);
    }
  }
  for (const f of flatFiles) if (existsSync(f)) files.add(f);

  const hits: { file: string; kind: string }[] = [];
  for (const file of files) {
    const text = safeRead(file);
    if (!text) continue;
    for (const p of SECRET_PATTERNS) {
      if (p.re.test(text)) {
        hits.push({ file, kind: p.id });
        break;
      }
    }
  }

  if (hits.length === 0) {
    return [
      {
        id: "secrets-clean",
        title: "Secret scan",
        severity: "ok",
        message: `No obvious secrets in ${files.size} agent/config file(s)`,
      },
    ];
  }

  return [
    {
      id: "secrets-found",
      title: "Secret scan",
      severity: "error",
      message: `Possible secret material in ${hits.length} file(s)`,
      detail: hits.map((h) => `${h.kind}: ${h.file}`).join("\n"),
      fix: "Remove keys from rules/MCP configs; use env vars instead, then rotate any exposed credentials",
    },
  ];
}

/** Project hygiene that affects AI quality. */
export function checkProjectHygiene(cwd: string): CheckResult[] {
  const results: CheckResult[] = [];
  const readme = ["README.md", "readme.md", "Readme.md"].map((n) => join(cwd, n)).find(existsSync);
  const git = existsSync(join(cwd, ".git"));
  const pkg = existsSync(join(cwd, "package.json"));

  results.push({
    id: "git",
    title: "Git repo",
    severity: git ? "ok" : "info",
    message: git ? "Git repository detected" : "Not a git repo (agents still work, history features won't)",
  });

  if (readme) {
    const body = safeRead(readme) || "";
    results.push({
      id: "readme",
      title: "README",
      severity: body.trim().length > 40 ? "ok" : "warn",
      message: body.trim().length > 40 ? "README present" : "README is very short — agents get less project context",
      fix: body.trim().length > 40 ? undefined : "Add a short project overview for better agent answers",
    });
  } else {
    results.push({
      id: "readme-missing",
      title: "README",
      severity: "warn",
      message: "No README — agents have less default context about the project",
      fix: "Add a README.md with what the project does and how to run it",
    });
  }

  if (pkg) {
    results.push({
      id: "package-json",
      title: "package.json",
      severity: "ok",
      message: "Node project manifest found",
    });
  }

  // Huge rules warning
  const ruleDirs = [join(cwd, ".cursor", "rules"), join(cwd, ".windsurf", "rules"), join(cwd, ".continue", "rules")];
  for (const dir of ruleDirs) {
    if (!dirHasFiles(dir)) continue;
    const files = listFilesRecursive(dir, 100);
    let total = 0;
    for (const f of files) {
      const t = safeRead(f);
      if (t) total += t.length;
    }
    if (total > 80_000) {
      results.push({
        id: `rules-bloat-${basename(dir)}`,
        title: "Rules size",
        severity: "warn",
        message: `Large rules under ${dir} (~${Math.round(total / 1000)}KB) may waste context`,
        fix: "Trim rarely used rules; prefer short, high-signal instructions",
      });
    }
  }

  return results;
}
