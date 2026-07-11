import { relative, resolve } from "node:path";
import { join } from "node:path";
import type { Finding, ScanOptions, ScanReport } from "./types.js";
import { collectAgentFiles, collectMcpConfigPaths } from "./paths.js";
import {
  findSecretHits,
  looksLikeHardcodedSecret,
  lineColAt,
  redact,
} from "./patterns.js";
import { gitTrackedFiles, isGitWorkTree, safeRead, tryParseJson } from "./fs.js";

export function scan(cwdOrOptions?: string | ScanOptions, maybe?: ScanOptions): ScanReport {
  const options: ScanOptions =
    typeof cwdOrOptions === "string"
      ? { ...(maybe ?? {}), cwd: cwdOrOptions }
      : (cwdOrOptions ?? {});

  const cwd = resolve(options.cwd ?? process.cwd());
  const maxFiles = options.maxFiles ?? 400;
  const maxBytes = options.maxBytes ?? 200_000;
  const includeUser = options.includeUser ?? false;

  const findings: Finding[] = [];
  let filesScanned = 0;
  const seen = new Set<string>();

  const agentFiles = collectAgentFiles(cwd, maxFiles);
  for (const abs of agentFiles) {
    if (seen.has(abs)) continue;
    seen.add(abs);
    const text = safeRead(abs, maxBytes);
    if (text == null) continue;
    filesScanned++;
    const kind = isEnvExamplePath(abs) ? "env-example" : "agent-file";
    findings.push(...findingsInText(cwd, abs, text, kind));
  }

  // Ensure .env.example family is covered even if path helpers miss it
  for (const name of [".env.example", ".env.sample", ".env.template"]) {
    const abs = join(cwd, name);
    if (seen.has(abs)) continue;
    const text = safeRead(abs, maxBytes);
    if (text == null) continue;
    seen.add(abs);
    filesScanned++;
    findings.push(...findingsInText(cwd, abs, text, "env-example"));
  }

  for (const abs of collectMcpConfigPaths(cwd, includeUser)) {
    if (seen.has(abs)) continue;
    seen.add(abs);
    const text = safeRead(abs, maxBytes);
    if (text == null) continue;
    filesScanned++;
    findings.push(...scanMcpConfig(cwd, abs, text));
    // Also pattern-scan raw file
    findings.push(...findingsInText(cwd, abs, text, "agent-file"));
  }

  // Git-tracked classic secret files (AI workflows still commit these by mistake)
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
    ]);
    for (const rel of tracked) {
      // skip examples
      if (/\.example$|\.sample$|\.template$/i.test(rel)) continue;
      const abs = join(cwd, rel);
      if (seen.has(abs)) continue;
      seen.add(abs);
      const text = safeRead(abs, maxBytes);
      if (text == null) continue;
      filesScanned++;
      const hits = findSecretHits(text, 5);
      if (hits.length === 0 && !/\.env/i.test(rel)) continue;
      findings.push({
        id: `tracked:${rel}`,
        kind: "tracked-secret-file",
        severity: "error",
        file: rel,
        pattern: hits[0]?.id ?? "tracked-file",
        message: `Secret-prone file is tracked by git: ${rel}`,
        snippet: hits[0] ? redact(hits[0].match) : "(file tracked)",
        fix: "Remove from git history and add to .gitignore; rotate any exposed credentials",
      });
    }
  }

  const error = findings.filter((f) => f.severity === "error").length;
  const warn = findings.filter((f) => f.severity === "warn").length;
  const info = findings.filter((f) => f.severity === "info").length;

  return {
    cwd,
    scannedAt: new Date().toISOString(),
    filesScanned,
    findings: sortFindings(findings),
    summary: {
      error,
      warn,
      info,
      ok: error === 0 && warn === 0,
    },
  };
}

