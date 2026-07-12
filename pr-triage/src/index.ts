export { parseUnifiedDiff } from "./parse-diff.js";
export { scoreHunk, triage, untestedChangedFiles } from "./risk.js";
export type {
  FileDiff,
  Hunk,
  RiskSignal,
  ScoredHunk,
  TriageOptions,
  TriageReport,
} from "./types.js";
