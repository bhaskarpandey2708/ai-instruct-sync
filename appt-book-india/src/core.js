/** P17 appt-book-india — offline MVP core (zero deps) */
export function main(input) {
  const dayStart = input.dayStart || Date.parse("2026-07-11T09:00:00Z");
  const dayEnd = input.dayEnd || Date.parse("2026-07-11T17:00:00Z");
  const slots = findSlots(dayStart, dayEnd, input.busy || [], input.durationMin || 30);
  return { slots, book: book(slots, input.preferredStart) };
}
export function findSlots(dayStart, dayEnd, busy, durationMin = 30) {
  const slots = [];
  let t = dayStart;
  const step = durationMin * 60000;
  while (t + step <= dayEnd) {
    const end = t + step;
    const conflict = (busy || []).some((b) => !(end <= b.start || t >= b.end));
    if (!conflict) slots.push({ start: t, end });
    t += step;
  }
  return slots;
}
export function book(slots, preferredStart) {
  const hit = slots.find((s) => s.start === preferredStart) || slots[0] || null;
  return hit ? { ok: true, slot: hit } : { ok: false, slot: null };
}
