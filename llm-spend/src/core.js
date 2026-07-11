/** P05 llm-spend — offline MVP core (zero deps) */
export function main(input) {
  const events = input.events || input || [];
  const usage = parseUsageEvents(Array.isArray(events) ? events : []);
  const budget = input.budgetUsd || 100;
  return { usage, budget: budgetStatus(usage.totalCostUsd, budget) };
}
export function parseUsageEvents(events) {
  const byProvider = {};
  let totalTokens = 0, totalCost = 0;
  for (const e of events) {
    const p = e.provider || "unknown";
    const tokens = Number(e.tokens || 0);
    const cost = Number(e.costUsd ?? tokens * (e.pricePer1k || 0.002) / 1000);
    byProvider[p] = byProvider[p] || { tokens: 0, costUsd: 0, calls: 0 };
    byProvider[p].tokens += tokens;
    byProvider[p].costUsd += cost;
    byProvider[p].calls += 1;
    totalTokens += tokens;
    totalCost += cost;
  }
  return { byProvider, totalTokens, totalCostUsd: round(totalCost), eventCount: events.length };
}
export function budgetStatus(totalCostUsd, budgetUsd) {
  const used = totalCostUsd / budgetUsd;
  return { budgetUsd, totalCostUsd, usedPct: round(used * 100), over: totalCostUsd > budgetUsd };
}
function round(n) { return Math.round(n * 10000) / 10000; }
