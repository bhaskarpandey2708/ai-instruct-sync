export {
  getAgents,
  loadAgentState,
  parseFrontmatter,
  makeFrontmatter,
  writeDirRules,
  renderRules,
} from "./clients.js";
export {
  rulesEqual,
  planSync,
  backupFile,
  applyPlan,
  validateRules,
} from "./core.js";
export type {
  Rule,
  RuleMap,
  AgentDef,
  AgentState,
  SyncOptions,
  SyncPlan,
} from "./types.js";
