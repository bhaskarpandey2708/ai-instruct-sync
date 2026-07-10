import type {
  Category,
  CategorySummary,
  CheckResult,
  DoctorOptions,
  DoctorReport,
  Severity,
} from "./types.js";
import { ALL_CATEGORIES } from "./types.js";
import {
  checkAgents,
  checkEnvExampleSafety,
  checkEnvSafety,
  checkMcp,
  checkPlaceholders,
  checkProjectHygiene,
  checkRuleQuality,
  checkRuntime,
  checkSecretLeaks,
} from "./checks.js";

const WEIGHT: Record<Severity, number> = {
  ok: 0,
  info: 0,
  warn: 8,
  error: 25,
};

/** Cap penalty per category so one broken MCP file with many servers doesn't zero the score alone. */
const CATEGORY_CAP: Record<Category, number> = {
  runtime: 40,
  agents: 40,
  mcp: 50,
  secrets: 55,
  hygiene: 32,
};

const SEVERITY_RANK: Record<Severity, number> = {
  error: 0,
  warn: 1,
  info: 2,
  ok: 3,
};

function resolveCategories(options: DoctorOptions): Set<Category> {
  let cats = new Set<Category>(ALL_CATEGORIES);
  if (options.only && options.only.length > 0) {
    cats = new Set(options.only);
  }
  if (options.skip && options.skip.length > 0) {
    for (const s of options.skip) cats.delete(s);
  }
  return cats;
}

function emptyCategorySummary(): CategorySummary {
  return { ok: 0, info: 0, warn: 0, error: 0, penalty: 0 };
}

export function sortChecks(checks: CheckResult[]): CheckResult[] {
  return [...checks].sort((a, b) => {
    const sr = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sr !== 0) return sr;
    return a.category.localeCompare(b.category) || a.id.localeCompare(b.id);
  });
}

export function computeScore(checks: CheckResult[]): {
  score: number;
  byCategory: Record<Category, CategorySummary>;
  totalPenalty: number;
} {
  const byCategory = Object.fromEntries(
    ALL_CATEGORIES.map((c) => [c, emptyCategorySummary()]),
  ) as Record<Category, CategorySummary>;

  for (const c of checks) {
    const bucket = byCategory[c.category] ?? emptyCategorySummary();
    bucket[c.severity] += 1;
    bucket.penalty += WEIGHT[c.severity];
    byCategory[c.category] = bucket;
  }

  let totalPenalty = 0;
  for (const cat of ALL_CATEGORIES) {
    const raw = byCategory[cat].penalty;
    const capped = Math.min(raw, CATEGORY_CAP[cat]);
    byCategory[cat].penalty = capped;
    totalPenalty += capped;
  }

  const score = Math.max(0, Math.min(100, 100 - totalPenalty));
  return { score, byCategory, totalPenalty };
}

export function runChecks(
  cwdOrOptions: string | DoctorOptions = process.cwd(),
  maybeOptions?: DoctorOptions,
): DoctorReport {
  const options: DoctorOptions =
    typeof cwdOrOptions === "string"
      ? { ...maybeOptions, cwd: cwdOrOptions }
      : { ...cwdOrOptions };

  const cwd = options.cwd ?? process.cwd();
  const active = resolveCategories(options);

  const all: CheckResult[] = [];
  if (active.has("runtime")) all.push(...checkRuntime());
  if (active.has("agents")) {
    all.push(...checkAgents(cwd));
    all.push(...checkRuleQuality(cwd));
  }
  if (active.has("mcp")) all.push(...checkMcp(cwd, options));
  if (active.has("secrets")) {
    all.push(...checkEnvSafety(cwd));
    all.push(...checkEnvExampleSafety(cwd));
    all.push(...checkSecretLeaks(cwd));
  }
  if (active.has("hygiene")) {
    all.push(...checkPlaceholders(cwd));
    all.push(...checkProjectHygiene(cwd));
  }

  const checks = sortChecks(
    all.filter((c) => {
      if (active.has(c.category)) return true;
      // MCP server secret findings use category "secrets" but were produced by checkMcp
      if (c.category === "secrets" && active.has("mcp") && c.id.includes("mcp-")) {
        return true;
      }
      // rule quality ignore file is hygiene under agents run
      if (c.category === "hygiene" && active.has("agents") && c.id.startsWith("ignore-")) {
        return true;
      }
      return false;
    }),
  );

  const { score, byCategory } = computeScore(checks);

  const summary = {
    ok: checks.filter((c) => c.severity === "ok").length,
    info: checks.filter((c) => c.severity === "info").length,
    warn: checks.filter((c) => c.severity === "warn").length,
    error: checks.filter((c) => c.severity === "error").length,
    score,
    byCategory,
  };

  return {
    cwd,
    checkedAt: new Date().toISOString(),
    node: process.versions.node,
    platform: `${process.platform} ${process.arch}`,
    checks,
    summary,
  };
}

export function severityScore(report: DoctorReport): number {
  return report.summary.score;
}

export function worstSeverity(report: DoctorReport): Severity {
  if (report.summary.error > 0) return "error";
  if (report.summary.warn > 0) return "warn";
  if (report.summary.info > 0) return "info";
  return "ok";
}

export function filterBySeverity(
  report: DoctorReport,
  min: Severity,
): CheckResult[] {
  const rank: Record<Severity, number> = { ok: 0, info: 1, warn: 2, error: 3 };
  const floor = rank[min];
  return report.checks.filter((c) => rank[c.severity] >= floor);
}
