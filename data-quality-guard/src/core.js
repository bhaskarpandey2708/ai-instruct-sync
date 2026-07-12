/** P21 data-quality-guard — offline MVP core (zero deps) */
export function main(input) {
  return runExpectations((Array.isArray(input.rows) ? input.rows : []), (Array.isArray(input.expectations) ? input.expectations : []));
}
export function runExpectations(rows, expectations) {
  const results = [];
  for (const exp of expectations || []) {
    if (exp.type === "not_null") {
      const bad = rows.filter((r) => r[exp.column] == null || r[exp.column] === "");
      results.push({ id: exp.id, pass: bad.length === 0, bad: bad.length });
    } else if (exp.type === "unique") {
      const seen = new Set();
      let dups = 0;
      for (const r of rows) {
        const v = r[exp.column];
        if (seen.has(v)) dups++;
        seen.add(v);
      }
      results.push({ id: exp.id, pass: dups === 0, bad: dups });
    } else if (exp.type === "range") {
      const bad = rows.filter((r) => Number(r[exp.column]) < exp.min || Number(r[exp.column]) > exp.max);
      results.push({ id: exp.id, pass: bad.length === 0, bad: bad.length });
    }
  }
  return { results, ok: results.every((r) => r.pass) };
}
