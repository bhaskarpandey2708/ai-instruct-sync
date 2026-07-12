/** P14 grc-evidence-autopilot — offline MVP core (zero deps) */
export function main(input) {
  return mapEvidence((Array.isArray(input.controls) ? input.controls : []), (Array.isArray(input.artifacts) ? input.artifacts : []));
}
export function mapEvidence(controls, artifacts) {
  const byControl = {};
  for (const c of (Array.isArray(controls) ? controls : [])) byControl[c.id] = { ...c, artifacts: [] };
  for (const a of (Array.isArray(artifacts) ? artifacts : [])) {
    for (const cid of a.controls || []) {
      if (byControl[cid]) byControl[cid].artifacts.push(a.id);
    }
  }
  const list = Object.values(byControl);
  const covered = list.filter((c) => c.artifacts.length > 0).length;
  return { controls: list, covered, total: list.length, coveragePct: list.length ? Math.round(covered / list.length * 100) : 0 };
}
