# instruct-sync

**One command to keep AI coding rules in sync across Cursor, Windsurf, Copilot, Claude, Aider, Gemini, Continue, and more.**

[![npm beta](https://img.shields.io/npm/v/ai-instruct-sync/beta?label=npm%20ai-instruct-sync)](https://www.npmjs.com/package/ai-instruct-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

```bash
npx ai-instruct-sync@beta status
npx ai-instruct-sync@beta sync --from cursor --dry-run
```

---

## The problem

Every AI coding tool wants its own rules file. You end up with:

- `.cursor/rules/`
- `.github/copilot-instructions.md`
- `CLAUDE.md`
- `.windsurf/rules/`
- …and more

They **drift**. Reviews get messy. Agents disagree about your style.

## The fix

**instruct-sync** detects, diffs, converts, and syncs those rules — safely (dry-run by default, automatic backups).

| You want… | Run… |
|-----------|------|
| See what's installed | `npx ai-instruct-sync@beta status` |
| See drift | `npx ai-instruct-sync@beta diff` |
| Preview sync from Cursor | `npx ai-instruct-sync@beta sync --from cursor --dry-run` |
| Apply | `npx ai-instruct-sync@beta sync --from cursor --apply` |
| Bootstrap samples | `npx ai-instruct-sync@beta init .` |

**Package on npm:** [`ai-instruct-sync`](https://www.npmjs.com/package/ai-instruct-sync)  
**Source:** [`instruct-sync/`](./instruct-sync) · full docs in [instruct-sync/README.md](./instruct-sync/README.md)

---

## Install

```bash
npm install -g ai-instruct-sync@beta
# or always via npx
npx ai-instruct-sync@beta
```

Requires **Node.js 20+**. Zero runtime dependencies.

---

## Supported agents

Cursor · Windsurf · GitHub Copilot · Claude Code · Gemini CLI · Aider · Continue.dev  

Want another? Open an issue or PR on `src/clients.ts`.

---

## Why trust it?

- **Safe defaults** — dry-run unless you pass `--apply`
- **Backups** on write → `~/.instruct-sync/backups/`
- **`--json`** for CI/scripts
- **MIT** licensed, open source

---

## Repo layout

This repository is the **home of instruct-sync** and its sibling tools — an **AI dev hygiene suite** (sync → diagnose → secure → control spend) sharing one audience and the npx flywheel:

| Path | Product | Status |
|------|---------|--------|
| **[`instruct-sync/`](./instruct-sync)** | P01 rules sync | **npm** `ai-instruct-sync@beta` |
| [`ai-setup-doctor/`](./ai-setup-doctor) | P02 diagnostics | **npm** `ai-setup-doctor@beta` |
| [`mcp-sync/`](./mcp-sync) | P03 MCP config sync | **npm** `mcp-config-sync` (own GitHub remote) |
| [`secret-guard/`](./secret-guard) | P04 AI-path secrets | local MVP · litmus green |
| [`llm-spend/`](./llm-spend) … [`api-contract-sentinel/`](./api-contract-sentinel) | **P05–P28** | **Alpha cycle closed** (`0.1.0-alpha.1`) + litmus + cycle tests + demo |
| [`agent-skill-scan/`](./agent-skill-scan) | P29 skills security | scaffolded |

`mcp-sync/` is co-located for the suite but has its **own git remote** (`github.com/bhaskarpandey2708/mcp-sync`).

### Suite verification

```bash
# All product litmus + cycle tests
node scripts/suite-litmus.mjs

# Rebuild demo gallery (CLI captures for every package)
node scripts/build-all-demos.mjs

# Status / demos
open demos/gallery/INDEX.md   # or: cat demos/gallery/INDEX.md
cat SUITE_STATUS.md
```

**Demos:** [demos/gallery/INDEX.md](./demos/gallery/INDEX.md)  
**Publish log:** [logs/publish-results.json](./logs/publish-results.json)  
**Memory:** [WORKSPACE_MEMORY.md](./WORKSPACE_MEMORY.md)

### npm (public)

| Package | Install |
|---------|---------|
| instruct-sync | `npx ai-instruct-sync@beta` |
| ai-setup-doctor | `npx ai-setup-doctor@beta` |
| mcp-sync | `npx mcp-config-sync` |
| secret-guard | `npx ai-secret-guard@0.1.0-beta.1` |
| agent-skill-scan | `npx agent-skill-scan@0.1.0-alpha.1` |
| P05–P28 alphas | `npx @bhaskarauthor/<name>@0.1.0-alpha.1` |

Examples: `npx @bhaskarauthor/eval-harness@0.1.0-alpha.1`, `npx @bhaskarauthor/sbom-lite@0.1.0-alpha.1`

### P05–P28 offline MVPs

Each folder has `src/core.js` (domain logic), `tests/litmus.test.mjs`, `demo/run-demo.mjs`, MIT license.  
Zero runtime deps. Commercial hosted layers later; OSS cores stay free.

```bash
cd eval-harness && npm test && npm run demo
cd api-contract-sentinel && npm test && npm run demo
```

If you're here for rules sync, start with **`instruct-sync`**.

**Workspace orientation:** [CLAUDE.md](./CLAUDE.md) · [SOFTWARE_PORTFOLIO_INDEX.md](./SOFTWARE_PORTFOLIO_INDEX.md) · [WORKSPACE_MEMORY.md](./WORKSPACE_MEMORY.md)

---

## Contributing

```bash
cd instruct-sync
npm install
npm run build
npm test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs for new agent adapters are especially welcome.

## License

MIT
