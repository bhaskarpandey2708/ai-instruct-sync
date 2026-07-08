# instruct-sync

**One command to keep your AI coding rules and instructions in sync across every AI agent you use.**

Rules drift between Cursor, Windsurf, Copilot, Aider, Gemini CLI, and others. This tool detects, diffs, and syncs them safely.

```bash
npx instruct-sync status
npx instruct-sync sync --from cursor --dry-run
```

## Features
- Zero runtime dependencies
- Safe backups before any write
- Merge by default (or --replace / --prune)
- Understands flat files and directory-based rules with frontmatter
- Works for any AI coding tool

## Install
```bash
npx instruct-sync status
```

## Commands
- status
- diff
- sync --from <agent> [--dry-run] [--replace] [--prune]

## Research Context
This is the primary project in the broader AI agent tooling research track. See ../ai-agent-roadmap.md

## Contributing
PRs for new agent support welcome.
