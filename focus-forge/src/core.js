/** P27 focus-forge — offline MVP core (zero deps) */
export function main(input) {
  return weeklyReview((Array.isArray(input.sessions) ? input.sessions : []));
}
export function sessionScore(session) {
  const planned = session.plannedMin || 25;
  const actual = session.actualMin || 0;
  const distractions = session.distractions || 0;
  const focus = Math.max(0, Math.min(100, (actual / planned) * 100 - distractions * 5));
  return { focus: Math.round(focus), deep: focus >= 70 };
}
export function weeklyReview(sessions) {
  const scores = (Array.isArray(sessions) ? sessions : []).map(sessionScore);
  const avg = scores.length ? scores.reduce((s, x) => s + x.focus, 0) / scores.length : 0;
  return { sessions: scores.length, avgFocus: Math.round(avg), deepSessions: scores.filter((s) => s.deep).length };
}
