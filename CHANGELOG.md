# Changelog

## Workspace — 2026-07-09

### Changed
- Local monorepo path is now **`~/Documents/development`** (was `~/Documents/ai-agent-tools`)
- Projects live as sibling folders: `instruct-sync/`, `ai-setup-doctor/`, …
- Root CI (`.github/workflows/ci.yml`) builds **both** `instruct-sync` and `ai-setup-doctor` (Node 20 + 22 matrix)

### Added
- **ai-setup-doctor** (project 2) — scaffolded CLI for read-only AI coding setup diagnostics (agents, MCP configs, secrets risk, Node/hygiene). Zero runtime deps. Build/test green; not published to npm yet.

## [0.2.0-beta.0] - 2026-07-09

### Publish note
- npm package published as **`ai-instruct-sync`** (the name `instruct-sync` is taken on npm by an unrelated project).
- CLI binaries: `ai-instruct-sync` and `instruct-sync`.

## [0.2.0] - 2026-07-09

### Added
- `convert --from <agent> [--to <agent>] [--json]` command
- `init [dir]` command to scaffold sample rules
- `--cwd <dir>` support on all commands
- `--apply` + `--yes` for writing changes (dry-run is now the safe default)
- `--json` output for status, diff, list, clients, validate, convert
- Support for Continue.dev + improved Aider adapter
- Better flat-file parsing (leading frontmatter stripping + heading cleanup)
- Multi-line content in `diff` output
- Enhanced `validate` with more checks (TODOs, description length)
- `npm run demo` convenience script

### Changed
- Safer UX: sync now defaults to dry-run
- Improved rule ID extraction for flat files (no more garbage IDs like "---")
- Updated READMEs and help text for all new features
- Version bumped and publishing workflow documented

### Fixed
- Various parser edge cases for flat Markdown rule files

## [0.1.0] - 2026-07-08

### Added
- Initial release of instruct-sync CLI
- Support for Cursor, Windsurf, GitHub Copilot, Claude Code, Gemini CLI, Aider
- Commands: status, diff, list, clients, sync, validate
- Safe sync with backups, dry-run, merge/replace/prune
- Frontmatter parsing and directory-based rules
- Zero runtime dependencies
- Basic tests and CI

### Features
- High-signal tool for AI coding rules/instructions sync
- Based on broader AI agent tooling research
