/** P25 climate-ops-meter — offline MVP core (zero deps) */
// simplified emission factors kg CO2e
const FACTORS = { electricity_kwh: 0.7, diesel_l: 2.68, flight_km: 0.15, waste_kg: 0.5 };
export function main(input) {
  return estimateEmissions(Array.isArray(input.activities) ? input.activities : Array.isArray(input) ? input : []);
}
export function estimateEmissions(activities) {
  let total = 0;
  const lines = [];
  for (const a of (Array.isArray(activities) ? activities : [])) {
    const f = FACTORS[a.type] || 0;
    const kg = f * Number(a.amount || 0);
    total += kg;
    lines.push({ ...a, kgCO2e: Math.round(kg * 100) / 100 });
  }
  return { lines, totalKgCO2e: Math.round(total * 100) / 100, totalTCO2e: Math.round(total / 10) / 100 };
}
