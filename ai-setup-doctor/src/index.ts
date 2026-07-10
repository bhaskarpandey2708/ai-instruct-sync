export {
  runChecks,
  severityScore,
  worstSeverity,
  filterBySeverity,
  sortChecks,
  computeScore,
} from "./core.js";
export type {
  Category,
  CategorySummary,
  CheckResult,
  DoctorOptions,
  DoctorReport,
  Severity,
} from "./types.js";
export { ALL_CATEGORIES } from "./types.js";
export {
  checkAgents,
  checkEnvExampleSafety,
  checkEnvSafety,
  checkMcp,
  checkPlaceholders,
  checkProjectHygiene,
  checkRuleQuality,
  checkRuntime,
  checkSecretLeaks,
} from "./checks.js";
export {
  findSecretHits,
  isAllowlistedSecretText,
  findInstructionContradictions,
  isUnpinnedPackageArg,
} from "./patterns.js";
