/** P19 learn-loop — offline MVP core (zero deps) */
export function main(input) {
  const cards = ((Array.isArray(input.cards) ? input.cards : [])).map((c) => nextReview(c, input.quality ?? 4));
  return { cards, due: dueCards(cards, input.day || 0) };
}
export function nextReview(card, quality /* 0-5 */) {
  let { ef = 2.5, interval = 0, reps = 0 } = card;
  if (quality < 3) return { ...card, reps: 0, interval: 1, ef, dueInDays: 1 };
  if (reps === 0) interval = 1;
  else if (reps === 1) interval = 6;
  else interval = Math.round(interval * ef);
  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { ...card, reps: reps + 1, interval, ef, dueInDays: interval };
}
export function dueCards(cards, day = 0) {
  return (Array.isArray(cards) ? cards : []).filter((c) => (c.dueDay ?? 0) <= day);
}
