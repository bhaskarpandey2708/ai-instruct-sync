/** P26 supply-chain-visibility-lite — offline MVP core (zero deps) */
export function main(input) {
  const suppliers = (Array.isArray(input.suppliers) ? input.suppliers : Array.isArray(input) ? input : []);
  return { risk: riskRollup(suppliers), stale: staleCheckins(suppliers, input.now, input.maxDays) };
}
export function riskRollup(suppliers) {
  const bands = { low: 0, medium: 0, high: 0 };
  for (const s of (Array.isArray(suppliers) ? suppliers : [])) {
    const b = s.risk || "low";
    bands[b] = (bands[b] || 0) + 1;
  }
  const high = (Array.isArray(suppliers) ? suppliers : []).filter((s) => s.risk === "high");
  return { bands, highRisk: high.map((s) => s.id), count: (Array.isArray(suppliers) ? suppliers : []).length };
}
export function staleCheckins(suppliers, now = Date.now(), maxDays = 14) {
  const ms = maxDays * 86400000;
  return (Array.isArray(suppliers) ? suppliers : []).filter((s) => !s.lastCheckin || now - s.lastCheckin > ms);
}
