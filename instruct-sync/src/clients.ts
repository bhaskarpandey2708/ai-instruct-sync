import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { AgentDef, AgentState, Rule, RuleMap } from "./types.js";

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content.trim() };
  }
  const front: Record<string, any> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let val: any = kv[2].trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
      }
      front[kv[1]] = val;
    }
  }
  return { frontmatter: front, body: match[2].trim() };
}

function makeFrontmatter(front: Record<string, any>): string {
  const lines = Object.entries(front).map(([k, v]) => {
    if (Array.isArray(v)) return `${k}: [${v.map(x => `"${x}"`).join(', ')}]`;
    return `${k}: ${v}`;
  });
  return lines.length ? `---\n${lines.join('\n')}\n---\n` : '';
}

export function getAgents(cwd: string = process.cwd()): AgentDef[] {
  return [
    { id: "cursor", name: "Cursor", rulePath: join(cwd, ".cursor", "rules"), style: "dir", docsUrl: "" },
    { id: "windsurf", name: "Windsurf", rulePath: join(cwd, ".windsurf", "rules"), style: "dir", docsUrl: "" },
    { id: "copilot", name: "GitHub Copilot", rulePath: join(cwd, ".github", "copilot-instructions.md"), style: "flat", docsUrl: "" },
    { id: "claude-code", name: "Claude Code", rulePath: join(cwd, "CLAUDE.md"), style: "flat", docsUrl: "" },
    { id: "gemini", name: "Gemini CLI", rulePath: join(cwd, "GEMINI.md"), style: "flat", docsUrl: "" },
    { id: "aider", name: "Aider", rulePath: join(cwd, ".aider.conf.yml"), style: "mixed", docsUrl: "" }
  ];
}

export function loadAgentState(def: AgentDef): AgentState {
  try {
    if (!existsSync(def.rulePath)) return { def, exists: false, rules: {} };
    const rules = parseRules(def);
    return { def, exists: true, rules };
  } catch (err) {
    return { def, exists: true, rules: {}, error: String(err) };
  }
}

function parseRules(def: AgentDef): RuleMap {
  const rules: RuleMap = {};
  if (def.style === "flat" || def.style === "mixed") {
    if (existsSync(def.rulePath)) {
      const content = readFileSync(def.rulePath, "utf8").trim();
      // For flat files, split by '---' or major headings to support multiple rules
      const sections = content.split(/\n---\n|\n## /).filter(s => s.trim());
      if (sections.length > 1) {
        sections.forEach((section, idx) => {
          const id = `rule-${idx + 1}`;
          const { frontmatter, body } = parseFrontmatter(section);
          rules[id] = {
            id,
            content: body || section,
            description: frontmatter.description || `Rule ${idx + 1}`,
            globs: frontmatter.globs,
            alwaysApply: !!frontmatter.alwaysApply,
            metadata: frontmatter
          };
        });
      } else {
        const id = def.id === "copilot" ? "copilot-instructions" : def.id;
        const { frontmatter, body } = parseFrontmatter(content);
        rules[id] = {
          id,
          content: body || content,
          description: frontmatter.description || `Rules for ${def.name}`,
          globs: frontmatter.globs,
          alwaysApply: !!frontmatter.alwaysApply,
          metadata: frontmatter
        };
      }
    }
  } else if (def.style === "dir") {
    if (existsSync(def.rulePath)) {
      const files = readdirSync(def.rulePath).filter(f => f.endsWith(".md") || f.endsWith(".mdc"));
      for (const file of files) {
        const raw = readFileSync(join(def.rulePath, file), "utf8");
        const { frontmatter, body } = parseFrontmatter(raw);
        const id = file.replace(/\.(md|mdc)$/, "");
        rules[id] = {
          id,
          content: body,
          description: frontmatter.description || id,
          globs: frontmatter.globs,
          alwaysApply: !!frontmatter.alwaysApply,
          metadata: frontmatter
        };
      }
    }
  }
  return rules;
}

export function renderRules(def: AgentDef, rules: RuleMap): string {
  if (def.style === "dir") return "";
  // For flat, use --- separators for multiple rules
  return Object.values(rules).map(r => {
    const front = makeFrontmatter(r.metadata || {});
    return front + r.content;
  }).join("\n\n---\n\n") + "\n";
}

export function writeDirRules(ruleDir: string, rules: RuleMap) {
  if (!existsSync(ruleDir)) mkdirSync(ruleDir, { recursive: true });
  for (const [id, rule] of Object.entries(rules)) {
    const front: Record<string, any> = {};
    if (rule.description) front.description = rule.description;
    if (rule.globs) front.globs = rule.globs;
    if (rule.alwaysApply) front.alwaysApply = true;
    const content = makeFrontmatter(front) + rule.content + "\n";
    writeFileSync(join(ruleDir, id + ".md"), content);
  }
}
