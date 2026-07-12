# Demo — agent-skill-scan

**Package:** `agent-skill-scan`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
agent-skill-scan — security scan for agent skills, MCP servers, rules files, and hooks

Detects prompt injection, secret exfiltration, hidden-instruction Unicode,
dangerous shell patterns, hardcoded MCP credentials, and install-time hooks.
Read-only: nothing is modified or sent anywhere.

Usage
  agent-skill-scan [scan] [options]

Commands
  scan           Run the scan (default)
  help           Show this help

Options
  --cwd <dir>       Project directory (default: .)
  --json            Machine-readable output
  --strict          Exit 1 on medium findings as well as critical/high
  --min-score <n>   Exit 1 if score is below n (0-100)
  --only <list>     Only these categories (comma-separated)
  --skip <list>     Skip categories
  --no-user         Ignore user-home locations (project only)
  --max-files <n>   Per-root file cap for skill directories (default 400)
  --verbose, -v     Show category breakdown and extra detail

Categories
  skills, mcp, rules, hooks

Exit codes
  0  clean (or low/medium only, without --strict)
  1  critical or high findings (with --strict: medium too; also --min-score misses)
  2  usage error

Examples
  npx agent-skill-scan
  npx agent-skill-scan --cwd ./my-app --json
  npx agent-skill-scan --only skills,mcp --verbose
  npx agent-skill-scan --strict --min-score 80
```

## Try it

```bash
npx agent-skill-scan@0.1.0-alpha.1 --help
# or from monorepo:
cd agent-skill-scan && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
