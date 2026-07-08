/** Canonical representation of one AI coding rule/instruction. */
export interface Rule {
  id: string;
  content: string;
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
  metadata?: Record<string, unknown>;
}

export type RuleMap = Record<string, Rule>;

export interface AgentDef {
  id: string;
  name: string;
  rulePath: string;
  style: 'flat' | 'dir' | 'mixed';
  docsUrl: string;
}

export interface AgentState {
  def: AgentDef;
  exists: boolean;
  rules: RuleMap;
  error?: string;
}

export interface SyncOptions {
  replace: boolean;
  prune: boolean;
}

export interface SyncPlan {
  target: AgentState;
  next: RuleMap;
  added: string[];
  updated: string[];
  removed: string[];
  changed: boolean;
}
