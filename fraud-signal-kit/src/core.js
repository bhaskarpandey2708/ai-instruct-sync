/** P10 fraud-signal-kit — offline MVP core (zero deps) */
export function main(input) {
  return compositeSignals(input);
}
export function emailRisk(email) {
  const e = String(email || "").toLowerCase();
  let score = 0;
  if (!e.includes("@")) score += 80;
  if (/\d{5,}/.test(e)) score += 20;
  if (/(temp|disposable|mailinator|guerrillamail)/.test(e)) score += 50;
  if (e.endsWith(".ru") || e.endsWith(".tk")) score += 15;
  return { email: e, score: Math.min(100, score), band: score >= 50 ? "high" : score >= 20 ? "medium" : "low" };
}
export function velocityRisk(events, windowMs = 60000) {
  const now = Math.max(...events.map(e => e.ts), 0);
  const recent = events.filter(e => now - e.ts <= windowMs);
  const score = Math.min(100, recent.length * 15);
  return { count: recent.length, score, band: score >= 60 ? "high" : score >= 30 ? "medium" : "low" };
}
export function compositeSignals({ email, events }) {
  const e = emailRisk(email);
  const v = velocityRisk(events || []);
  const score = Math.round(e.score * 0.6 + v.score * 0.4);
  return { email: e, velocity: v, score, band: score >= 50 ? "high" : score >= 25 ? "medium" : "low" };
}
