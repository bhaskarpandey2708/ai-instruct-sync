import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { renderRules, writeDirRules } from "./clients.js";
import type { AgentState, RuleMap, SyncOptions, SyncPlan } from "./types.js";

export function rulesEqual(a: RuleMap, b: RuleMap): boolean {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  return ak.every(k => a[k]!.content === b[k]?.content);
}

export function planSync(source: RuleMap, target: AgentState, opts: SyncOptions): SyncPlan {
  let next = opts.replace ? { ...source } : { ...target.rules, ...source };
  if (opts.prune) {
    for (const name of Object.keys(next)) if (!(name in source)) delete next[name];
  }
  const added = Object.keys(next).filter(n => !(n in target.rules));
  const updated = Object.keys(next).filter(n => n in target.rules && next[n]!.content !== target.rules[n]!.content);
  const removed = Object.keys(target.rules).filter(n => !(n in next));
  return { target, next, added, updated, removed, changed: !rulesEqual(next, target.rules) };
}

export function backupFile(filePath: string, home = homedir()): string | null {
  if (!existsSync(filePath)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const relative = filePath.replace(/^[A-Za-z]:[\\/]/, "").replace(/^[\\/]+/, "").replaceAll("\\", "/");
  const dest = join(home, ".instruct-sync", "backups", stamp, relative);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(filePath, dest);
  return dest;
}

export function applyPlan(plan: SyncPlan, home = homedir()) {
  const { def } = plan.target;
  const backup = backupFile(def.rulePath, home);
  mkdirSync(dirname(def.rulePath), { recursive: true });
  if (def.style === 'dir') {
    writeDirRules(def.rulePath, plan.next);
  } else {
    writeFileSync(def.rulePath, renderRules(def, plan.next), "utf8");
  }
  return { backupPath: backup };
}

export function validateRules(rules: RuleMap): string[] {
  const issues: string[] = [];
  Object.entries(rules).forEach(([id, rule]) => {
    const content = (rule.content || "").trim();
    if (!content || content.length < 10) {
      issues.push(`${id}: rule content is too short`);
    }
    if (content.length > 5000) {
      issues.push(`${id}: rule content may be too long (token bloat risk)`);
    }
    if (content.includes("TODO") || content.includes("FIXME")) {
      issues.push(`${id}: contains TODO/FIXME — consider making guidelines more specific`);
    }
    if (rule.description && rule.description.length > 120) {
      issues.push(`${id}: description is very long (keep under ~120 chars for best results)`);
    }
  });
  return issues;
}
