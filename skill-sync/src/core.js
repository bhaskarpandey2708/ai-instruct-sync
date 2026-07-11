/** P06 skill-sync — offline MVP core (zero deps) */
export function main(input) {
  const v = validateSkillPackage(input);
  const plan = input.remote ? planInstall(input, input.remote) : null;
  return { validate: v, plan };
}
export function validateSkillPackage(pkg) {
  const errors = [];
  if (!pkg || typeof pkg !== "object") return { ok: false, errors: ["not an object"] };
  if (!pkg.name || !/^[a-z0-9][a-z0-9._-]*$/i.test(pkg.name)) errors.push("invalid name");
  if (!pkg.version || !/^\d+\.\d+\.\d+/.test(pkg.version)) errors.push("invalid version");
  if (!Array.isArray(pkg.skills) || pkg.skills.length === 0) errors.push("skills[] required");
  for (const s of pkg.skills || []) {
    if (!s.id || !s.content) errors.push(`skill missing id/content: ${s.id || "?"}`);
  }
  return { ok: errors.length === 0, errors };
}
export function planInstall(local, remote) {
  const map = Object.fromEntries((local.skills || []).map((s) => [s.id, s]));
  const added = [], updated = [];
  for (const s of remote.skills || []) {
    if (!map[s.id]) added.push(s.id);
    else if (map[s.id].content !== s.content) updated.push(s.id);
  }
  return { added, updated, wouldWrite: added.length + updated.length };
}
