/** P07 shadow-AI — offline MVP core (zero deps) */
export function main(input) {
  return scoreShadowTools((Array.isArray(input.tools) ? input.tools : Array.isArray(input) ? input : []));
}
export function scoreShadowTools(inventory) {
  const unauthorized = (Array.isArray(inventory) ? inventory : []).filter((t) => t.approved === false);
  const risk = unauthorized.reduce((n, t) => n + (t.dataClass === "confidential" ? 3 : 1), 0);
  return {
    total: inventory.length,
    unauthorized: unauthorized.map((t) => t.name),
    riskScore: Math.min(100, risk * 10),
    severity: risk >= 6 ? "high" : risk >= 2 ? "medium" : "low",
  };
}
