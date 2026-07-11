import { basename } from "node:path";
import type {
  Category,
  Finding,
  ScanOptions,
  ScanReport,
  Severity,
  SeverityCounts,
} from "./types.js";
import { ALL_CATEGORIES, SEVERITY_ORDER } from "./types.js";
import {
  TEXT_RULES,
  OBFUSCATION_RULES,
  findUnicodeHits,
  findSecretHits,
  looksLikeHardcodedSecret,
  isUnpinnedPackageArg,
} from "./rules.js";
import { safeRead, walkFiles, isScannableFile, displayPath } from "./fs-utils.js";
import { skillRoots, ruleFiles, mcpConfigPaths, hookConfigPaths } from "./locations.js";

const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 25,
  high: 10,
  medium: 4,
  low: 1,
};

function trimSnippet(line: string): string {
  const s = line.trim();
  return s.length > 120 ? s.slice(0, 117) + "…" : s;
}

/** Apply line rules + unicode + obfuscation to one text blob. One finding per rule per file. */
function scanTextContent(
  file: string,
  text: string,
  category: Category,
  findings: Finding[],
  opts: { obfuscation?: boolean; secrets?: boolean } = {},
): void {
  const seen = new Set<string>();
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    for (const rule of TEXT_RULES) {
      if (seen.has(rule.id)) continue;
      if (rule.re.test(line)) {
        seen.add(rule.id);
        findings.push({
          id: rule.id,
          category,
          severity: rule.severity,
          title: rule.title,
          file,
          line: i + 1,
          snippet: trimSnippet(line),
          message: rule.title,
          fix: rule.fix,
        });
      }
    }
    if (opts.secrets !== false && !seen.has("secrets/embedded-secret")) {
      const hits = findSecretHits(line, 1);
      if (hits.length > 0) {
        seen.add("secrets/embedded-secret");
        findings.push({
          id: "secrets/embedded-secret",
          category,
          severity: "high",
          title: "Embedded credential",
          file,
          line: i + 1,
          snippet: `${hits[0]!.id}: ${hits[0]!.masked}`,
          message: `Live-looking ${hits[0]!.id} credential embedded in agent-readable content`,
          fix: "Move to an env var reference and rotate the credential",
        });
      }
    }
  }

  if (opts.obfuscation !== false) {
    for (const rule of OBFUSCATION_RULES) {
      if (seen.has(rule.id)) continue;
      const idx = lines.findIndex((l) => rule.re.test(l));
      if (idx >= 0) {
        seen.add(rule.id);
        findings.push({
          id: rule.id,
          category,
          severity: rule.severity,
          title: rule.title,
          file,
          line: idx + 1,
          snippet: trimSnippet(lines[idx]!),
          message: rule.title,
          fix: rule.fix,
        });
      }
    }
  }

  for (const hit of findUnicodeHits(text)) {
    if (seen.has(hit.id)) continue;
    seen.add(hit.id);
    findings.push({
      id: hit.id,
      category,
      severity: hit.severity,
      title: hit.title,
      file,
      line: hit.line,
      message: hit.message,
      fix: "Strip the characters and diff what a human sees vs what the model reads",
    });
  }
}

function scanSkills(cwd: string, includeUser: boolean, maxFiles: number, findings: Finding[]): number {
  let scanned = 0;
  for (const root of skillRoots(cwd, includeUser)) {
    for (const file of walkFiles(root, maxFiles)) {
      const name = basename(file).toLowerCase();
      if (name === "package.json") {
        const raw = safeRead(file);
        scanned++;
        if (!raw) continue;
        try {
          const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
          for (const hook of ["preinstall", "install", "postinstall"]) {
            const script = pkg.scripts?.[hook];
            if (script) {
              findings.push({
                id: "supply-chain/install-hook",
                category: "skills",
                severity: "high",
                title: "npm install hook in skill",
                file: displayPath(cwd, file),
                snippet: trimSnippet(`${hook}: ${script}`),
                message: `Skill package runs code at install time via ${hook}`,
                fix: "Install hooks in skills execute before any review — remove or vendor",
              });
              // Also scan the hook command itself
              scanTextContent(displayPath(cwd, file), script, "skills", findings);
            }
          }
        } catch {
          /* unparseable package.json — ignore */
        }
        continue;
      }
      if (!isScannableFile(file)) continue;
      const text = safeRead(file);
      if (text === null) continue;
      scanned++;
      scanTextContent(displayPath(cwd, file), text, "skills", findings);
    }
  }
  return scanned;
}

function scanRules(cwd: string, findings: Finding[]): number {
  let scanned = 0;
  for (const file of ruleFiles(cwd)) {
    const text = safeRead(file);
    if (text === null) continue;
    scanned++;
    scanTextContent(displayPath(cwd, file), text, "rules", findings);
  }
  return scanned;
}

interface McpServer {
  command?: unknown;
  args?: unknown;
  env?: unknown;
  url?: unknown;
}

function extractServers(config: unknown): Record<string, McpServer> {
  if (typeof config !== "object" || config === null) return {};
  const c = config as Record<string, unknown>;
  const out: Record<string, McpServer> = {};
  const containers = [c.mcpServers, c.servers];
  // Claude Code ~/.claude.json nests per-project mcpServers
  if (typeof c.projects === "object" && c.projects !== null) {
    for (const proj of Object.values(c.projects as Record<string, unknown>)) {
      if (typeof proj === "object" && proj !== null) {
        containers.push((proj as Record<string, unknown>).mcpServers);
      }
    }
  }
  for (const container of containers) {
    if (typeof container !== "object" || container === null) continue;
    for (const [name, server] of Object.entries(container as Record<string, unknown>)) {
      if (typeof server === "object" && server !== null) out[name] = server as McpServer;
    }
  }
  return out;
}

