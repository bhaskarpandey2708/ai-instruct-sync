export interface Hunk {
  /** File the hunk belongs to (new path). */
  file: string;
  /** 1-based start line in the new file. */
  newStart: number;
  newLines: number;
  oldStart: number;
  oldLines: number;
  /** Raw hunk body lines including +/-/space prefixes. */
  lines: string[];
  added: number;
  removed: number;
}

export interface FileDiff {
  /** New path ("/dev/null" collapses to old path for deletions). */
  file: string;
  oldFile: string;
  status: "modified" | "added" | "deleted" | "renamed";
  hunks: Hunk[];
  binary: boolean;
}

export interface RiskSignal {
  id: string;
  label: string;
  weight: number;
}

export interface ScoredHunk {
  file: string;
  newStart: number;
  score: number;
  signals: RiskSignal[];
  preview: string;
}

export interface TriageReport {
  checkedAt: string;
  node: string;
  platform: string;
  files: number;
  hunks: number;
  totalAdded: number;
  totalRemoved: number;
  /** Hunks ranked most-risky first. */
  ranked: ScoredHunk[];
  /** Files changed without any matching test change. */
  untestedFiles: string[];
}

export interface TriageOptions {
  /** Max hunks to keep in `ranked` (default 20). */
  top?: number;
}
