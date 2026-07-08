#!/usr/bin/env node
import { parseArgs } from "node:util";
import { getAgents, loadAgentState } from "./clients.js";
import { planSync, applyPlan, rulesEqual, validateRules } from "./core.js";

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code: number) => (s: string) => useColor ? `\x1b[${code}m${s}\x1b[0m` : s;
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const dim = paint(2);
const bold = paint(1);

function loadAll() {
  return getAgents().map(loadAgentState);
}

function cmdStatus() {
  const states = loadAll();
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

  const detected = states.filter(s => s.exists && !s.error);
  if (detected.length > 1) {
    const names = new Set<string>();
    detected.forEach(s => Object.keys(s.rules).forEach(n => names.add(n)));
    const drifted = [...names].some(name => !detected.every(s => s.rules[name]?.content === detected[0].rules[name]?.content));
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

function cmdDiff() {
  const states = loadAll().filter(s => s.exists && !s.error);
  const names = new Set<string>();
  states.forEach(s => Object.keys(s.rules).forEach(n => names.add(n)));

  let hasDiff = false;
  for (const name of [...names].sort()) {
    const contents = states.map(s => s.rules[name]?.content);
    if (new Set(contents).size > 1) {
      hasDiff = true;
      console.log(yellow(`⚠ ${bold(name)}`));
      states.forEach(s => {
        const c = s.rules[name]?.content || "(missing)";
        console.log(`  ${s.def.id}: ${c.substring(0, 80)}${c.length > 80 ? "..." : ""}`);
      });
    }
  }
  if (!hasDiff) console.log(green("✓ Everything in sync."));
}

function cmdList() {
  const states = loadAll().filter(s => s.exists && !s.error);
  const names = new Set<string>();
  states.forEach(s => Object.keys(s.rules).forEach(n => names.add(n)));

  for (const name of [...names].sort()) {
    console.log(bold(name));
    states.forEach(s => {
      const rule = s.rules[name];
      if (rule) {
        console.log(`  ${s.def.id}: ${rule.description || ''} ${dim(rule.content.substring(0, 60))}`);
      }
    });
  }
}

function cmdClients() {
  console.log(bold("Supported agents"));
  getAgents().forEach(def => {
    console.log(`  ${def.id.padEnd(16)} ${def.name.padEnd(20)} ${dim(def.rulePath)}`);
  });
}

function cmdSync(flags: any) {
  const states = loadAll();
  const from = flags.from;
  if (!from) {
    console.error(red("Missing --from <agent>"));
    return 2;
  }
  const source = states.find(s => s.def.id === from);
  if (!source || !source.exists) {
    console.error(red(`Source ${from} has no rules.`));
    return 2;
  }

  const targets = states.filter(s => s.def.id !== from && s.exists && !s.error);
  console.log(`${flags["dry-run"] ? bold("[dry-run] ") : ""}Syncing from ${bold(source.def.name)}`);

  targets.forEach(t => {
    const plan = planSync(source.rules, t, { replace: !!flags.replace, prune: !!flags.prune });
    if (!plan.changed) {
      console.log(`  ${green("✓")} ${t.def.name} already in sync`);
      return;
    }
    console.log(`  ${yellow("→")} ${t.def.name} +${plan.added.length} ~${plan.updated.length} -${plan.removed.length}`);
    if (!flags["dry-run"]) {
      const res = applyPlan(plan);
      if (res.backupPath) console.log(dim(`      backup: ${res.backupPath}`));
    }
  });
  if (!flags["dry-run"]) console.log(green("Done."));
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
  sync --from <agent>
  validate

${bold("Options")}
  --from <agent>   Source agent
  --dry-run
  --replace
  --prune

Examples
  npx instruct-sync status
  npx instruct-sync diff
  npx instruct-sync list
  npx instruct-sync clients
  npx instruct-sync sync --from cursor --dry-run
  npx instruct-sync validate
`;

export function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      from: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      replace: { type: "boolean", default: false },
      prune: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  const cmd = positionals[0] || "status";
  if (values.help || cmd === "help") {
    console.log(HELP);
    return 0;
  }

  switch (cmd) {
    case "status":
      cmdStatus();
      return 0;
    case "diff":
      cmdDiff();
      return 0;
    case "list":
      cmdList();
      return 0;
    case "clients":
      cmdClients();
      return 0;
    case "sync":
      return cmdSync(values);
    case "validate":
      const states = loadAll().filter(s => s.exists);
      states.forEach(s => {
        const issues = validateRules(s.rules);
        if (issues.length) {
          console.log(yellow(`⚠ ${s.def.name}`));
          issues.forEach(i => console.log(`  - ${i}`));
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

