/** P26 supply-chain-visibility-lite — offline MVP core (zero deps) */
export function main(input) {
  const suppliers = input.suppliers || input || [];
  return { risk: riskRollup(suppliers), stale: staleCheckins(suppliers, input.now, input.maxDays) };
}
export function riskRollup(suppliers) {
  const bands = { low: 0, medium: 0, high: 0 };
  for (const s of suppliers || []) {
    const b = s.risk || "low";
    bands[b] = (bands[b] || 0) + 1;
  }
  const high = (suppliers || []).filter((s) => s.risk === "high");
  return { bands, highRisk: high.map((s) => s.id), count: (suppliers || []).length };
}
export function staleCheckins(suppliers, now = Date.now(), maxDays = 14) {
  const ms = maxDays * 86400000;
  return (suppliers || []).filter((s) => !s.lastCheckin || now - s.lastCheckin > ms);
}
