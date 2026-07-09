#!/usr/bin/env node
import { parseArgs } from "node:util";
import { getAgents, loadAgentState } from "./clients.js";
import { planSync, applyPlan, rulesEqual, validateRules } from "./core.js";
import type { AgentState, AgentDef } from "./types.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

interface CLIFlags {
  from?: string;
  to?: string;
  "dry-run"?: boolean;
  apply?: boolean;
  replace?: boolean;
  prune?: boolean;
  cwd?: string;
  yes?: boolean;
  json?: boolean;
  help?: boolean;
}

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code: number) => (s: string) => useColor ? `\x1b[${code}m${s}\x1b[0m` : s;
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const dim = paint(2);
const bold = paint(1);

function loadAll(cwd?: string) {
  return getAgents(cwd).map(loadAgentState);
}

function cmdStatus(cwd?: string) {
  const states = loadAll(cwd);
  console.log(bold("AI Agents (rules/instructions)"));
  for (const s of states) {
    const count = Object.keys(s.rules).length;
    let line: string;
    if (s.error) {
      line = `${red("✗")} ${s.def.name.padEnd(18)} error: ${s.error}`;
    } else if (s.exists) {
      line = `${green("●")} ${s.def.name.padEnd(18)} ${count} rule${count === 1 ? "" : "s"}  ${dim(s.def.rulePath)}`;
    } else {
      line = `${dim("○")} ${dim(s.def.name.padEnd(18))} not detected`;
    }
    console.log("  " + line);
  }

  const detected = states.filter((s: AgentState) => s.exists && !s.error);
  if (detected.length > 1) {
    const names = new Set<string>();
    detected.forEach((s: AgentState) => Object.keys(s.rules).forEach(n => names.add(n)));
    const drifted = [...names].some(name => !detected.every((s: AgentState) => s.rules[name]?.content === detected[0].rules[name]?.content));
    console.log();
    if (names.size === 0) {
      console.log(dim("  No rules configured anywhere yet."));
    } else if (!drifted) {
      console.log(green("  ✓ Rules look consistent across detected agents."));
    } else {
      console.log(yellow("  ⚠ Some drift detected. Run 'instruct-sync diff' for details."));
    }
  }
}

function cmdDiff(cwd?: string, asJson = false) {
  const states = loadAll(cwd).filter((s: AgentState) => s.exists && !s.error);
  const names = new Set<string>();
  states.forEach((s: AgentState) => Object.keys(s.rules).forEach(n => names.add(n)));

  if (asJson) {
    const diffs = [...names].filter(name => {
      const contents = states.map(s => s.rules[name]?.content);
      return new Set(contents).size > 1;
    }).map(name => {
      const entries: any = {};
      states.forEach(s => {
        entries[s.def.id] = s.rules[name] ? s.rules[name].content : null;
      });
      return { name, entries };
    });
    console.log(JSON.stringify({ diffs }, null, 2));
    return;
  }

  let hasDiff = false;
  for (const name of [...names].sort()) {
    const contents = states.map((s: AgentState) => s.rules[name]?.content);
    if (new Set(contents).size > 1) {
      hasDiff = true;
      console.log(yellow(`⚠ ${bold(name)}`));
      states.forEach((s: AgentState) => {
        const rule = s.rules[name];
        if (rule) {
          const lines = rule.content.split('\n');
          console.log(`  ${s.def.id}:`);
          lines.forEach(line => console.log(`    ${line}`));
        } else {
          console.log(`  ${s.def.id}: (missing)`);
        }
      });
      console.log();
    }
  }
  if (!hasDiff) console.log(green("✓ Everything in sync."));
}

function cmdList(cwd?: string, asJson = false) {
  const states = loadAll(cwd).filter((s: AgentState) => s.exists && !s.error);
  const names = new Set<string>();
  states.forEach((s: AgentState) => Object.keys(s.rules).forEach(n => names.add(n)));

  if (asJson) {
    const list = [...names].sort().map(name => {
      const entries: any = {};
      states.forEach(s => { if (s.rules[name]) entries[s.def.id] = s.rules[name]; });
      return { name, agents: entries };
    });
    console.log(JSON.stringify({ rules: list }, null, 2));
    return;
  }

  for (const name of [...names].sort()) {
    console.log(bold(name));
    states.forEach((s: AgentState) => {
      const rule = s.rules[name];
      if (rule) {
        console.log(`  ${s.def.id}: ${rule.description || ''} ${dim(rule.content.substring(0, 60))}`);
      }
    });
  }
}

