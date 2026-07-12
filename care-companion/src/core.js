/** P22 care-companion — offline MVP core (zero deps) */
export function main(input) {
  const now = input.now || Date.now();
  const due = medsDue((Array.isArray(input.meds) ? input.meds : []), now);
  return { due, next: ((Array.isArray(input.meds) ? input.meds : [])).map((m) => scheduleNext(m, now)) };
}
export function medsDue(meds, now = Date.now()) {
  return (Array.isArray(meds) ? meds : []).filter((m) => (m.nextAt || 0) <= now);
}
export function scheduleNext(med, from = Date.now()) {
  const intervalMs = (med.everyHours || 24) * 3600000;
  return { ...med, nextAt: from + intervalMs };
}
