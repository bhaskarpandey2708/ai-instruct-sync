import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import type { CheckResult, DoctorOptions } from "./types.js";
import {
  commandLooksRunnable,
  dirHasFiles,
  dirOf,
  gitTrackedFiles,
  isGitWorkTree,
  listFilesRecursive,
  looksLikeJsonWithComments,
  normalizeInstructionText,
  safeRead,
  simpleHash,
} from "./fs-utils.js";
import {
  findInstructionContradictions,
  findSecretHits,
  isEnvIgnoredByGitignore,
  isUnpinnedPackageArg,
  looksLikeHardcodedSecret,
  PLACEHOLDER_PATTERNS,
} from "./patterns.js";

function result(
  partial: Omit<CheckResult, "category"> & { category: CheckResult["category"] },
): CheckResult {
  return partial;
}

/** Detect installed / configured AI coding agents in a project. */
export function checkAgents(cwd: string): CheckResult[] {
  const agents: { id: string; name: string; paths: string[]; fileOnly?: boolean }[] = [
    {
      id: "agents-md",
      name: "AGENTS.md",
      paths: [join(cwd, "AGENTS.md")],
      fileOnly: true,
    },
    {
      id: "cursor",
      name: "Cursor",
      paths: [
        join(cwd, ".cursor"),
        join(cwd, ".cursor", "rules"),
        join(cwd, ".cursorrules"),
      ],
    },
    {
      id: "windsurf",
      name: "Windsurf",
      paths: [join(cwd, ".windsurf"), join(cwd, ".windsurf", "rules")],
    },
    {
      id: "copilot",
      name: "GitHub Copilot",
      paths: [
        join(cwd, ".github", "copilot-instructions.md"),
        join(cwd, ".github", "instructions"),
      ],
    },
    {
      id: "claude",
      name: "Claude Code",
      paths: [join(cwd, "CLAUDE.md"), join(cwd, ".claude")],
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      paths: [join(cwd, "GEMINI.md"), join(cwd, ".gemini")],
    },
    {
      id: "codex",
      name: "OpenAI Codex",
      paths: [join(cwd, ".codex"), join(cwd, "codex.md"), join(cwd, ".codex.md")],
    },
    {
      id: "cline",
      name: "Cline",
      paths: [join(cwd, ".clinerules"), join(cwd, ".cline")],
    },
    {
      id: "zed",
      name: "Zed",
      paths: [join(cwd, ".zed"), join(cwd, ".rules")],
    },
    {
      id: "aider",
      name: "Aider",
      paths: [join(cwd, ".aider"), join(cwd, ".aider.conf.yml")],
    },
    {
      id: "continue",
      name: "Continue.dev",
      paths: [join(cwd, ".continue")],
    },
  ];

  const found: string[] = [];
  const missing: string[] = [];
  const emptyShells: string[] = [];

  for (const a of agents) {
    const hitPaths = a.paths.filter((p) => existsSync(p));
    if (hitPaths.length === 0) {
      missing.push(a.name);
      continue;
    }
    found.push(a.name);

    // Empty directory shells (e.g. mkdir .cursor with nothing useful)
    for (const p of hitPaths) {
      try {
        const st = statSync(p);
        if (st.isDirectory() && !dirHasFiles(p)) {
          emptyShells.push(`${a.name} (${p})`);
        }
        if (st.isFile() && st.size < 20) {
          emptyShells.push(`${a.name} (${p} nearly empty)`);
        }
      } catch {
        /* skip */
      }
    }
  }

  const results: CheckResult[] = [];
  if (found.length === 0) {
    results.push(
      result({
        id: "agents-none",
        title: "AI agents",
        category: "agents",
        severity: "warn",
        message: "No agent config detected in this project",
        detail:
          "Looked for AGENTS.md, Cursor, Windsurf, Copilot, Claude, Gemini, Codex, Cline, Zed, Aider, Continue",
        fix: "Add rules with: npx ai-instruct-sync@beta init .",
      }),
    );
  } else {
    results.push(
      result({
        id: "agents-found",
        title: "AI agents",
        category: "agents",
        severity: "ok",
        message: `Detected ${found.length} agent setup(s): ${found.join(", ")}`,
        detail: missing.length ? `Not detected: ${missing.join(", ")}` : undefined,
      }),
    );
  }

  if (emptyShells.length > 0) {
    results.push(
      result({
        id: "agents-empty-shell",
        title: "Empty agent config",
        category: "agents",
        severity: "warn",
        message: `${emptyShells.length} agent path(s) exist but look empty`,
        detail: emptyShells.join("\n"),
        fix: "Add real rules/instructions, or remove empty dirs so tools don't pretend they are configured",
      }),
    );
  }

  if (found.length >= 2) {
    results.push(
      result({
        id: "agents-multi",
        title: "Multi-agent project",
        category: "agents",
        severity: "info",
        message: "Multiple agents configured — rules can drift between tools",
        fix: "Run: npx ai-instruct-sync@beta status && npx ai-instruct-sync@beta diff",
      }),
    );
  }

  // Instruction drift between common source-of-truth files
  const instructionPairs: [string, string][] = [
    [join(cwd, "AGENTS.md"), join(cwd, "CLAUDE.md")],
    [join(cwd, "AGENTS.md"), join(cwd, "GEMINI.md")],
    [join(cwd, "CLAUDE.md"), join(cwd, "GEMINI.md")],
  ];
  for (const [a, b] of instructionPairs) {
    const ta = safeRead(a);
    const tb = safeRead(b);
    if (!ta || !tb) continue;
    if (ta.trim().length < 40 || tb.trim().length < 40) continue;
    const ha = simpleHash(normalizeInstructionText(ta));
    const hb = simpleHash(normalizeInstructionText(tb));
    if (ha !== hb) {
      results.push(
        result({
          id: `agents-drift-${basename(a)}-${basename(b)}`,
          title: "Instruction drift",
          category: "agents",
          severity: "warn",
          message: `${basename(a)} and ${basename(b)} differ — agents may disagree`,
          detail: `${a}\n${b}`,
          fix: "Pick one source of truth (often AGENTS.md) and sync with ai-instruct-sync",
        }),
      );
    }
  }

  return results;
}

