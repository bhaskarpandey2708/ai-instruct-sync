# Demo — instruct-sync

**Package:** `ai-instruct-sync`  
**Version:** `0.2.0-beta.0`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
ai-instruct-sync — keep AI coding rules in sync across agents

Usage
  ai-instruct-sync <command> [options]

Commands
  status
  diff
  list
  clients
  convert --from <agent>
  sync --from <agent>
  validate
  init [dir]

Options
  --from <agent>   Source agent
  --dry-run        Preview only (default for sync)
  --apply          Actually write changes (use with --yes to skip prompt)
  --replace
  --prune
  --cwd <dir>      Operate on a different directory
  --yes, -y        Skip confirmation prompts
  --json           Output as JSON (for status, diff, etc.)

Examples
  npx ai-instruct-sync status
  npx ai-instruct-sync diff
  npx ai-instruct-sync list
  npx ai-instruct-sync clients
  npx ai-instruct-sync convert --from cursor
  npx ai-instruct-sync convert --from cursor --to copilot
  npx ai-instruct-sync convert --from cursor --json
  npx ai-instruct-sync convert --from cursor --to copilot --json
  npx ai-instruct-sync sync --from cursor --dry-run
  npx ai-instruct-sync sync --from cursor --apply
  npx ai-instruct-sync init ./my-project
  npx ai-instruct-sync --cwd ./my-project validate
  npx ai-instruct-sync status --json
  npx ai-instruct-sync diff --json
  npx ai-instruct-sync list --json
  npx ai-instruct-sync clients --json
  npx ai-instruct-sync validate --json
```

## Try it

```bash
npx ai-instruct-sync@0.2.0-beta.0 --help
# or from monorepo:
cd instruct-sync && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
