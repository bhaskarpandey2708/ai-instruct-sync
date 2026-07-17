---
name: software-development
description: >
  Senior software engineering for this monorepo (20+ years bar). TypeScript/Node
  ESM CLIs, zero runtime deps, tests, packaging. Use when building features,
  fixing bugs, deepening P0X CLIs, /software-development, implementing product code.
---

# Software development — staff+/principal engineer bar

Ship small, correct, testable CLIs. Prefer boring code that survives `npx` cold start.

## Suite conventions (mandatory)

| Rule | Detail |
|------|--------|
| Runtime | Node 20+, ESM `"type": "module"` |
| Deps | **Zero runtime dependencies** unless owner approves |
| Bins | Dual names (long + short) when product is CLI |
| Flags | `--json`, `--help`, read-only/dry-run by default where it fits |
| Tests | `node --test`, hermetic fixtures, no live network |
| Secrets | Never literal exfil domains / reverse shells / live key prefixes — concatenate in source |
| Build | Prefer simple JS or `scripts/build.mjs` transpile pattern (see ai-setup-doctor) |
| Severity | ok / info / warn / error; scores /100 when scanning |

## Engineering judgment

1. **Depth over scaffold** — if posting publicly, human output + real fixtures + exit codes beat JSON dump of `{ ok: true }`.
2. **CLI UX** — TTY colors with `NO_COLOR`; exit 0/1/2 meaningful for CI.
3. **Schema flexibility** — accept real-world aliases (`input_tokens` / `inputTokens`) when parsing exports.
4. **Pricing / heuristics** — document “budget-accurate, not invoice-exact.”
5. **Files field** — never ship `story_v2` scratch, wav workdirs, or `.tgz` in npm `files`.

## Workflow

1. Read existing product code + tests before rewriting
2. Implement core pure functions first; CLI is a thin adapter
3. Fixtures: happy path + fail/strict path
4. `npm test` green; demo script prints human-readable path
5. Bump version if already published (npm does not overwrite)

## Code taste

- Small modules (`prices.js`, `core.js`, `cli.js`) over god files
- No premature framework
- Explicit errors; never swallow parse failures silently on CLI
- Prefer `node:fs` / `node:path` / `node:util` builtins

## Anti-patterns

- Adding Express/React for a local rollup CLI
- Publishing same version after code change
- Tests that only check “does not throw” on empty object (insufficient for ship)
- Hand-editing generated portfolio CSV/XLSX

## Verify

```bash
cd <product> && npm test && npm run demo
# from root when suite-wide:
node scripts/suite-litmus.mjs
```
