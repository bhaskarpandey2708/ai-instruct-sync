/** P12 dev-onboard-os — offline MVP core (zero deps) */
export function main(input) {
  return progress(input.state || input || {});
}
export const DEFAULT_CHECKLIST = [
  { id: "laptop", title: "Dev machine provisioned" },
  { id: "github", title: "GitHub access + 2FA" },
  { id: "repo", title: "Clone monorepo + build green" },
  { id: "secrets", title: "Secrets via vault (not chat)" },
  { id: "agents", title: "AI agents + MCP configured safely" },
  { id: "first-pr", title: "First PR merged" },
];
export function progress(state) {
  const items = DEFAULT_CHECKLIST.map((c) => ({ ...c, done: !!(state && state[c.id]) }));
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) };
}
