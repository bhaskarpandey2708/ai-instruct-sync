/** P11 cloud-waste-radar — offline MVP core (zero deps) */
export function main(input) {
  return findWaste((Array.isArray(input.inventory) ? input.inventory : Array.isArray(input) ? input : []));
}
export function findWaste(inventory) {
  const findings = [];
  for (const r of (Array.isArray(inventory) ? inventory : [])) {
    if (r.type === "ebs" && r.attached === false) findings.push({ id: r.id, kind: "idle_ebs", monthlyUsd: r.monthlyUsd || 5 });
    if (r.type === "eip" && r.associated === false) findings.push({ id: r.id, kind: "idle_eip", monthlyUsd: r.monthlyUsd || 3.6 });
    if (r.type === "rds" && r.connections === 0 && r.daysIdle >= 7) findings.push({ id: r.id, kind: "idle_rds", monthlyUsd: r.monthlyUsd || 50 });
    if (r.type === "ec2" && r.cpuAvg7d != null && r.cpuAvg7d < 5) findings.push({ id: r.id, kind: "rightsizing_ec2", monthlyUsd: (r.monthlyUsd || 30) * 0.4 });
  }
  const savings = findings.reduce((s, f) => s + f.monthlyUsd, 0);
  return { findings, monthlySavingsUsd: Math.round(savings * 100) / 100, count: findings.length };
}
