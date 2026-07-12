import type { ModelPrice, UsageEvent } from "./types.js";

/**
 * Approximate list prices per MILLION tokens (USD), mid-2026. Matched by
 * longest model-id prefix; override any entry via .spend-guard.json `prices`.
 * Budget math needs to be roughly right, not invoice-exact.
 */
export const DEFAULT_PRICES: Record<string, ModelPrice> = {
  "claude-opus": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-fable": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-sonnet": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-haiku": { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
  "claude-3-5": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1": { input: 2, output: 8 },
  o3: { input: 2, output: 8 },
  "gemini-1.5-pro": { input: 1.25, output: 5 },
  "gemini-2": { input: 1.25, output: 5 },
  // Conservative fallback for unknown models
  default: { input: 5, output: 25 },
};

export function priceFor(model: string, overrides?: Record<string, ModelPrice>): ModelPrice {
  const table = { ...DEFAULT_PRICES, ...(overrides ?? {}) };
  const m = model.toLowerCase();
  let best: string | null = null;
  for (const prefix of Object.keys(table)) {
    if (prefix === "default") continue;
    if (m.startsWith(prefix.toLowerCase()) && (!best || prefix.length > best.length)) {
      best = prefix;
    }
  }
  return table[best ?? "default"] ?? table.default!;
}

/** Cost of one usage event in USD. */
export function costOf(e: UsageEvent, overrides?: Record<string, ModelPrice>): number {
  const p = priceFor(e.model, overrides);
  const perTokenIn = p.input / 1_000_000;
  const perTokenOut = p.output / 1_000_000;
  const perTokenCacheRead = (p.cacheRead ?? p.input * 0.1) / 1_000_000;
  const perTokenCacheWrite = (p.cacheWrite ?? p.input * 1.25) / 1_000_000;
  return (
    e.inputTokens * perTokenIn +
    e.outputTokens * perTokenOut +
    (e.cacheReadTokens ?? 0) * perTokenCacheRead +
    (e.cacheWriteTokens ?? 0) * perTokenCacheWrite
  );
}
