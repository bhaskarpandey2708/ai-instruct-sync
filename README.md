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

| Path | Product | npm |
|------|---------|-----|
| **[`instruct-sync/`](./instruct-sync)** | **★ Main product** — rules/instructions sync CLI | [`ai-instruct-sync`](https://www.npmjs.com/package/ai-instruct-sync) |
| [`ai-setup-doctor/`](./ai-setup-doctor) | Diagnose AI coding setup (agents, MCP, secrets) | [`ai-setup-doctor`](https://www.npmjs.com/package/ai-setup-doctor) |
| [`mcp-sync/`](./mcp-sync) | MCP server config sync across AI clients | [`mcp-config-sync`](https://www.npmjs.com/package/mcp-config-sync) · [GitHub](https://github.com/bhaskarpandey2708/mcp-sync) |
| [`secret-guard/`](./secret-guard) | Secrets in AI rules / MCP env / prompts (CI + pre-commit) | `ai-secret-guard` (beta, local) |
| [`agent-skill-scan/`](./agent-skill-scan) | Security scan for agent skills, MCP servers, rules files | scaffolded |

`mcp-sync/` is co-located here for the hygiene suite but is its **own git repo** (pushes go to `github.com/bhaskarpandey2708/mcp-sync`, not this monorepo).

```bash
npx ai-setup-doctor@beta
```

If you're here for rules sync, start with **`instruct-sync`**.

**Workspace orientation for contributors/agents:** see [CLAUDE.md](./CLAUDE.md) and [SOFTWARE_PORTFOLIO_INDEX.md](./SOFTWARE_PORTFOLIO_INDEX.md) for the full product portfolio, strategy, and conventions.

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
