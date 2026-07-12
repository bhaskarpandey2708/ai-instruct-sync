# Demo — agent-spend-guard

**Package:** `agent-spend-guard`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
agent-spend-guard — token budgets + kill-switch for AI coding agents

Reads real usage (Claude Code transcripts, generic event files), prices it,
and enforces daily / monthly / per-project USD budgets. Read-only; nothing
leaves your machine.

Usage
  agent-spend-guard [command] [options]

Commands
  status         Show spend vs budgets (default)
  check          Same as status but built for hooks/CI: exit 1 on STOP
  init           Write a sample .spend-guard.json to --cwd
  help           Show this help

Options
  --cwd <dir>        Project directory holding .spend-guard.json (default: .)
  --usage <file>     Add a usage file (repeatable): .jsonl transcript or JSON event array
  --no-user          Skip scanning ~/.claude/projects transcripts
  --json             Machine-readable report
  --strict           check: exit 1 on WARN as well as STOP
  --verbose, -v      Per-project breakdown

Kill-switch wiring
  Claude Code hook (settings.json → hooks.PreToolUse):
    { "type": "command", "command": "npx agent-spend-guard check --cwd ." }
  CI gate:
    npx agent-spend-guard check --strict

Config (.spend-guard.json)
  { "budgets": { "dailyUsd": 25, "monthlyUsd": 300,
                 "perProjectUsd": { "my-app": 100 }, "warnAtPct": 0.8 },
    "prices": { "claude-sonnet": { "input": 3, "output": 15 } } }

Exit codes
  0 ok/warn (status) · 1 stop (check; warn too with --strict) · 2 usage error
```

## Try it

```bash
npx agent-spend-guard@0.1.0-alpha.1 --help
# or from monorepo:
cd agent-spend-guard && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
