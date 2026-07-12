import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import type { UsageEvent } from "./types.js";

/**
 * Parse Claude Code transcript JSONL text into usage events. Each assistant
 * line carries message.usage {input_tokens, output_tokens, cache_*} and
 * message.model. Unknown/malformed lines are skipped — never throws.
 */
export function parseClaudeCodeJsonl(text: string, project?: string): UsageEvent[] {
  const out: UsageEvent[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let obj: unknown;
    try {
      obj = JSON.parse(t);
    } catch {
      continue;
    }
    if (typeof obj !== "object" || obj === null) continue;
    const rec = obj as Record<string, unknown>;
    const msg = rec.message as Record<string, unknown> | undefined;
    if (!msg || typeof msg !== "object") continue;
    const usage = msg.usage as Record<string, unknown> | undefined;
    if (!usage || typeof usage !== "object") continue;
    const inputTokens = Number(usage.input_tokens ?? 0);
    const outputTokens = Number(usage.output_tokens ?? 0);
    if (!Number.isFinite(inputTokens) || !Number.isFinite(outputTokens)) continue;
    if (inputTokens === 0 && outputTokens === 0) continue;
    out.push({
      ts: typeof rec.timestamp === "string" ? rec.timestamp : new Date(0).toISOString(),
      model: typeof msg.model === "string" ? msg.model : "unknown",
      inputTokens,
      outputTokens,
      cacheReadTokens: Number(usage.cache_read_input_tokens ?? 0) || 0,
      cacheWriteTokens: Number(usage.cache_creation_input_tokens ?? 0) || 0,
      project,
      source: "claude-code",
    });
  }
  return out;
}

/**
 * Parse a generic usage-events JSON file: an array of
 * { ts, model, inputTokens, outputTokens, project?, source? }.
 * Lets any agent/proxy feed the guard.
 */
export function parseGenericEvents(text: string): UsageEvent[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: UsageEvent[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    const inputTokens = Number(r.inputTokens ?? r.input_tokens ?? 0);
    const outputTokens = Number(r.outputTokens ?? r.output_tokens ?? 0);
    if (!Number.isFinite(inputTokens) || !Number.isFinite(outputTokens)) continue;
    out.push({
      ts: typeof r.ts === "string" ? r.ts : new Date(0).toISOString(),
      model: typeof r.model === "string" ? r.model : "unknown",
      inputTokens,
      outputTokens,
      cacheReadTokens: Number(r.cacheReadTokens ?? 0) || 0,
      cacheWriteTokens: Number(r.cacheWriteTokens ?? 0) || 0,
      project: typeof r.project === "string" ? r.project : undefined,
      source: typeof r.source === "string" ? r.source : "generic",
    });
  }
  return out;
}

/** Decode Claude Code's project-dir naming (-Users-x-repo → /Users/x/repo). */
function projectNameFromDir(dir: string): string {
  const b = basename(dir);
  return b.startsWith("-") ? b.slice(1).replace(/-/g, "/") : b;
}

/**
 * Collect usage events from Claude Code transcripts under
 * ~/.claude/projects/<project>/<session>.jsonl. Read-only; caps files per
 * project to stay fast.
 */
export function collectClaudeCodeUsage(maxFilesPerProject = 20): UsageEvent[] {
  const root = join(homedir(), ".claude", "projects");
  if (!existsSync(root)) return [];
  const out: UsageEvent[] = [];
  let projects: string[];
  try {
    projects = readdirSync(root);
  } catch {
    return [];
  }
  for (const proj of projects) {
    const dir = join(root, proj);
    let files: string[];
    try {
      if (!statSync(dir).isDirectory()) continue;
      files = readdirSync(dir).filter((f) => f.endsWith(".jsonl")).slice(0, maxFilesPerProject);
    } catch {
      continue;
    }
    const project = projectNameFromDir(dir);
    for (const f of files) {
      try {
        const text = readFileSync(join(dir, f), "utf8");
        out.push(...parseClaudeCodeJsonl(text, project));
      } catch {
        /* skip unreadable */
      }
    }
  }
  return out;
}
