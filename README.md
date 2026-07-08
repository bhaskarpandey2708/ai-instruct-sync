# ai-agent-tools

**High-signal, low-risk OSS tooling for the broad AI agent ecosystem.**

This is a focused repo for building practical tools that solve daily friction for developers using AI coding agents (Cursor, Windsurf, Copilot, Aider, Gemini, etc.).

## Primary Project: instruct-sync

One command to keep AI coding rules and instructions in sync across tools.

```bash
npx instruct-sync status
npx instruct-sync sync --from cursor --dry-run
```

**Key features:**
- Zero runtime dependencies (Node built-ins only)
- Safe by default: automatic backups, --dry-run, merge by default
- Supports modern formats: directory-based rules with YAML frontmatter (globs, alwaysApply), flat Markdown files
- Commands: status, diff, list, clients, sync, validate
- Cross-platform, strict TypeScript

See `instruct-sync/` for the CLI code and `ai-agent-roadmap.md` for the full strategy and 90-day plan.

## Getting Started

```bash
cd instruct-sync
npm install
npm run build
npm test

# Run directly
node dist/cli.js status
# or after global install
npm link
instruct-sync status
```

## Installation

```bash
npm install -g instruct-sync
# or
npx instruct-sync
```

## Development

```bash
cd instruct-sync
npm install
npm run build
npm test
npm run test:watch
```

## Repo Structure

- `instruct-sync/` - the main CLI package (build, test, publish from here)
- `ai-agent-roadmap.md` - research-backed plan
- `.github/workflows/ci.yml` - automated build & test

## Philosophy

Build small, reliable tools with excellent UX (like mcp-sync model) that work for the entire AI agent space. Focus on real pain points, safety, and adoption via npx.

## Roadmap

See ai-agent-roadmap.md for details on features, launch, and metrics.

## Contributing

Issues and PRs welcome, especially new agent adapters in `src/clients.ts`.

## License

MIT