interface McpCandidate {
  label: string;
  path: string;
  userLevel: boolean;
}

function projectMcpCandidates(cwd: string): McpCandidate[] {
  return [
    { label: "Cursor (project)", path: join(cwd, ".cursor", "mcp.json"), userLevel: false },
    { label: "VS Code (project)", path: join(cwd, ".vscode", "mcp.json"), userLevel: false },
    { label: "Claude Code (project)", path: join(cwd, ".mcp.json"), userLevel: false },
    { label: "Windsurf (project)", path: join(cwd, ".windsurf", "mcp.json"), userLevel: false },
    { label: "Continue (project)", path: join(cwd, ".continue", "mcpServers.json"), userLevel: false },
  ];
}

function userMcpCandidates(): McpCandidate[] {
  const home = homedir();
  return [
    { label: "Cursor (user)", path: join(home, ".cursor", "mcp.json"), userLevel: true },
    {
      label: "Claude Desktop (user)",
      path: join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      userLevel: true,
    },
    {
      label: "Claude Desktop (Linux)",
      path: join(home, ".config", "Claude", "claude_desktop_config.json"),
      userLevel: true,
    },
  ];
}

type McpServer = Record<string, unknown>;

function extractServers(json: Record<string, unknown>): Record<string, McpServer> {
  const raw =
    (json.mcpServers as Record<string, unknown> | undefined) ||
    (json.servers as Record<string, unknown> | undefined) ||
    {};
  const out: Record<string, McpServer> = {};
  for (const [name, val] of Object.entries(raw || {})) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[name] = val as McpServer;
    } else {
      out[name] = { _invalid: true, value: val };
    }
  }
  return out;
}

