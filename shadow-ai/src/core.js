/** P07 shadow-AI — offline MVP core (zero deps) */
export function main(input) {
  return scoreShadowTools(input.tools || input || []);
}
export function scoreShadowTools(inventory) {
  const unauthorized = (inventory || []).filter((t) => t.approved === false);
  const risk = unauthorized.reduce((n, t) => n + (t.dataClass === "confidential" ? 3 : 1), 0);
  return {
    total: inventory.length,
    unauthorized: unauthorized.map((t) => t.name),
    riskScore: Math.min(100, risk * 10),
    severity: risk >= 6 ? "high" : risk >= 2 ? "medium" : "low",
  };
}
