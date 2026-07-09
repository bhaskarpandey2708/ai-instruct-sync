import type { CheckResult, DoctorReport, Severity } from "./types.js";
import {
  checkAgents,
  checkEnvSafety,
  checkMcp,
  checkProjectHygiene,
  checkRuntime,
  checkSecretLeaks,
} from "./checks.js";

const WEIGHT: Record<Severity, number> = {
  ok: 0,
  info: 0,
  warn: 8,
  error: 25,
};

export function runChecks(cwd: string = process.cwd()): DoctorReport {
  const checks: CheckResult[] = [
    ...checkRuntime(),
    ...checkAgents(cwd),
    ...checkMcp(cwd),
    ...checkEnvSafety(cwd),
    ...checkSecretLeaks(cwd),
    ...checkProjectHygiene(cwd),
  ];

  const summary = {
    ok: checks.filter((c) => c.severity === "ok").length,
    info: checks.filter((c) => c.severity === "info").length,
    warn: checks.filter((c) => c.severity === "warn").length,
    error: checks.filter((c) => c.severity === "error").length,
    score: 0,
  };

  const penalty = checks.reduce((n, c) => n + WEIGHT[c.severity], 0);
  summary.score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    cwd,
    checkedAt: new Date().toISOString(),
    node: process.versions.node,
    platform: `${process.platform} ${process.arch}`,
    checks,
    summary,
  };
}

export function severityScore(report: DoctorReport): number {
  return report.summary.score;
}

export function worstSeverity(report: DoctorReport): Severity {
  if (report.summary.error > 0) return "error";
  if (report.summary.warn > 0) return "warn";
  if (report.summary.info > 0) return "info";
  return "ok";
}