function validateMcpServer(
  name: string,
  server: McpServer,
  label: string,
  filePath: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const idBase = `mcp-server-${basename(filePath)}-${name}`.replace(/[^a-zA-Z0-9_-]/g, "_");

  if (server._invalid) {
    results.push(
      result({
        id: `${idBase}-invalid`,
        title: `MCP server: ${name}`,
        category: "mcp",
        severity: "error",
        message: `Server "${name}" is not an object in ${label}`,
        detail: filePath,
        fix: "Each MCP server entry must be a JSON object with command or url",
      }),
    );
    return results;
  }

  const command = typeof server.command === "string" ? server.command.trim() : "";
  const url = typeof server.url === "string" ? server.url.trim() : "";
  const type = typeof server.type === "string" ? server.type : "";
  const disabled = server.disabled === true || server.enabled === false;

  if (disabled) {
    results.push(
      result({
        id: `${idBase}-disabled`,
        title: `MCP server: ${name}`,
        category: "mcp",
        severity: "info",
        message: `Server "${name}" is disabled`,
        detail: filePath,
      }),
    );
  }

  const needsTransport = !disabled;
  if (needsTransport && !command && !url) {
    results.push(
      result({
        id: `${idBase}-no-transport`,
        title: `MCP server: ${name}`,
        category: "mcp",
        severity: "error",
        message: `Server "${name}" has neither command nor url — will not start`,
        detail: `${label}: ${filePath}`,
        fix: 'Add "command" (stdio) or "url" (SSE/HTTP) to the server entry',
      }),
    );
  }

  if (command === "" && typeof server.command === "string") {
    results.push(
      result({
        id: `${idBase}-empty-cmd`,
        title: `MCP server: ${name}`,
        category: "mcp",
        severity: "error",
        message: `Server "${name}" has empty command`,
        detail: filePath,
        fix: "Set a real executable (e.g. npx, node, uvx)",
      }),
    );
  }

  if (url && !/^https?:\/\//i.test(url) && type !== "stdio") {
    results.push(
      result({
        id: `${idBase}-bad-url`,
        title: `MCP server: ${name}`,
        category: "mcp",
        severity: "warn",
        message: `Server "${name}" url does not look like http(s)`,
        detail: url,
        fix: "Use a full http:// or https:// URL for remote MCP servers",
      }),
    );
  }

  // Command resolvability (PATH or file)
  if (command && needsTransport) {
    const base = dirOf(filePath);
    if (!commandLooksRunnable(command, base)) {
      results.push(
        result({
          id: `${idBase}-cmd-missing`,
          title: `MCP server: ${name}`,
          category: "mcp",
          severity: "warn",
          message: `Command "${command}" for "${name}" not found on PATH / disk`,
          detail: filePath,
          fix: "Install the tool, fix the path, or use a full absolute command",
        }),
      );
    }
  }

  const args = Array.isArray(server.args) ? server.args.filter((a): a is string => typeof a === "string") : [];

  // Unpinned npx / bunx / yarn dlx packages (reproducibility + supply-chain)
  const runners = new Set(["npx", "bunx", "pnpm", "yarn", "dlx"]);
  if (command && runners.has(command.toLowerCase()) && needsTransport) {
    const pkgArgs = args.filter((a) => !a.startsWith("-") && a !== "dlx");
    // yarn dlx pkg / pnpm dlx pkg
    const effective = command.toLowerCase() === "yarn" || command.toLowerCase() === "pnpm"
      ? args[0] === "dlx"
        ? pkgArgs.slice(1)
        : []
      : pkgArgs;
    const unpinned = effective.filter(isUnpinnedPackageArg);
    if (unpinned.length > 0) {
      results.push(
        result({
          id: `${idBase}-unpinned`,
          title: `MCP pin: ${name}`,
          category: "mcp",
          severity: "warn",
          message: `Unpinned package in "${name}" args (floating latest)`,
          detail: unpinned.join(", "),
          fix: "Pin versions e.g. @modelcontextprotocol/server-filesystem@0.6.2",
        }),
      );
    }
  }

  // Hardcoded secrets in env / headers
  const env = (server.env as Record<string, unknown> | undefined) || {};
  const secretEnvHits: string[] = [];
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string" && looksLikeHardcodedSecret(v)) {
      secretEnvHits.push(k);
    }
  }
  // headers object (some clients)
  const headers = (server.headers as Record<string, unknown> | undefined) || {};
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === "string" && looksLikeHardcodedSecret(v)) {
      secretEnvHits.push(`header:${k}`);
    }
  }
  if (secretEnvHits.length > 0) {
    results.push(
      result({
        id: `${idBase}-env-secrets`,
        title: `MCP secrets: ${name}`,
        category: "secrets",
        severity: "error",
        message: `Hardcoded secret-like env in MCP server "${name}"`,
        detail: `Keys: ${secretEnvHits.join(", ")}\n${filePath}`,
        fix: "Move values to shell env / secret manager; reference with ${VAR} if supported",
      }),
    );
  }

  // Args that embed keys
  for (const arg of args) {
    const hits = findSecretHits(arg, 1);
    if (hits.length > 0) {
      results.push(
        result({
          id: `${idBase}-arg-secret`,
          title: `MCP secrets: ${name}`,
          category: "secrets",
          severity: "error",
          message: `Possible secret in MCP args for "${name}" (${hits[0]!.id})`,
          detail: filePath,
          fix: "Do not pass API keys on the command line; use env vars",
        }),
      );
      break;
    }
  }

  return results;
}

