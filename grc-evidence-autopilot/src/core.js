/** P14 grc-evidence-autopilot — offline MVP core (zero deps) */
export function main(input) {
  return mapEvidence(input.controls || [], input.artifacts || []);
}
export function mapEvidence(controls, artifacts) {
  const byControl = {};
  for (const c of controls || []) byControl[c.id] = { ...c, artifacts: [] };
  for (const a of artifacts || []) {
    for (const cid of a.controls || []) {
      if (byControl[cid]) byControl[cid].artifacts.push(a.id);
    }
  }
  const list = Object.values(byControl);
  const covered = list.filter((c) => c.artifacts.length > 0).length;
  return { controls: list, covered, total: list.length, coveragePct: list.length ? Math.round(covered / list.length * 100) : 0 };
}
