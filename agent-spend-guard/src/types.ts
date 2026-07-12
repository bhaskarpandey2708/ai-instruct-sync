export type Verdict = "ok" | "warn" | "stop";

export interface UsageEvent {
  /** ISO timestamp of the API call. */
  ts: string;
  /** Model id, e.g. "claude-sonnet-5". */
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  /** Project directory or logical bucket the call belongs to. */
  project?: string;
  /** Which agent produced it: "claude-code", "cursor", "api", … */
  source?: string;
}

/** Prices per **million** tokens, USD. */
export interface ModelPrice {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
}

export interface Budgets {
  /** Hard daily ceiling in USD. */
  dailyUsd?: number;
  /** Hard monthly ceiling in USD. */
  monthlyUsd?: number;
  /** Per-project monthly ceilings in USD, keyed by project name. */
  perProjectUsd?: Record<string, number>;
  /** Warn when spend crosses this fraction of any ceiling (default 0.8). */
  warnAtPct?: number;
}

export interface GuardConfig {
  budgets: Budgets;
  /** Price-table overrides, keyed by model-id prefix. */
  prices?: Record<string, ModelPrice>;
}

export interface SpendLine {
  scope: string;
  spentUsd: number;
  limitUsd: number;
  pct: number;
  verdict: Verdict;
}

export interface SpendSummary {
  events: number;
  totalTokens: number;
  totalUsd: number;
  byDay: Record<string, number>;
  byModel: Record<string, { tokens: number; usd: number; calls: number }>;
  byProject: Record<string, { tokens: number; usd: number; calls: number }>;
}

export interface GuardReport {
  cwd: string;
  checkedAt: string;
  node: string;
  platform: string;
  summary: SpendSummary;
  lines: SpendLine[];
  /** Worst verdict across all budget lines — the kill-switch signal. */
  verdict: Verdict;
}
