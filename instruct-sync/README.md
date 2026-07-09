# instruct-sync

**Keep your AI coding rules in sync across every agent you use — one CLI.**

[![npm](https://img.shields.io/npm/v/ai-instruct-sync/beta?label=ai-instruct-sync)](https://www.npmjs.com/package/ai-instruct-sync)
[![Node](https://img.shields.io/node/v/ai-instruct-sync)](https://www.npmjs.com/package/ai-instruct-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

You write rules in Cursor. Then again for Copilot. Then Claude. Then Windsurf.  
They drift. You forget which copy is truth. **instruct-sync** fixes that.

```bash
npx ai-instruct-sync@beta status
npx ai-instruct-sync@beta sync --from cursor --dry-run
```

> **npm name:** `ai-instruct-sync` · **CLI:** `ai-instruct-sync` / `instruct-sync`  
> (`instruct-sync` was already taken on npm by an unrelated package.)

---

## Why it exists

AI coding tools each store “how I want you to code” in different places:

| Tool | Typical rules location |
|------|------------------------|
| Cursor | `.cursor/rules/` |
| Windsurf | `.windsurf/rules/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| Aider | `.aider/instructions.md` |
| Continue | `.continue/rules/` |

**instruct-sync** detects those files, shows drift, and syncs them safely.

---

## Features

- **Zero runtime dependencies** — Node built-ins only  
- **Safe by default** — dry-run first; backups under `~/.instruct-sync/backups/`  
- **Real formats** — directory rules + YAML frontmatter *and* flat Markdown  
- **Full toolkit** — `status` · `diff` · `sync` · `convert` · `validate` · `init` · `list` · `clients`  
- **Scriptable** — `--json`, `--cwd`, `--apply`, `--yes`  
- **Cross-platform** — Node ≥ 20  

---

## Install

```bash
# one-shot
npx ai-instruct-sync@beta

# or global
npm install -g ai-instruct-sync@beta
```

---

## Quick start

```bash
# 1. Optional: scaffold sample rules
npx ai-instruct-sync@beta init .

# 2. See what agents you already have
npx ai-instruct-sync@beta status

# 3. See exact differences
npx ai-instruct-sync@beta diff

# 4. Preview sync (Cursor → everyone else)
npx ai-instruct-sync@beta sync --from cursor --dry-run

# 5. Apply when you're happy
npx ai-instruct-sync@beta sync --from cursor --apply
```

---

## Commands

| Command | What it does |
|---------|----------------|
| `status` | Detected agents + rule counts |
| `diff` | Full content differences between agents |
| `list` | List rules across agents |
| `clients` | Supported tools and paths |
| `convert --from <agent>` | Export rules (`--to`, `--json`) |
| `sync --from <agent>` | Sync (dry-run by default; use `--apply` to write) |
| `validate` | Lint for bloat, TODOs, odd IDs |
| `init [dir]` | Scaffold sample rules |

### Useful flags

| Flag | Meaning |
|------|---------|
| `--cwd <dir>` | Run against another project |
| `--json` | Machine-readable output |
| `--apply` | Actually write files |
| `--yes` / `-y` | Skip confirmation |
| `--replace` / `--prune` | Sync strategy options |

```bash
npx ai-instruct-sync@beta --help
```

---

## Example workflow

```text
You maintain rules in Cursor (.cursor/rules).
Teammates use Copilot + Claude Code.

$ npx ai-instruct-sync@beta status
  ● Cursor              4 rules
  ● GitHub Copilot      2 rules
  ● Claude Code         1 rule

$ npx ai-instruct-sync@beta sync --from cursor --dry-run
  → would update copilot, claude-code …

$ npx ai-instruct-sync@beta sync --from cursor --apply --yes
  ✓ synced (backup saved)
```

---

## Safety

- Sync **defaults to dry-run** — nothing is written until `--apply`
- Writes create **backups** under `~/.instruct-sync/backups/`
- Prefer **merge** (default) over blind replace until you trust the plan

---

## Development

This package lives in the monorepo under `instruct-sync/`.

```bash
cd instruct-sync
npm install
npm run build
npm test
npm run demo
```

Issues & PRs: [github.com/bhaskarpandey2708/ai-instruct-sync](https://github.com/bhaskarpandey2708/ai-instruct-sync)  
New agent adapters: edit `src/clients.ts`.

---

## License

MIT © Bhaskar Pandey