function findingsInText(
  cwd: string,
  abs: string,
  text: string,
  kind: Finding["kind"],
): Finding[] {
  const rel = relPath(cwd, abs);
  const hits = findSecretHits(text, 10);
  const out: Finding[] = [];
  for (const h of hits) {
    const { line, column } = lineColAt(text, h.index);
    out.push({
      id: `${kind}:${rel}:${h.id}:${line}`,
      kind,
      severity: kind === "env-example" ? "warn" : "error",
      file: rel,
      line,
      column,
      pattern: h.id,
      message: `Possible ${h.id} secret in ${rel}${line ? `:${line}` : ""}`,
      snippet: redact(h.match),
      fix:
        kind === "env-example"
          ? "Use placeholders only in .env.example (e.g. your-api-key); never real credentials"
          : "Remove the secret; use env vars / a secret manager; rotate the exposed credential",
    });
  }
  return out;
}

function scanMcpConfig(cwd: string, abs: string, text: string): Finding[] {
  const rel = relPath(cwd, abs);
  const data = tryParseJson(text);
  if (!data || typeof data !== "object") return [];

  const findings: Finding[] = [];
  const servers = extractServers(data as Record<string, unknown>);

  for (const [name, cfg] of Object.entries(servers)) {
    if (!cfg || typeof cfg !== "object") continue;
    const c = cfg as Record<string, unknown>;
    const env = (c.env ?? c.environment) as Record<string, unknown> | undefined;
    if (env && typeof env === "object") {
      for (const [k, v] of Object.entries(env)) {
        if (typeof v !== "string") continue;
        if (looksLikeHardcodedSecret(v)) {
          findings.push({
            id: `mcp-env:${rel}:${name}:${k}`,
            kind: "mcp-env",
            severity: "error",
            file: rel,
            pattern: findSecretHits(v, 1)[0]?.id ?? "hardcoded-env",
            message: `Hardcoded secret-like env "${k}" on MCP server "${name}"`,
            snippet: redact(v),
            fix: "Move to shell env / secret manager; reference ${VAR} if the client supports it",
          });
        }
      }
    }
    const args = c.args;
    if (Array.isArray(args)) {
      for (const a of args) {
        if (typeof a !== "string") continue;
        const hits = findSecretHits(a, 1);
        if (hits.length) {
          findings.push({
            id: `mcp-arg:${rel}:${name}:${hits[0]!.id}`,
            kind: "mcp-arg",
            severity: "error",
            file: rel,
            pattern: hits[0]!.id,
            message: `Possible secret in MCP args for "${name}" (${hits[0]!.id})`,
            snippet: redact(hits[0]!.match),
            fix: "Do not put API keys in command args; use env references",
          });
        }
      }
    }
  }
  return findings;
}

function extractServers(data: Record<string, unknown>): Record<string, unknown> {
  if (data.mcpServers && typeof data.mcpServers === "object") {
    return data.mcpServers as Record<string, unknown>;
  }
  // VS Code style: { servers: { … } }
  if (data.servers && typeof data.servers === "object") {
    return data.servers as Record<string, unknown>;
  }
  // Gemini settings may nest
  if (data.mcp && typeof data.mcp === "object") {
    const m = data.mcp as Record<string, unknown>;
    if (m.servers && typeof m.servers === "object") {
      return m.servers as Record<string, unknown>;
    }
  }
  return {};
}

function isEnvExamplePath(abs: string): boolean {
  const base = abs.split(/[/\\]/).pop()?.toLowerCase() ?? "";
  return (
    base === ".env.example" ||
    base === ".env.sample" ||
    base === ".env.template" ||
    /^\.env\..*\.(example|sample|template)$/i.test(base)
  );
}

function relPath(cwd: string, abs: string): string {
  const r = relative(cwd, abs);
  return r && !r.startsWith("..") ? r : abs;
}

function sortFindings(findings: Finding[]): Finding[] {
  const rank = { error: 0, warn: 1, info: 2, ok: 3 };
  return [...findings].sort((a, b) => {
    const s = rank[a.severity] - rank[b.severity];
    if (s !== 0) return s;
    return a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0);
  });
}

export function worstSeverity(report: ScanReport): "ok" | "info" | "warn" | "error" {
  if (report.summary.error > 0) return "error";
  if (report.summary.warn > 0) return "warn";
  if (report.summary.info > 0) return "info";
  return "ok";
}
