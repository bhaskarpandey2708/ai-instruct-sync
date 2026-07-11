export { scan, worstSeverity } from "./scanner.js";
export type {
  Category,
  Finding,
  ScanOptions,
  ScanReport,
  Severity,
  SeverityCounts,
} from "./types.js";
export { ALL_CATEGORIES, SEVERITY_ORDER } from "./types.js";
export {
  TEXT_RULES,
  OBFUSCATION_RULES,
  SECRET_PATTERNS,
  findUnicodeHits,
  findSecretHits,
  isAllowlistedSecretText,
  looksLikeHardcodedSecret,
  isUnpinnedPackageArg,
} from "./rules.js";
