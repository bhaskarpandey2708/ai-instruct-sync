# Changelog

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