function cmdClients(cwd?: string, asJson = false) {
  if (asJson) {
    console.log(JSON.stringify(getAgents(cwd), null, 2));
    return;
  }
  console.log(bold("Supported agents"));
  getAgents(cwd).forEach((def: AgentDef) => {
    console.log(`  ${def.id.padEnd(16)} ${def.name.padEnd(20)} ${dim(def.rulePath)}`);
  });
}

function cmdConvert(flags: any) {
  const cwd = flags.cwd;
  const from = flags.from;
  const to = flags.to;
  const asJson = !!flags.json;

  if (!from) {
    console.error(red("Missing --from <agent> for convert"));
    return 2;
  }
  const states = loadAll(cwd);
  const source = states.find((s: AgentState) => s.def.id === from);
  if (!source || !source.exists) {
    console.error(red(`Source ${from} not found or has no rules.`));
    return 2;
  }

  const targetDef = to ? states.find((s: AgentState) => s.def.id === to) : null;
  const useHeadings = !targetDef || ['copilot', 'claude-code', 'gemini'].includes(targetDef.def.id);

  if (asJson) {
    console.log(JSON.stringify({
      from: source.def.id,
      to: targetDef ? targetDef.def.id : null,
      rules: Object.entries(source.rules).map(([id, rule]) => ({
        id,
        description: rule.description,
        content: rule.content
      }))
    }, null, 2));
    return 0;
  }

  let header = `Rules converted from ${source.def.name}`;
  if (targetDef) header += ` to ${targetDef.def.name} style`;
  console.log(bold(header + ":"));

  Object.entries(source.rules).forEach(([id, rule]) => {
    const title = rule.description || id;
    if (useHeadings) {
      console.log(`\n## ${title}\n`);
    } else {
      console.log(`\n### ${title}\n`);
    }
    console.log(rule.content);
  });
  return 0;
}

function cmdInit(targetDir?: string, yes = false) {
  const target = targetDir || process.cwd();
  const samples = [
    {
      agent: "cursor",
      path: join(target, ".cursor", "rules", "example-rule.md"),
      content: `---
description: Example rule - replace with your guidelines
---
This is a sample rule. Edit or delete it.
Use your own best practices here.`
    },
    {
      agent: "copilot",
      path: join(target, ".github", "copilot-instructions.md"),
      content: `## Project Guidelines

Follow best practices.
Keep code clean and documented.

## Coding Standards

Always use TypeScript.
Write clear comments.`
    }
  ];

  console.log(bold(`Initializing sample rules in ${target}...`));
  samples.forEach(s => {
    mkdirSync(dirname(s.path), { recursive: true });
    writeFileSync(s.path, s.content);
    console.log(`  Created ${s.path}`);
  });
  console.log(green("Done. Edit the files to match your project."));
}

function cmdSync(flags: CLIFlags) {
  const cwd = flags.cwd;
  const states = loadAll(cwd);
  const from = flags.from;
  if (!from) {
    console.error(red("Missing --from <agent>"));
    return 2;
  }
  const source = states.find((s: AgentState) => s.def.id === from);
  if (!source || !source.exists) {
    console.error(red(`Source ${from} has no rules.`));
    return 2;
  }

  const apply = !!flags.apply;
  const explicitDryRun = flags["dry-run"] === true;
  const dryRun = explicitDryRun || !apply;   // --dry-run forces dry, --apply enables write (default dry)

  if (apply && !flags.yes) {
    console.log(yellow("Refusing to apply without --yes (safety). Use --apply --yes to write changes."));
    return 1;
  }

  const targets = states.filter((s: AgentState) => s.def.id !== from && s.exists && !s.error);
  console.log(`${dryRun ? bold("[dry-run] ") : ""}Syncing from ${bold(source.def.name)}`);

  let anyChanges = false;
  targets.forEach((t: AgentState) => {
    const plan = planSync(source.rules, t, { replace: !!flags.replace, prune: !!flags.prune });
    if (!plan.changed) {
      console.log(`  ${green("✓")} ${t.def.name} already in sync`);
      return;
    }
    anyChanges = true;
    console.log(`  ${yellow("→")} ${t.def.name} +${plan.added.length} ~${plan.updated.length} -${plan.removed.length}`);
    if (!dryRun) {
      const res = applyPlan(plan);
      if (res.backupPath) console.log(dim(`      backup: ${res.backupPath}`));
    }
  });
  if (!dryRun && anyChanges) {
    console.log(green("Done. Changes applied."));
  } else if (anyChanges) {
    console.log(yellow("Dry run — no changes written. Re-run with --apply to write."));
  }
  return 0;
}

