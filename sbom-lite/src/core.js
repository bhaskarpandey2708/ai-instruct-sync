/** P13 sbom-lite — offline MVP core (zero deps) */
export function main(input) {
  const sbom = sbomFromPackageLock(input);
  return { sbom, gate: policyGate(sbom, input.policy || {}) };
}
export function sbomFromPackageLock(lock) {
  const packages = [];
  const deps = lock.packages || lock.dependencies || {};
  if (lock.packages) {
    for (const [p, meta] of Object.entries(lock.packages)) {
      if (!p) continue;
      const name = p.replace(/^node_modules\//, "");
      packages.push({ name, version: meta.version || "0.0.0", license: meta.license || "UNKNOWN" });
    }
  } else {
    for (const [name, meta] of Object.entries(deps)) {
      packages.push({ name, version: meta.version || "0.0.0", license: "UNKNOWN" });
    }
  }
  return { bomFormat: "secret-guard-sbom-lite", components: packages, count: packages.length };
}
export function policyGate(sbom, { denyLicenses = ["GPL-3.0"], denyNames = [] } = {}) {
  const violations = [];
  for (const c of sbom.components || []) {
    if (denyLicenses.includes(c.license)) violations.push({ name: c.name, reason: "license", value: c.license });
    if (denyNames.includes(c.name)) violations.push({ name: c.name, reason: "denied-package" });
  }
  return { ok: violations.length === 0, violations };
}
