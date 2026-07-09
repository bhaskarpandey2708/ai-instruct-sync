export type Severity = "ok" | "info" | "warn" | "error";

export interface CheckResult {
  id: string;
  title: string;
  severity: Severity;
  message: string;
  detail?: string;
  fix?: string;
}

export interface DoctorReport {
  cwd: string;
  checkedAt: string;
  node: string;
  platform: string;
  checks: CheckResult[];
  summary: {
    ok: number;
    info: number;
    warn: number;
    error: number;
    score: number;
  };
}
