/** P08 eval-harness — offline MVP core (zero deps) */
export function main(input) {
  return runSuite((Array.isArray(input.cases) ? input.cases : Array.isArray(input) ? input : []));
}
export function runCase(c) {
  const expected = (c.expectContains || []).every((s) => String(c.actual || "").includes(s));
  const forbidden = (c.forbidContains || []).some((s) => String(c.actual || "").includes(s));
  const pass = expected && !forbidden;
  return { id: c.id, pass, expected, forbidden };
}
export function runSuite(cases) {
  const results = (Array.isArray(cases) ? cases : []).map(runCase);
  const passed = results.filter((r) => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, results, ok: passed === results.length };
}