const HELP = `${bold("instruct-sync")} — keep AI coding rules in sync across agents

${bold("Usage")}
  instruct-sync <command> [options]

${bold("Commands")}
  status
  diff
  list
  clients
  convert --from <agent>
  sync --from <agent>
  validate
  init [dir]

${bold("Options")}
  --from <agent>   Source agent
  --dry-run        Preview only (default for sync)
  --apply          Actually write changes (use with --yes to skip prompt)
  --replace
  --prune
  --cwd <dir>      Operate on a different directory
  --yes, -y        Skip confirmation prompts
  --json           Output as JSON (for status, diff, etc.)

Examples
  npx instruct-sync status
  npx instruct-sync diff
  npx instruct-sync list
  npx instruct-sync clients
  npx instruct-sync convert --from cursor
  npx instruct-sync convert --from cursor --to copilot
  npx instruct-sync convert --from cursor --json
  npx instruct-sync convert --from cursor --to copilot --json
  npx instruct-sync sync --from cursor --dry-run
  npx instruct-sync sync --from cursor --apply
  npx instruct-sync init ./my-project
  npx instruct-sync --cwd ./my-project validate
  npx instruct-sync status --json
  npx instruct-sync diff --json
  npx instruct-sync list --json
  npx instruct-sync clients --json
  npx instruct-sync validate --json
`;

export function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      from: { type: "string" },
      to: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      apply: { type: "boolean", default: false },
      replace: { type: "boolean", default: false },
      prune: { type: "boolean", default: false },
      cwd: { type: "string" },
      yes: { type: "boolean", short: "y", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  const cmd = positionals[0] || "status";
  if (values.help || cmd === "help") {
    console.log(HELP);
    return 0;
  }

  const cwd = values.cwd;
  const initDir = (cmd === "init" && positionals[1]) ? positionals[1] : cwd;

  switch (cmd) {
    case "status":
      if (values.json) {
        const states = loadAll(cwd);
        console.log(JSON.stringify(states.map(s => ({
          id: s.def.id,
          name: s.def.name,
          rules: Object.keys(s.rules).length,
          error: s.error || null
        })), null, 2));
        return 0;
      }
      cmdStatus(cwd);
      return 0;
    case "diff":
      cmdDiff(cwd, !!values.json);
      return 0;
    case "list":
      cmdList(cwd, !!values.json);
      return 0;
    case "clients":
      cmdClients(cwd, !!values.json);
      return 0;
    case "convert":
      return cmdConvert(values);
    case "init":
      cmdInit(initDir, !!values.yes);
      return 0;
    case "sync":
      return cmdSync({ ...values, cwd });
    case "validate":
      const states = loadAll(cwd).filter((s: AgentState) => s.exists);
      if (values.json) {
        const result = states.map(s => ({ id: s.def.id, issues: validateRules(s.rules) }));
        console.log(JSON.stringify({ validation: result }, null, 2));
        return 0;
      }
      states.forEach((s: AgentState) => {
        const issues = validateRules(s.rules);
        if (issues.length) {
          console.log(yellow(`⚠ ${s.def.name}`));
          issues.forEach((i: string) => console.log(`  - ${i}`));
        } else {
          console.log(green(`✓ ${s.def.name} looks good`));
        }
      });
      return 0;
    default:
      console.log(HELP);
      return 0;
  }
}

process.exitCode = main(process.argv.slice(2));

