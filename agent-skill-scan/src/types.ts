export type Severity = "critical" | "high" | "medium" | "low";

export type Category = "skills" | "mcp" | "rules" | "hooks";

export const ALL_CATEGORIES: Category[] = ["skills", "mcp", "rules", "hooks"];

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export interface Finding {
  /** Rule id, e.g. "injection/override-instructions" */
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  /** Path relative to cwd when inside it, absolute otherwise. */
  file: string;
  line?: number;
  /** Offending text, trimmed. Secrets are masked before storing. */
  snippet?: string;
  message: string;
  fix?: string;
}

export interface ScanOptions {
  /** Project directory. Default: process.cwd() */
  cwd?: string;
  /**
   * Include user-home locations (~/.claude/skills, ~/.cursor/mcp.json, Claude
   * Desktop config). Default true for CLI; set false in tests for hermetic runs.
   */
  includeUser?: boolean;
  /** Only scan these categories (default: all). */
  only?: Category[];
  /** Skip these categories. */
  skip?: Category[];
  /** Per-root file cap when walking skill directories. */
  maxFiles?: number;
}

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ScanReport {
  cwd: string;
  scannedAt: string;
  node: string;
  platform: string;
  filesScanned: number;
  findings: Finding[];
  summary: SeverityCounts & {
    score: number;
    byCategory: Record<Category, SeverityCounts>;
  };
}
