import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";

/**
 * Where agent-executed instruction content lives. Project first, then user
 * home when includeUser. Skills, subagents, and slash commands are all
 * agent-run content — one compromised file is enough.
 */
export function skillRoots(cwd: string, includeUser: boolean): string[] {
  const home = homedir();
  const roots = [
    join(cwd, ".claude", "skills"),
    join(cwd, ".claude", "agents"),
    join(cwd, ".claude", "commands"),
    join(cwd, ".cursor", "commands"),
  ];
  if (includeUser) {
    roots.push(
      join(home, ".claude", "skills"),
      join(home, ".claude", "agents"),
      join(home, ".claude", "commands"),
    );
  }
  return roots.filter((r) => existsSync(r));
}

/** Rules/instructions files read by agents on every session. */
export function ruleFiles(cwd: string): string[] {
  const single = [
    "CLAUDE.md",
    "CLAUDE.local.md",
    "AGENTS.md",
    "GEMINI.md",
    ".cursorrules",
    ".clinerules",
    ".windsurfrules",
    join(".github", "copilot-instructions.md"),
  ].map((f) => join(cwd, f));

  const dirs = [
    join(cwd, ".cursor", "rules"),
    join(cwd, ".windsurf", "rules"),
    join(cwd, ".continue", "rules"),
  ];

  const out = single.filter((f) => existsSync(f));
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    try {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (statSync(p).isFile()) out.push(p);
        } catch {
          /* skip */
        }
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

/** MCP server config files across clients. */
export function mcpConfigPaths(cwd: string, includeUser: boolean): string[] {
  const home = homedir();
  const paths = [
    join(cwd, ".mcp.json"),
    join(cwd, ".cursor", "mcp.json"),
    join(cwd, ".vscode", "mcp.json"),
    join(cwd, ".windsurf", "mcp.json"),
  ];
  if (includeUser) {
    paths.push(join(home, ".cursor", "mcp.json"), join(home, ".claude.json"));
    if (process.platform === "darwin") {
      paths.push(join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"));
    } else if (process.platform === "win32") {
      const appdata = process.env.APPDATA || join(home, "AppData", "Roaming");
      paths.push(join(appdata, "Claude", "claude_desktop_config.json"));
    } else {
      paths.push(join(home, ".config", "Claude", "claude_desktop_config.json"));
    }
  }
  return paths.filter((p) => existsSync(p));
}

/** Agent hook configs — hooks run arbitrary shell commands automatically. */
export function hookConfigPaths(cwd: string, includeUser: boolean): string[] {
  const home = homedir();
  const paths = [
    join(cwd, ".claude", "settings.json"),
    join(cwd, ".claude", "settings.local.json"),
  ];
  if (includeUser) paths.push(join(home, ".claude", "settings.json"));
  return paths.filter((p) => existsSync(p));
}
