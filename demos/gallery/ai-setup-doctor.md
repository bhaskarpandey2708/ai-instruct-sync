# Demo — ai-setup-doctor

**Package:** `ai-setup-doctor`  
**Version:** `0.1.0-beta.0`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
ai-setup-doctor — diagnose AI coding setup issues

Usage
  ai-setup-doctor [check] [options]

Commands
  check          Run diagnostics (default)
  help           Show this help

Options
  --cwd <dir>       Project directory (default: .)
  --json            Machine-readable output
  --strict          Exit 1 on warnings as well as errors
  --min-score <n>   Exit 1 if score is below n (0-100)
  --only <list>     Only these categories (comma-separated)
  --skip <list>     Skip categories
  --no-user         Ignore user-home MCP configs (project only)
  --quiet, -q       Hide ok checks (show issues only)
  --verbose, -v     Always show detail lines + categories + breakdown

Categories
  runtime, agents, mcp, secrets, hygiene

Examples
  npx ai-setup-doctor
  npx ai-setup-doctor check --cwd ./my-app
  npx ai-setup-doctor --json --strict
  npx ai-setup-doctor --only secrets,mcp --verbose
  npx ai-setup-doctor --quiet --min-score 80
  npx ai-setup-doctor --skip runtime --no-user
```

## Try it

```bash
npx ai-setup-doctor@0.1.0-beta.0 --help
# or from monorepo:
cd ai-setup-doctor && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
