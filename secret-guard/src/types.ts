export type Severity = "ok" | "info" | "warn" | "error";

export type FindingKind =
  | "agent-file"
  | "mcp-env"
  | "mcp-arg"
  | "env-example"
  | "tracked-secret-file";

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  /** Relative path from scan root when possible */
  file: string;
  line?: number;
  column?: number;
  /** Pattern family: openai, aws-key, github-pat, … */
  pattern: string;
  message: string;
  /** Redacted snippet (never full secret) */
  snippet: string;
  fix?: string;
}

export interface ScanOptions {
  cwd?: string;
  /** Also scan user-home MCP configs. Default false for hermetic CI. */
  includeUser?: boolean;
  /** Max files to open (safety). Default 400. */
  maxFiles?: number;
  /** Max bytes per file. Default 200_000. */
  maxBytes?: number;
}

export interface ScanReport {
  cwd: string;
  scannedAt: string;
  filesScanned: number;
  findings: Finding[];
  summary: {
    error: number;
    warn: number;
    info: number;
    ok: boolean;
  };
}
