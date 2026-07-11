/** P24 creator-ops — offline MVP core (zero deps) */
export function main(input) {
  return {
    pipeline: pipelineSummary(input.deals || []),
    conflicts: calendarConflicts(input.items || []),
  };
}
export function pipelineSummary(deals) {
  const byStage = {};
  let total = 0;
  for (const d of deals || []) {
    byStage[d.stage] = (byStage[d.stage] || 0) + 1;
    total += Number(d.value || 0);
  }
  return { byStage, dealCount: (deals || []).length, pipelineValue: total };
}
export function calendarConflicts(items) {
  const sorted = [...(items || [])].sort((a, b) => a.start - b.start);
  const conflicts = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) conflicts.push([sorted[i - 1].id, sorted[i].id]);
  }
  return conflicts;
}
