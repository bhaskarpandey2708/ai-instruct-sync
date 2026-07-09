import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { AgentDef, AgentState, Rule, RuleMap } from "./types.js";

export function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
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
        val = val.slice(1, -1).split(',').map((s: string) => s.trim().replace(/"/g, ''));
      }
      front[kv[1]] = val;
    }
  }
  return { frontmatter: front, body: match[2].trim() };
}

export function makeFrontmatter(front: Record<string, any>): string {
  const lines = Object.entries(front).map(([k, v]: [string, any]) => {
    if (Array.isArray(v)) return `${k}: [${v.map((x: string) => `"${x}"`).join(', ')}]`;
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
    { id: "aider", name: "Aider", rulePath: join(cwd, ".aider", "instructions.md"), style: "flat", docsUrl: "" },
    { id: "continue", name: "Continue.dev", rulePath: join(cwd, ".continue", "rules"), style: "dir", docsUrl: "" }
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
      let content = readFileSync(def.rulePath, "utf8").trim();
      // Remove leading/trailing frontmatter block if present (common in Copilot style)
      content = content.replace(/^\s*---\s*[\s\S]*?---\s*\n?/, '').trim();
      // Split flat files on --- or ## headings to support multi-rule docs
      const sections = content.split(/\n---\s*\n|\n##\s+/).filter((s: string) => s.trim());
      if (sections.length > 1) {
        sections.forEach((section: string, idx: number) => {
          const { frontmatter, body } = parseFrontmatter(section.trim());
          // Try to derive a nice ID from frontmatter, first heading, or description
          let id = frontmatter.name || frontmatter.id || '';
          let firstLine = '';
          if (!id) {
            // Look for a heading-like first line
            firstLine = (body || section).split('\n')[0].trim().replace(/^#+\s*/, '').replace(/[^a-zA-Z0-9- ]/g, '').trim();
            id = firstLine || `rule-${idx + 1}`;
          }
          id = id.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `rule-${idx + 1}`;
          let content = body || section;
          // Clean content: strip leading markdown heading (with or without #) if present
          content = content.replace(/^\s*#+\s*[^\n]*\n?/, '').trim();
          const titleForStrip = firstLine || (frontmatter.description || '');
          if (titleForStrip && content.toLowerCase().startsWith(titleForStrip.toLowerCase())) {
            content = content.substring(titleForStrip.length).trim();
          }
          rules[id] = {
            id,
            content: content,
            description: frontmatter.description || firstLine || `Rule ${idx + 1}`,
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
