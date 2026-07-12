# Demo — pr-triage

**Package:** `@bhaskarauthor/pr-triage`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
pr-triage — risk-rank a diff so humans review the 20% that matters

Reads a unified diff (git diff / PR patch), scores every hunk on blast radius,
removed error handling, missing test changes, placeholder/AI artifacts, and
credential-shaped strings — then ranks them. Read-only, offline, zero deps.

Usage
  pr-triage [diff-file] [options]     rank a saved diff/patch file
  git diff main | pr-triage           rank from stdin
  pr-triage --ref main                run git diff <ref> itself

Options
  --ref <ref>       Diff working tree against a git ref (uses local git)
  --cwd <dir>       Repo directory for --ref (default: .)
  --top <n>         Show top N hunks (default 20)
  --json            Machine-readable report
  --min-score <n>   Exit 1 if the top hunk scores >= n (CI attention gate)

Exit codes
  0 ranked OK · 1 --min-score tripped · 2 usage error
```

## Try it

```bash
npx @bhaskarauthor/pr-triage@0.1.0-alpha.1 --help
# or from monorepo:
cd pr-triage && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
