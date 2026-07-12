/** P23 personal-crm — offline MVP core (zero deps) */
export function main(input) {
  const now = input.now || Date.now();
  return { nudge: peopleNeedingNudge((Array.isArray(input.people) ? input.people : []), now, input.days || 30) };
}
export function peopleNeedingNudge(people, now = Date.now(), days = 30) {
  const ms = days * 86400000;
  return (Array.isArray(people) ? people : []).filter((p) => !p.lastTouch || now - p.lastTouch > ms);
}
export function recordTouch(person, at = Date.now(), note = "") {
  return { ...person, lastTouch: at, notes: [...(person.notes || []), { at, note }] };
}
