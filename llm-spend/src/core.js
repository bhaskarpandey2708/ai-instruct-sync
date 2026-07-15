/** P05 llm-spend — multi-provider LLM cost observability (zero deps) */
import { costOf, priceFor, DEFAULT_PRICES } from "./prices.js";

export { costOf, priceFor, DEFAULT_PRICES };

function round(n, d = 4) {
  const f = 10 ** d;
  return Math.round(Number(n) * f) / f;
}

function dayKey(ts) {
  if (!ts) return "unknown";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toISOString().slice(0, 10);
}

/**
 * Normalize one raw event into a priced usage row.
 * Accepts several export shapes (OpenAI/Anthropic-ish, proxy logs, simple totals).
 * @param {Record<string, unknown>} raw
 * @param {Record<string, import("./prices.js").ModelPrice>} [priceOverrides]
 */
export function normalizeEvent(raw, priceOverrides) {
  if (!raw || typeof raw !== "object") return null;
  const provider = String(raw.provider || raw.vendor || inferProvider(raw.model) || "unknown");
  const model = String(raw.model || raw.model_id || raw.modelId || "unknown");
  const project = String(raw.project || raw.workspace || raw.app || raw.feature || "default");
  const ts = raw.ts || raw.timestamp || raw.created_at || raw.time || null;

  let inputTokens = num(raw.inputTokens ?? raw.input_tokens ?? raw.prompt_tokens ?? raw.promptTokens);
  let outputTokens = num(
    raw.outputTokens ?? raw.output_tokens ?? raw.completion_tokens ?? raw.completionTokens,
  );
  let tokens = num(raw.tokens ?? raw.total_tokens ?? raw.totalTokens);
  if (!tokens && (inputTokens || outputTokens)) tokens = inputTokens + outputTokens;
  if (tokens && !inputTokens && !outputTokens) {
    inputTokens = Math.round(tokens * 0.7);
    outputTokens = tokens - inputTokens;
  }

  const cacheReadTokens = num(raw.cacheReadTokens ?? raw.cache_read_tokens ?? raw.cache_read_input_tokens);
  const cacheWriteTokens = num(raw.cacheWriteTokens ?? raw.cache_write_tokens ?? raw.cache_creation_input_tokens);

  const row = {
    provider,
    model,
    project,
    ts: ts ? String(ts) : null,
    inputTokens,
    outputTokens,
    tokens: tokens || inputTokens + outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    pricePer1k: raw.pricePer1k != null ? Number(raw.pricePer1k) : undefined,
    costUsd: raw.costUsd != null ? Number(raw.costUsd) : undefined,
  };
  row.costUsd = round(costOf(row, priceOverrides), 6);
  return row;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function inferProvider(model) {
  if (!model) return null;
  const m = String(model).toLowerCase();
  if (m.includes("claude") || m.startsWith("claude")) return "anthropic";
  if (m.includes("gpt") || m.startsWith("o1") || m.startsWith("o3")) return "openai";
  if (m.includes("gemini")) return "google";
  if (m.includes("mistral")) return "mistral";
  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("llama")) return "meta";
  if (m.includes("azure")) return "azure";
  return null;
}

/**
 * Parse usage file content: JSON object, JSON array, or JSONL.
 * @param {string} text
 * @returns {unknown[]}
 */
export function parseUsageText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return [];
  // JSONL: multiple lines starting with {
  if (trimmed.includes("\n") && !trimmed.startsWith("[")) {
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => l.startsWith("{") || l.startsWith("["))) {
      const events = [];
      for (const line of lines) {
        try {
          const v = JSON.parse(line);
          if (Array.isArray(v)) events.push(...v);
          else if (v && Array.isArray(v.events)) events.push(...v.events);
          else events.push(v);
        } catch {
          /* skip bad line */
        }
      }
      if (events.length) return events;
    }
  }
  const data = JSON.parse(trimmed);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.events)) return data.events;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.usage)) return data.usage;
    // single event object
    if (data.model || data.provider || data.tokens || data.inputTokens) return [data];
  }
  return [];
}

