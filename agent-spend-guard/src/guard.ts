import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  Budgets,
  GuardConfig,
  GuardReport,
  SpendLine,
  SpendSummary,
  UsageEvent,
  Verdict,
} from "./types.js";
import { costOf } from "./pricing.js";

export const CONFIG_FILENAME = ".spend-guard.json";

export function loadConfig(cwd: string): GuardConfig {
  const path = join(cwd, CONFIG_FILENAME);
  if (!existsSync(path)) return { budgets: {} };
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<GuardConfig>;
    return { budgets: raw.budgets ?? {}, prices: raw.prices };
  } catch {
    return { budgets: {} };
  }
}

export function sampleConfig(): GuardConfig {
  return {
    budgets: {
      dailyUsd: 25,
      monthlyUsd: 300,
      perProjectUsd: { "my-app": 100 },
      warnAtPct: 0.8,
    },
  };
}

function dayOf(ts: string): string {
  return ts.slice(0, 10) || "unknown";
}

function monthOf(ts: string): string {
  return ts.slice(0, 7) || "unknown";
}

export function summarize(events: UsageEvent[], config?: GuardConfig): SpendSummary {
  const byDay: Record<string, number> = {};
  const byModel: SpendSummary["byModel"] = {};
  const byProject: SpendSummary["byProject"] = {};
  let totalTokens = 0;
  let totalUsd = 0;

  for (const e of events) {
    const usd = costOf(e, config?.prices);
    const tokens =
      e.inputTokens + e.outputTokens + (e.cacheReadTokens ?? 0) + (e.cacheWriteTokens ?? 0);
    totalTokens += tokens;
    totalUsd += usd;

    const day = dayOf(e.ts);
    byDay[day] = (byDay[day] ?? 0) + usd;

    const model = e.model || "unknown";
    byModel[model] ??= { tokens: 0, usd: 0, calls: 0 };
    byModel[model].tokens += tokens;
    byModel[model].usd += usd;
    byModel[model].calls += 1;

    const project = e.project ?? "(unattributed)";
    byProject[project] ??= { tokens: 0, usd: 0, calls: 0 };
    byProject[project].tokens += tokens;
    byProject[project].usd += usd;
    byProject[project].calls += 1;
  }

  return { events: events.length, totalTokens, totalUsd, byDay, byModel, byProject };
}

function verdictFor(spent: number, limit: number, warnAt: number): Verdict {
  if (limit <= 0) return "ok";
  if (spent >= limit) return "stop";
  if (spent >= limit * warnAt) return "warn";
  return "ok";
}

const VERDICT_RANK: Record<Verdict, number> = { ok: 0, warn: 1, stop: 2 };

/**
 * Evaluate budgets against usage. `now` is injectable for tests.
 * Missing budgets simply produce no lines — the guard never invents limits.
 */
export function evaluateBudgets(
  events: UsageEvent[],
  budgets: Budgets,
  config?: GuardConfig,
  now: Date = new Date(),
): { lines: SpendLine[]; verdict: Verdict } {
  const warnAt = budgets.warnAtPct ?? 0.8;
  const lines: SpendLine[] = [];
  const today = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);

  if (budgets.dailyUsd !== undefined) {
    const spent = events
      .filter((e) => dayOf(e.ts) === today)
      .reduce((s, e) => s + costOf(e, config?.prices), 0);
    lines.push({
      scope: `today (${today})`,
      spentUsd: spent,
      limitUsd: budgets.dailyUsd,
      pct: budgets.dailyUsd > 0 ? spent / budgets.dailyUsd : 0,
      verdict: verdictFor(spent, budgets.dailyUsd, warnAt),
    });
  }

  if (budgets.monthlyUsd !== undefined) {
    const spent = events
      .filter((e) => monthOf(e.ts) === thisMonth)
      .reduce((s, e) => s + costOf(e, config?.prices), 0);
    lines.push({
      scope: `month (${thisMonth})`,
      spentUsd: spent,
      limitUsd: budgets.monthlyUsd,
      pct: budgets.monthlyUsd > 0 ? spent / budgets.monthlyUsd : 0,
      verdict: verdictFor(spent, budgets.monthlyUsd, warnAt),
    });
  }

  for (const [project, limit] of Object.entries(budgets.perProjectUsd ?? {})) {
    const spent = events
      .filter((e) => (e.project ?? "") === project && monthOf(e.ts) === thisMonth)
      .reduce((s, e) => s + costOf(e, config?.prices), 0);
    lines.push({
      scope: `project ${project} (${thisMonth})`,
      spentUsd: spent,
      limitUsd: limit,
      pct: limit > 0 ? spent / limit : 0,
      verdict: verdictFor(spent, limit, warnAt),
    });
  }

  const verdict = lines.reduce<Verdict>(
    (worst, l) => (VERDICT_RANK[l.verdict] > VERDICT_RANK[worst] ? l.verdict : worst),
    "ok",
  );
  return { lines, verdict };
}

export function buildReport(
  cwd: string,
  events: UsageEvent[],
  config: GuardConfig,
  now: Date = new Date(),
): GuardReport {
  const summary = summarize(events, config);
  const { lines, verdict } = evaluateBudgets(events, config.budgets, config, now);
  return {
    cwd,
    checkedAt: now.toISOString(),
    node: process.version,
    platform: process.platform,
    summary,
    lines,
    verdict,
  };
}
