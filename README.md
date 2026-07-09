# ai-agent-tools

**High-signal, low-risk OSS tooling for the broad AI agent ecosystem.**

A focused repository for practical tools that solve daily friction for developers using AI coding agents (Cursor, Windsurf, GitHub Copilot, Aider, Gemini CLI, Continue, and more).

## Primary Project: instruct-sync (`ai-instruct-sync` on npm)

One command to keep your AI coding rules and instructions in sync across tools.

```bash
npx ai-instruct-sync status
npx ai-instruct-sync sync --from cursor --dry-run
```

### Key Features
- Zero runtime dependencies (Node built-ins only)
- Safe by default: automatic backups, dry-run by default, `--apply` to write
- Supports modern formats: directory-based rules with YAML frontmatter (globs, alwaysApply), flat Markdown files
- Full command set: `status`, `diff`, `list`, `clients`, `convert`, `sync`, `validate`, `init`
- Useful flags: `--cwd`, `--json`, `--apply`, `--yes`, `--replace`, `--prune`
- Cross-agent conversion with style adaptation
- `init` to bootstrap sample rules in any project
- Enhanced validation and clean multi-line diff output
- Cross-platform, strict TypeScript

See [`instruct-sync/`](./instruct-sync) for the CLI code and [`ai-agent-roadmap.md`](./ai-agent-roadmap.md) for the full strategy.

## Installation

```bash
npm install -g ai-instruct-sync
# or
npx ai-instruct-sync
```

## Quick Start

```bash
# Scaffold samples in current directory
npx ai-instruct-sync init .

# Check what you have
npx ai-instruct-sync status

# See differences
npx ai-instruct-sync diff

# Preview syncing Cursor rules to everything else
npx ai-instruct-sync sync --from cursor --dry-run

# Actually apply (with confirmation)
npx ai-instruct-sync sync --from cursor --apply
```

## Development

```bash
cd instruct-sync
npm install
npm run build
npm test
```

## Publishing

The main package lives in `instruct-sync/`. To publish:

```bash
cd instruct-sync
npm run build
npm test
npm publish --access public --tag beta   # package: ai-instruct-sync
```

## Philosophy

Build small, reliable, zero-dependency tools with excellent UX that work across the entire AI agent tooling space. Focus on real daily pain, safety, and easy adoption via `npx`.

## Roadmap & Background

See [ai-agent-roadmap.md](./ai-agent-roadmap.md) for the research-backed plan and progress.

## Releasing

From the `instruct-sync` directory:

```bash
npm run build
npm test
npm version patch   # minor or major as needed
npm publish --access public --tag beta   # package: ai-instruct-sync
```

Then from repo root:

```bash
git add .
git commit -m "chore: release v$(node -p "require('./instruct-sync/package.json').version")"
git tag v$(node -p "require('./instruct-sync/package.json').version")
git push origin main --tags
```

See `scripts/release.sh` for a helper.

## Contributing

Issues and PRs are very welcome — especially new agent adapters (edit `src/clients.ts`).

## License

MIT



