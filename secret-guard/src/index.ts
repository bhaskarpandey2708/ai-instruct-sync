export { scan, worstSeverity } from "./scan.js";
export { toSarif } from "./sarif.js";
export { findSecretHits, isAllowlistedSecretText, looksLikeHardcodedSecret, redact } from "./patterns.js";
export type {
  Finding,
  FindingKind,
  ScanOptions,
  ScanReport,
  Severity,
} from "./types.js";