const RUNNERS = new Set(["npx", "uvx", "bunx", "pipx"]);

function scanMcp(cwd: string, includeUser: boolean, findings: Finding[]): number {
  let scanned = 0;
  for (const path of mcpConfigPaths(cwd, includeUser)) {
    const raw = safeRead(path, 2_000_000);
    if (raw === null) continue;
    scanned++;
    const file = displayPath(cwd, path);
    let config: unknown;
    try {
      config = JSON.parse(raw);
    } catch {
      // Broken JSON is setup-doctor's beat; here it just means nothing to scan.
      continue;
    }
    const servers = extractServers(config);
    for (const [name, server] of Object.entries(servers)) {
      // 1. Hardcoded secrets in env blocks
      if (typeof server.env === "object" && server.env !== null) {
        for (const [key, value] of Object.entries(server.env as Record<string, unknown>)) {
          if (typeof value === "string" && looksLikeHardcodedSecret(value)) {
            findings.push({
              id: "mcp/hardcoded-secret",
              category: "mcp",
              severity: "critical",
              title: "Hardcoded secret in MCP env",
              file,
              snippet: `${name} → env.${key}: ${value.slice(0, 6)}…`,
              message: `MCP server "${name}" has a live-looking credential in env.${key}`,
              fix: "Use a ${ENV_VAR} reference and rotate the credential",
            });
          }
        }
      }

      // 2. Command string threats + unpinned runner packages
      const args = Array.isArray(server.args) ? server.args.filter((a): a is string => typeof a === "string") : [];
      const command = typeof server.command === "string" ? server.command : "";
      if (command) {
        const full = [command, ...args].join(" ");
        scanTextContent(file, full, "mcp", findings, { obfuscation: false, secrets: false });
        if (RUNNERS.has(basename(command))) {
          const pkgArg = args.find((a) => !a.startsWith("-"));
          if (pkgArg && isUnpinnedPackageArg(pkgArg)) {
            findings.push({
              id: "mcp/unpinned-package",
              category: "mcp",
              severity: "low",
              title: "Unpinned MCP server package",
              file,
              snippet: `${name} → ${command} ${pkgArg}`,
              message: `"${name}" runs ${pkgArg} without a version pin — silent supply-chain updates`,
              fix: `Pin it: ${command} ${pkgArg}@<version>`,
            });
          }
        }
      }

      // 3. Non-TLS remote URLs
      if (typeof server.url === "string" && /^http:\/\//i.test(server.url)) {
        if (!/^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(server.url)) {
          findings.push({
            id: "mcp/insecure-url",
            category: "mcp",
            severity: "medium",
            title: "MCP server over plain HTTP",
            file,
            snippet: `${name} → ${server.url}`,
            message: `"${name}" talks to a remote MCP server without TLS`,
            fix: "Use https:// — plain HTTP exposes tool traffic and tokens",
          });
        }
      }
    }
  }
  return scanned;
}

/** Collect every "command" string in a hooks config, recursively. */
function collectHookCommands(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectHookCommands(item, out);
    return;
  }
  if (typeof node !== "object" || node === null) return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "command" && typeof value === "string") out.push(value);
    else collectHookCommands(value, out);
  }
}

function scanHooks(cwd: string, includeUser: boolean, findings: Finding[]): number {
  let scanned = 0;
  for (const path of hookConfigPaths(cwd, includeUser)) {
    const raw = safeRead(path);
    if (raw === null) continue;
    scanned++;
    const file = displayPath(cwd, path);
    let config: unknown;
    try {
      config = JSON.parse(raw);
    } catch {
      continue;
    }
    const hooks = (config as Record<string, unknown>).hooks;
    if (!hooks) continue;
    const commands: string[] = [];
    collectHookCommands(hooks, commands);
    for (const cmd of commands) {
      scanTextContent(file, cmd, "hooks", findings, { obfuscation: false });
    }
  }
  return scanned;
}

function emptyCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0 };
}

export function scan(options: ScanOptions = {}): ScanReport {
  const cwd = options.cwd ?? process.cwd();
  const includeUser = options.includeUser ?? true;
  const maxFiles = options.maxFiles ?? 400;

  const active = new Set<Category>(options.only ?? ALL_CATEGORIES);
  for (const s of options.skip ?? []) active.delete(s);

  const findings: Finding[] = [];
  let filesScanned = 0;

  if (active.has("skills")) filesScanned += scanSkills(cwd, includeUser, maxFiles, findings);
  if (active.has("rules")) filesScanned += scanRules(cwd, findings);
  if (active.has("mcp")) filesScanned += scanMcp(cwd, includeUser, findings);
  if (active.has("hooks")) filesScanned += scanHooks(cwd, includeUser, findings);

  findings.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
      a.file.localeCompare(b.file) ||
      (a.line ?? 0) - (b.line ?? 0),
  );

  const counts = emptyCounts();
  const byCategory = Object.fromEntries(
    ALL_CATEGORIES.map((c) => [c, emptyCounts()]),
  ) as Record<Category, SeverityCounts>;
  for (const f of findings) {
    counts[f.severity]++;
    byCategory[f.category][f.severity]++;
  }

  const penalty =
    counts.critical * SEVERITY_PENALTY.critical +
    counts.high * SEVERITY_PENALTY.high +
    counts.medium * SEVERITY_PENALTY.medium +
    counts.low * SEVERITY_PENALTY.low;
  const score = Math.max(0, 100 - penalty);

  return {
    cwd,
    scannedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    filesScanned,
    findings,
    summary: { ...counts, score, byCategory },
  };
}

export function worstSeverity(report: ScanReport): Severity | "none" {
  for (const s of SEVERITY_ORDER) {
    if (report.summary[s] > 0) return s;
  }
  return "none";
}