/** MCP config locations (project + optional user). */
export function checkMcp(cwd: string, options: DoctorOptions = {}): CheckResult[] {
  const includeUser = options.includeUserConfigs !== false;
  const candidates = [
    ...projectMcpCandidates(cwd),
    ...(includeUser ? userMcpCandidates() : []),
  ];

  const found = candidates.filter((c) => existsSync(c.path));
  const results: CheckResult[] = [];

  if (found.length === 0) {
    results.push(
      result({
        id: "mcp-none",
        title: "MCP configs",
        category: "mcp",
        severity: "info",
        message: "No MCP config files found (optional)",
        detail: "MCP is only needed if you use external tools/servers with your agent",
      }),
    );
    return results;
  }

  results.push(
    result({
      id: "mcp-found",
      title: "MCP configs",
      category: "mcp",
      severity: "ok",
      message: `Found ${found.length} MCP config(s)`,
      detail: found.map((f) => `${f.label}: ${f.path}`).join("\n"),
    }),
  );

  const serverNameMap = new Map<string, string[]>();

  for (const f of found) {
    const raw = safeRead(f.path);
    if (raw === null) {
      results.push(
        result({
          id: `mcp-unreadable-${basename(f.path)}`,
          title: `MCP: ${f.label}`,
          category: "mcp",
          severity: "warn",
          message: "Config file exists but could not be read",
          detail: f.path,
        }),
      );
      continue;
    }

    try {
      const json = JSON.parse(raw) as Record<string, unknown>;
      const servers = extractServers(json);
      const count = Object.keys(servers).length;

      if (count === 0) {
        results.push(
          result({
            id: `mcp-empty-${basename(f.path)}`,
            title: `MCP: ${f.label}`,
            category: "mcp",
            severity: "warn",
            message: "Config exists but defines 0 servers",
            detail: f.path,
            fix: "Add an MCP server entry, or remove the empty file",
          }),
        );
      } else {
        results.push(
          result({
            id: `mcp-servers-${basename(f.path)}-${count}`,
            title: `MCP: ${f.label}`,
            category: "mcp",
            severity: "ok",
            message: `${count} server(s) configured`,
            detail: f.path,
          }),
        );
      }

      for (const [name, server] of Object.entries(servers)) {
        const locs = serverNameMap.get(name) || [];
        locs.push(f.label);
        serverNameMap.set(name, locs);
        results.push(...validateMcpServer(name, server, f.label, f.path));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "parse error";
      const jsonc = looksLikeJsonWithComments(raw);
      const trailing = /,\s*[}\]]/.test(raw);
      results.push(
        result({
          id: `mcp-json-${basename(f.path)}`,
          title: `MCP: ${f.label}`,
          category: "mcp",
          severity: "error",
          message: jsonc
            ? "Invalid JSON (looks like JSONC — comments are not valid JSON)"
            : trailing
              ? "Invalid JSON (possible trailing comma)"
              : "Invalid JSON — agent may fail to load tools",
          detail: `${f.path}\n${msg}`,
          fix: jsonc
            ? `Remove // and /* */ comments from ${f.path} (strict JSON only)`
            : `Validate JSON in ${f.path} (trailing commas and comments are not valid JSON)`,
        }),
      );
    }
  }

  // Same server name in multiple configs (drift risk)
  for (const [name, locs] of serverNameMap) {
    const unique = [...new Set(locs)];
    if (unique.length >= 2) {
      results.push(
        result({
          id: `mcp-name-dup-${name}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
          title: "MCP name collision",
          category: "mcp",
          severity: "info",
          message: `Server name "${name}" appears in ${unique.length} configs`,
          detail: unique.join(", "),
          fix: "Keep definitions in sync or use mcp-sync to avoid drift",
        }),
      );
    }
  }

  if (found.length >= 2) {
    results.push(
      result({
        id: "mcp-multi",
        title: "MCP multi-tool",
        category: "mcp",
        severity: "info",
        message: "MCP configs live in multiple places — they can drift",
        fix: "Consider syncing with mcp-sync if you maintain several clients",
      }),
    );
  }

  return results;
}

/** Node runtime health. */
export function checkRuntime(): CheckResult[] {
  const major = Number(process.versions.node.split(".")[0]);
  const results: CheckResult[] = [];

  if (major < 20) {
    results.push(
      result({
        id: "node-old",
        title: "Node.js",
        category: "runtime",
        severity: "error",
        message: `Node ${process.versions.node} is below 20 (many AI CLIs require ≥20)`,
        fix: "Upgrade Node: https://nodejs.org or use nvm/fnm",
      }),
    );
  } else {
    results.push(
      result({
        id: "node-ok",
        title: "Node.js",
        category: "runtime",
        severity: "ok",
        message: `Node ${process.versions.node}`,
      }),
    );
  }

  return results;
}

/** .env presence + gitignore safety + tracked secrets. */
export function checkEnvSafety(cwd: string): CheckResult[] {
  const results: CheckResult[] = [];
  const envNames = [".env", ".env.local", ".env.development", ".env.production"];
  const presentEnv = envNames.filter((n) => existsSync(join(cwd, n)));
  const envExample = join(cwd, ".env.example");
  const gitignore = join(cwd, ".gitignore");
  const gi = safeRead(gitignore) || "";
  const hasExample = existsSync(envExample);

  if (presentEnv.length > 0) {
    const ignored = isEnvIgnoredByGitignore(gi);
    if (!ignored) {
      results.push(
        result({
          id: "env-not-ignored",
          title: "Secrets: .env",
          category: "secrets",
          severity: "error",
          message: `${presentEnv.join(", ")} exist but may not be gitignored — risk of leaking keys`,
          detail: presentEnv.map((n) => join(cwd, n)).join("\n"),
          fix: "Add `.env*` to .gitignore immediately",
        }),
      );
    } else {
      results.push(
        result({
          id: "env-ignored",
          title: "Secrets: .env",
          category: "secrets",
          severity: "ok",
          message: `${presentEnv.join(", ")} present and appear gitignored`,
        }),
      );
    }
  } else {
    results.push(
      result({
        id: "env-absent",
        title: "Secrets: .env",
        category: "secrets",
        severity: "info",
        message: "No project .env file (fine if secrets live elsewhere)",
      }),
    );
  }

  if (hasExample && presentEnv.length === 0) {
    results.push(
      result({
        id: "env-example-only",
        title: "Secrets: .env.example",
        category: "secrets",
        severity: "info",
        message: ".env.example exists but no .env — local setup may be incomplete",
        fix: "Copy .env.example → .env and fill values",
      }),
    );
  }

  // Git-tracked sensitive files (tough case: already committed)
  if (isGitWorkTree(cwd)) {
    const tracked = gitTrackedFiles(cwd, [
      ".env",
      ".env.*",
      "*.pem",
      "*.p12",
      "id_rsa",
      "id_ed25519",
      "credentials.json",
      "service-account*.json",
    ]).filter((f) => !f.endsWith(".env.example") && !f.includes(".env.example"));

    if (tracked.length > 0) {
      results.push(
        result({
          id: "env-git-tracked",
          title: "Secrets: git-tracked",
          category: "secrets",
          severity: "error",
          message: `${tracked.length} sensitive file(s) are tracked by git`,
          detail: tracked.slice(0, 20).join("\n"),
          fix: "git rm --cached <file>, add to .gitignore, rotate any exposed credentials",
        }),
      );
    } else {
      results.push(
        result({
          id: "env-git-clean",
          title: "Secrets: git-tracked",
          category: "secrets",
          severity: "ok",
          message: "No obvious secret files tracked by git",
        }),
      );
    }
  }

  return results;
}

function collectScanFiles(cwd: string): string[] {
  const scanRoots = [
    join(cwd, ".cursor"),
    join(cwd, ".windsurf"),
    join(cwd, ".continue"),
    join(cwd, ".github"),
    join(cwd, ".claude"),
    join(cwd, ".aider"),
    join(cwd, ".codex"),
    join(cwd, ".clinerules"),
    join(cwd, ".zed"),
  ];
  const flatFiles = [
    join(cwd, "CLAUDE.md"),
    join(cwd, "GEMINI.md"),
    join(cwd, "AGENTS.md"),
    join(cwd, ".mcp.json"),
    join(cwd, ".cursorrules"),
    join(cwd, "codex.md"),
  ];

  const files = new Set<string>();
  for (const root of scanRoots) {
    if (!existsSync(root)) continue;
    try {
      if (statSync(root).isFile()) {
        files.add(root);
        continue;
      }
    } catch {
      continue;
    }
    for (const f of listFilesRecursive(root, 40)) {
      if (/\.(md|mdc|json|yml|yaml|txt)$/i.test(f)) files.add(f);
    }
  }
  for (const f of flatFiles) if (existsSync(f)) files.add(f);
  // project MCP paths
  for (const c of projectMcpCandidates(cwd)) {
    if (existsSync(c.path)) files.add(c.path);
  }
  return [...files];
}

/** Scan agent/rule files for accidental secrets (allowlist-aware). */
export function checkSecretLeaks(cwd: string): CheckResult[] {
  const files = collectScanFiles(cwd);
  const hits: { file: string; kind: string }[] = [];

  for (const file of files) {
    const text = safeRead(file);
    if (!text) continue;
    const found = findSecretHits(text, 3);
    if (found.length > 0) {
      hits.push({ file, kind: found.map((h) => h.id).join("+") });
    }
  }

  if (hits.length === 0) {
    return [
      result({
        id: "secrets-clean",
        title: "Secret scan",
        category: "secrets",
        severity: "ok",
        message: `No obvious secrets in ${files.length} agent/config file(s)`,
      }),
    ];
  }

  return [
    result({
      id: "secrets-found",
      title: "Secret scan",
      category: "secrets",
      severity: "error",
      message: `Possible secret material in ${hits.length} file(s)`,
      detail: hits.map((h) => `${h.kind}: ${h.file}`).join("\n"),
      fix: "Remove keys from rules/MCP configs; use env vars instead, then rotate any exposed credentials",
    }),
  ];
}

/** Real-looking secrets in .env.example (often committed). */
export function checkEnvExampleSafety(cwd: string): CheckResult[] {
  const path = join(cwd, ".env.example");
  if (!existsSync(path)) return [];
  const text = safeRead(path);
  if (!text) return [];
  const hits = findSecretHits(text, 5);
  if (hits.length === 0) {
    return [
      result({
        id: "env-example-clean",
        title: "Secrets: .env.example",
        category: "secrets",
        severity: "ok",
        message: ".env.example has no obvious live secrets",
      }),
    ];
  }
  return [
    result({
      id: "env-example-secrets",
      title: "Secrets: .env.example",
      category: "secrets",
      severity: "error",
      message: `.env.example may contain live secret material (${hits.map((h) => h.id).join(", ")})`,
      detail: path,
      fix: "Replace with placeholders (e.g. YOUR_API_KEY); never commit real keys in examples",
    }),
  ];
}

/** Empty rules, contradictions, legacy .cursorrules, ignore-file hygiene. */
export function checkRuleQuality(cwd: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Legacy .cursorrules
  const cursorrules = join(cwd, ".cursorrules");
  if (existsSync(cursorrules)) {
    results.push(
      result({
        id: "rules-legacy-cursorrules",
        title: "Legacy .cursorrules",
        category: "agents",
        severity: "info",
        message: ".cursorrules is legacy — prefer .cursor/rules or AGENTS.md",
        detail: cursorrules,
        fix: "Migrate to .cursor/rules/*.mdc and keep a short AGENTS.md source of truth",
      }),
    );
  }

  // Empty / whitespace-only rule files
  const ruleRoots = [
    join(cwd, ".cursor", "rules"),
    join(cwd, ".windsurf", "rules"),
    join(cwd, ".continue", "rules"),
    join(cwd, ".claude"),
  ];
  const emptyFiles: string[] = [];
  const texts: string[] = [];
  for (const root of ruleRoots) {
    if (!existsSync(root)) continue;
    for (const f of listFilesRecursive(root, 80)) {
      if (!/\.(md|mdc|txt)$/i.test(f)) continue;
      const t = safeRead(f);
      if (t === null) continue;
      if (t.trim().length < 15) emptyFiles.push(f);
      else texts.push(t);
    }
  }
  for (const name of ["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules"]) {
    const p = join(cwd, name);
    const t = safeRead(p);
    if (t && t.trim().length >= 15) texts.push(t);
    if (t !== null && t.trim().length > 0 && t.trim().length < 15) emptyFiles.push(p);
  }

  if (emptyFiles.length > 0) {
    results.push(
      result({
        id: "rules-empty-files",
        title: "Empty rules",
        category: "agents",
        severity: "warn",
        message: `${emptyFiles.length} rule/instruction file(s) are empty or nearly empty`,
        detail: emptyFiles.slice(0, 12).join("\n"),
        fix: "Delete empty stubs or add real high-signal instructions",
      }),
    );
  }

  // Contradictions across combined instruction text
  const combined = texts.join("\n\n");
  if (combined.length > 40) {
    const conflicts = findInstructionContradictions(combined);
    if (conflicts.length > 0) {
      results.push(
        result({
          id: "rules-contradiction",
          title: "Rule contradictions",
          category: "agents",
          severity: "warn",
          message: `${conflicts.length} always/never contradiction(s) in instructions`,
          detail: conflicts.slice(0, 8).join("\n"),
          fix: "Resolve conflicting package-manager / tool preferences into one policy",
        }),
      );
    } else {
      results.push(
        result({
          id: "rules-coherent",
          title: "Rule coherence",
          category: "agents",
          severity: "ok",
          message: "No obvious always/never contradictions in instructions",
        }),
      );
    }
  }

  // Ignore files for agent noise (large trees)
  const hasCursorIgnore = existsSync(join(cwd, ".cursorignore"));
  const hasAiIgnore = existsSync(join(cwd, ".aiignore")) || existsSync(join(cwd, ".aiderignore"));
  const hasNodeModules = existsSync(join(cwd, "node_modules"));
  const hasDist = existsSync(join(cwd, "dist")) || existsSync(join(cwd, "build"));
  if ((hasNodeModules || hasDist) && !hasCursorIgnore && !hasAiIgnore) {
    results.push(
      result({
        id: "ignore-missing",
        title: "Agent ignore file",
        category: "hygiene",
        severity: "info",
        message: "Large build dirs present but no .cursorignore / .aiignore",
        fix: "Add .cursorignore with node_modules, dist, coverage, .git to reduce agent noise",
      }),
    );
  } else if (hasCursorIgnore || hasAiIgnore) {
    results.push(
      result({
        id: "ignore-present",
        title: "Agent ignore file",
        category: "hygiene",
        severity: "ok",
        message: hasCursorIgnore ? ".cursorignore present" : "AI ignore file present",
      }),
    );
  }

  // Broken .mdc frontmatter (--- without closing ---)
  for (const root of [join(cwd, ".cursor", "rules")]) {
    if (!existsSync(root)) continue;
    for (const f of listFilesRecursive(root, 40)) {
      if (!f.endsWith(".mdc")) continue;
      const t = safeRead(f);
      if (!t || !t.startsWith("---")) continue;
      const second = t.indexOf("\n---", 3);
      if (second < 0) {
        results.push(
          result({
            id: `rules-mdc-frontmatter-${basename(f)}`,
            title: "MDC frontmatter",
            category: "agents",
            severity: "warn",
            message: `Unclosed YAML frontmatter in ${basename(f)}`,
            detail: f,
            fix: "Close frontmatter with a second --- line (Cursor .mdc rules)",
          }),
        );
      }
    }
  }

  return results;
}

/** Placeholder / unfinished config detection. */
export function checkPlaceholders(cwd: string): CheckResult[] {
  const files = collectScanFiles(cwd);
  const hits: { file: string; kind: string }[] = [];

  for (const file of files) {
    const text = safeRead(file);
    if (!text) continue;
    for (const p of PLACEHOLDER_PATTERNS) {
      if (p.re.test(text)) {
        hits.push({ file, kind: p.id });
        break;
      }
    }
  }

  if (hits.length === 0) {
    return [
      result({
        id: "placeholders-clean",
        title: "Placeholders",
        category: "hygiene",
        severity: "ok",
        message: "No obvious unfinished placeholders in agent/config files",
      }),
    ];
  }

  return [
    result({
      id: "placeholders-found",
      title: "Placeholders",
      category: "hygiene",
      severity: "warn",
      message: `Unfinished placeholders in ${hits.length} file(s)`,
      detail: hits.map((h) => `${h.kind}: ${h.file}`).join("\n"),
      fix: "Replace CHANGE_ME / your-api-key style tokens with real config or remove them",
    }),
  ];
}

/** Project hygiene that affects AI quality. */
export function checkProjectHygiene(cwd: string): CheckResult[] {
  const results: CheckResult[] = [];
  const readme = ["README.md", "readme.md", "Readme.md"]
    .map((n) => join(cwd, n))
    .find(existsSync);
  const git = isGitWorkTree(cwd);
  const pkgPath = join(cwd, "package.json");
  const pkg = existsSync(pkgPath);

  results.push(
    result({
      id: "git",
      title: "Git repo",
      category: "hygiene",
      severity: git ? "ok" : "info",
      message: git
        ? "Git repository detected"
        : "Not a git repo (agents still work, history features won't)",
    }),
  );

  if (readme) {
    const body = safeRead(readme) || "";
    results.push(
      result({
        id: "readme",
        title: "README",
        category: "hygiene",
        severity: body.trim().length > 40 ? "ok" : "warn",
        message:
          body.trim().length > 40
            ? "README present"
            : "README is very short — agents get less project context",
        fix:
          body.trim().length > 40
            ? undefined
            : "Add a short project overview for better agent answers",
      }),
    );
  } else {
    results.push(
      result({
        id: "readme-missing",
        title: "README",
        category: "hygiene",
        severity: "warn",
        message: "No README — agents have less default context about the project",
        fix: "Add a README.md with what the project does and how to run it",
      }),
    );
  }

  if (pkg) {
    results.push(
      result({
        id: "package-json",
        title: "package.json",
        category: "hygiene",
        severity: "ok",
        message: "Node project manifest found",
      }),
    );

    const raw = safeRead(pkgPath);
    if (raw) {
      try {
        const json = JSON.parse(raw) as {
          engines?: { node?: string };
          scripts?: Record<string, string>;
        };
        const enginesNode = json.engines?.node;
        if (enginesNode) {
          const major = Number(process.versions.node.split(".")[0]);
          const minMatch = enginesNode.match(/>=\s*(\d+)/) || enginesNode.match(/\^(\d+)/);
          if (minMatch) {
            const need = Number(minMatch[1]);
            if (major < need) {
              results.push(
                result({
                  id: "engines-node-mismatch",
                  title: "engines.node",
                  category: "runtime",
                  severity: "error",
                  message: `package.json requires Node ${enginesNode}, running ${process.versions.node}`,
                  fix: "Upgrade Node or adjust engines field",
                }),
              );
            }
          }
        }
      } catch {
        results.push(
          result({
            id: "package-json-invalid",
            title: "package.json",
            category: "hygiene",
            severity: "error",
            message: "package.json is not valid JSON",
            fix: "Fix JSON syntax in package.json",
          }),
        );
      }
    }
  }

  // Huge rules + single-file bloat
  const ruleDirs = [
    join(cwd, ".cursor", "rules"),
    join(cwd, ".windsurf", "rules"),
    join(cwd, ".continue", "rules"),
    join(cwd, ".claude"),
  ];
  for (const dir of ruleDirs) {
    if (!dirHasFiles(dir)) continue;
    const files = listFilesRecursive(dir, 100);
    let total = 0;
    for (const f of files) {
      const t = safeRead(f);
      if (t) {
        total += t.length;
        if (t.length > 40_000) {
          results.push(
            result({
              id: `rules-file-bloat-${basename(f)}`,
              title: "Rules file size",
              category: "hygiene",
              severity: "warn",
              message: `Oversized rule file (~${Math.round(t.length / 1000)}KB): ${basename(f)}`,
              detail: f,
              fix: "Split or trim; huge single files burn agent context",
            }),
          );
        }
      }
    }
    if (total > 80_000) {
      results.push(
        result({
          id: `rules-bloat-${basename(dir)}`,
          title: "Rules size",
          category: "hygiene",
          severity: "warn",
          message: `Large rules under ${dir} (~${Math.round(total / 1000)}KB) may waste context`,
          fix: "Trim rarely used rules; prefer short, high-signal instructions",
        }),
      );
    }
  }

  // Root instruction files bloat
  for (const name of ["AGENTS.md", "CLAUDE.md", "GEMINI.md"]) {
    const p = join(cwd, name);
    const t = safeRead(p);
    if (t && t.length > 40_000) {
      results.push(
        result({
          id: `rules-root-bloat-${name}`,
          title: "Instruction size",
          category: "hygiene",
          severity: "warn",
          message: `${name} is large (~${Math.round(t.length / 1000)}KB)`,
          fix: "Keep root instruction files short; move rare rules into optional files",
        }),
      );
    }
  }

  return results;
}
