export type Severity = "ok" | "info" | "warn" | "error";

export type Category =
  | "runtime"
  | "agents"
  | "mcp"
  | "secrets"
  | "hygiene";

export const ALL_CATEGORIES: Category[] = [
  "runtime",
  "agents",
  "mcp",
  "secrets",
  "hygiene",
];

export interface CheckResult {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  message: string;
  detail?: string;
  fix?: string;
}

export interface DoctorOptions {
  /** Project directory. Default: process.cwd() */
  cwd?: string;
  /**
   * Include user-home MCP configs (~/.cursor, Claude Desktop, etc.).
   * Default true for CLI; set false in tests for hermetic fixtures.
   */
  includeUserConfigs?: boolean;
  /** Only run these categories (default: all). */
  only?: Category[];
  /** Skip these categories. */
  skip?: Category[];
}

export interface CategorySummary {
  ok: number;
  info: number;
  warn: number;
  error: number;
  /** Penalty points applied after category cap. */
  penalty: number;
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
    byCategory: Record<Category, CategorySummary>;
  };
}