/**
 * Aggregate priced events.
 * @param {unknown[]} rawEvents
 * @param {{ budgetUsd?: number, prices?: Record<string, import("./prices.js").ModelPrice> }} [opts]
 */
export function parseUsageEvents(rawEvents, opts = {}) {
  const prices = opts.prices;
  const events = [];
  for (const raw of Array.isArray(rawEvents) ? rawEvents : []) {
    const n = normalizeEvent(/** @type {Record<string, unknown>} */ (raw), prices);
    if (n) events.push(n);
  }

  const byProvider = {};
  const byModel = {};
  const byProject = {};
  const byDay = {};
  let totalTokens = 0;
  let totalCost = 0;

  for (const e of events) {
    bump(byProvider, e.provider, e);
    bump(byModel, e.model, e);
    bump(byProject, e.project, e);
    bump(byDay, dayKey(e.ts), e);
    totalTokens += e.tokens;
    totalCost += e.costUsd;
  }

  return {
    eventCount: events.length,
    totalTokens,
    totalCostUsd: round(totalCost),
    byProvider: sortBuckets(byProvider),
    byModel: sortBuckets(byModel),
    byProject: sortBuckets(byProject),
    byDay: sortBuckets(byDay),
    events,
  };
}

function bump(map, key, e) {
  const k = key || "unknown";
  if (!map[k]) map[k] = { tokens: 0, costUsd: 0, calls: 0, inputTokens: 0, outputTokens: 0 };
  map[k].tokens += e.tokens;
  map[k].costUsd = round(map[k].costUsd + e.costUsd);
  map[k].calls += 1;
  map[k].inputTokens += e.inputTokens;
  map[k].outputTokens += e.outputTokens;
}

function sortBuckets(map) {
  const entries = Object.entries(map).sort((a, b) => b[1].costUsd - a[1].costUsd);
  /** @type {Record<string, object>} */
  const out = {};
  for (const [k, v] of entries) out[k] = v;
  return out;
}

/**
 * @param {number} totalCostUsd
 * @param {number} budgetUsd
 */
export function budgetStatus(totalCostUsd, budgetUsd) {
  const b = Number(budgetUsd) || 0;
  const used = b > 0 ? totalCostUsd / b : 0;
  return {
    budgetUsd: b,
    totalCostUsd: round(totalCostUsd),
    remainingUsd: round(Math.max(0, b - totalCostUsd)),
    usedPct: round(used * 100, 2),
    over: b > 0 && totalCostUsd > b,
    warn: b > 0 && used >= 0.8 && totalCostUsd <= b,
  };
}

/**
 * Full report from input object or event list.
 * @param {Record<string, unknown> | unknown[]} input
 * @param {{ budgetUsd?: number, prices?: Record<string, import("./prices.js").ModelPrice> }} [opts]
 */
export function main(input = {}, opts = {}) {
  let events = [];
  let budgetUsd = opts.budgetUsd;
  let prices = opts.prices;

  if (Array.isArray(input)) {
    events = input;
  } else if (input && typeof input === "object") {
    if (Array.isArray(input.events)) events = input.events;
    else if (Array.isArray(input.data)) events = input.data;
    else events = [];
    if (budgetUsd == null && input.budgetUsd != null) budgetUsd = Number(input.budgetUsd);
    if (!prices && input.prices && typeof input.prices === "object") {
      prices = /** @type {Record<string, import("./prices.js").ModelPrice>} */ (input.prices);
    }
  }

  if (budgetUsd == null) budgetUsd = 100;
  const usage = parseUsageEvents(events, { prices });
  const budget = budgetStatus(usage.totalCostUsd, budgetUsd);

  /** @type {"ok" | "warn" | "over"} */
  let verdict = "ok";
  if (budget.over) verdict = "over";
  else if (budget.warn) verdict = "warn";

  return {
    product: "llm-spend",
    verdict,
    usage: {
      eventCount: usage.eventCount,
      totalTokens: usage.totalTokens,
      totalCostUsd: usage.totalCostUsd,
      byProvider: usage.byProvider,
      byModel: usage.byModel,
      byProject: usage.byProject,
      byDay: usage.byDay,
    },
    budget,
  };
}
