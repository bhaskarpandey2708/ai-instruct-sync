# instruct-sync

**One command to keep your AI coding rules and instructions in sync across every AI agent you use.**

Rules drift between Cursor, Windsurf, GitHub Copilot, Aider, Gemini CLI, Continue, and others. This tool detects, diffs, syncs, converts, and helps initialize them safely.

```bash
npx instruct-sync status
npx instruct-sync sync --from cursor --dry-run
```

## Features
- Zero runtime dependencies (Node built-ins only)
- Safe by default: automatic backups to `~/.instruct-sync/backups/`, dry-run by default, `--apply` to write
- Supports modern formats:
  - Directory-based rules with YAML frontmatter (Cursor, Windsurf, Continue, etc.)
  - Flat Markdown files (Copilot, Claude Code, Gemini, Aider, etc.)
- Full commands: `status`, `diff`, `list`, `clients`, `convert`, `sync`, `validate`, `init`
- Powerful flags: `--cwd`, `--json`, `--apply`, `--yes`, `--replace`, `--prune`
- Cross-agent conversion with basic style adaptation
- `init` command to bootstrap sample rules in any project
- Enhanced validation (length, bloat, TODOs, long descriptions)
- Clean multi-line diff output
- Cross-platform (Node ≥20)

## Installation

```bash
npm install -g instruct-sync
# or
npx instruct-sync
```

## Quick Start

```bash
# Scaffold samples in current directory
npx instruct-sync init .

# Inspect
npx instruct-sync status
npx instruct-sync diff

# Preview merge
npx instruct-sync sync --from cursor --dry-run

# Apply changes (add --yes to skip prompt)
npx instruct-sync sync --from cursor --apply
```

## Commands

| Command                  | Description                                      |
|--------------------------|--------------------------------------------------|
| `status`                 | Show detected agents and rule counts             |
| `diff`                   | Show exactly which rules differ (full content)   |
| `list`                   | List all rules across agents                     |
| `clients`                | List supported agents and config paths           |
| `convert --from <agent>` | Export rules (supports `--to`, `--json`)         |
| `sync --from <agent>`    | Sync rules (dry-run by default)                  |
| `validate`               | Lint rules for common issues                     |
| `init [dir]`             | Scaffold sample rules                            |

Run `instruct-sync --help` for all options.

## Local Development

```bash
cd instruct-sync
npm install
npm run build
npm test
npm run demo
```

## Publishing

```bash
npm run build
npm test
npm publish --tag beta   # or omit tag
```

## Contributing

PRs welcome, especially new agent adapters (see `src/clients.ts`).

## License

MIT
