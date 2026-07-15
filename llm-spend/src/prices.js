/**
 * Approximate list prices USD per MILLION tokens (mid-2026).
 * Matched by longest model-id prefix. Override via event.costUsd or input.prices.
 * Budget-accurate, not invoice-exact.
 */

/** @typedef {{ input: number, output: number, cacheRead?: number, cacheWrite?: number }} ModelPrice */

/** @type {Record<string, ModelPrice>} */
export const DEFAULT_PRICES = {
  "claude-opus": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-sonnet": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-haiku": { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
  "claude-3-5": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-3-7": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2, output: 8 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "o3-mini": { input: 1.1, output: 4.4 },
  o3: { input: 2, output: 8 },
  o1: { input: 15, output: 60 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5 },
  "gemini-2": { input: 1.25, output: 5 },
  "azure-gpt-4o": { input: 2.5, output: 10 },
  "mistral-large": { input: 2, output: 6 },
  "mistral-small": { input: 0.2, output: 0.6 },
  "deepseek-chat": { input: 0.27, output: 1.1 },
  "llama-3.1-70b": { input: 0.9, output: 0.9 },
  default: { input: 5, output: 25 },
};

/**
 * @param {string} model
 * @param {Record<string, ModelPrice>} [overrides]
 * @returns {ModelPrice}
 */
export function priceFor(model, overrides) {
  const table = { ...DEFAULT_PRICES, ...(overrides ?? {}) };
  const m = String(model || "unknown").toLowerCase();
  let best = null;
  for (const prefix of Object.keys(table)) {
    if (prefix === "default") continue;
    if (m.startsWith(prefix.toLowerCase()) && (!best || prefix.length > best.length)) {
      best = prefix;
    }
  }
  return table[best ?? "default"] ?? table.default;
}

/**
 * @param {{ model?: string, inputTokens?: number, outputTokens?: number, tokens?: number, cacheReadTokens?: number, cacheWriteTokens?: number, costUsd?: number, pricePer1k?: number }} e
 * @param {Record<string, ModelPrice>} [overrides]
 */
export function costOf(e, overrides) {
  if (e.costUsd != null && Number.isFinite(Number(e.costUsd))) {
    return Number(e.costUsd);
  }
  // Legacy: total tokens × pricePer1k
  if (e.pricePer1k != null && (e.tokens != null || (e.inputTokens != null || e.outputTokens != null))) {
    const tokens =
      Number(e.tokens) || Number(e.inputTokens || 0) + Number(e.outputTokens || 0);
    return (tokens * Number(e.pricePer1k)) / 1000;
  }
  const p = priceFor(e.model || "default", overrides);
  let inTok = Number(e.inputTokens || 0);
  let outTok = Number(e.outputTokens || 0);
  if (!inTok && !outTok && e.tokens != null) {
    // Unknown split — charge as mixed (70% in / 30% out) so totals aren't zero
    const t = Number(e.tokens);
    inTok = Math.round(t * 0.7);
    outTok = t - inTok;
  }
  return (
    (inTok * p.input) / 1_000_000 +
    (outTok * p.output) / 1_000_000 +
    (Number(e.cacheReadTokens || 0) * (p.cacheRead ?? p.input * 0.1)) / 1_000_000 +
    (Number(e.cacheWriteTokens || 0) * (p.cacheWrite ?? p.input * 1.25)) / 1_000_000
  );
}
