# secret-guard

**Stop API keys from landing in AI agent rules, MCP configs, and prompts.**

[![npm beta](https://img.shields.io/npm/v/ai-secret-guard/beta?label=npm%20ai-secret-guard)](https://www.npmjs.com/package/ai-secret-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

```bash
npx ai-secret-guard@beta
# or
npx ai-secret-guard@beta scan --cwd . --strict
```

Part of the **AI dev hygiene suite** (sibling of [instruct-sync](../instruct-sync), [ai-setup-doctor](../ai-setup-doctor), [mcp-sync](../mcp-sync)).

---

## Why

Classic scanners (gitleaks, GitHub secret scanning) are great at `.env` and source —
they **miss** the new leak surface:

| Path | Risk |
|------|------|
| `CLAUDE.md`, `AGENTS.md` | Keys pasted into agent instructions |
| `.cursor/rules/**` | Team rules with live tokens |
| `.cursor/mcp.json` / Claude Desktop MCP | Hardcoded `env` blocks |
| `.env.example` | “Examples” that are real keys |

**secret-guard** scans those paths first. Zero runtime dependencies. CI / pre-commit friendly.

---

## Install

```bash
npm i -g ai-secret-guard@beta
# or always via npx
npx ai-secret-guard@beta
```

Requires **Node.js 20+**.

---

## Usage

```bash
secret-guard                     # scan current project
secret-guard --json              # machine-readable
secret-guard --sarif > out.sarif # GitHub Code Scanning
secret-guard --strict            # fail on warnings too
secret-guard --user              # also scan ~/.cursor, Claude Desktop MCP, …
secret-guard --cwd ./apps/web
```

**Exit codes:** `0` clean · `1` findings · `2` bad args

### Pre-commit (simple)

```bash
# .git/hooks/pre-commit (or husky / lefthook)
npx ai-secret-guard@beta --strict
```

### GitHub Actions

```yaml
- uses: actions/setup-node@v4
  with: { node-version: "20" }
- run: npx ai-secret-guard@beta --strict
```

---

## What it checks

- Agent / rule files (Cursor, Claude, Windsurf, Copilot, Gemini, Aider, …)
- MCP config JSON (project + optional user-home)
- Hardcoded MCP `env` values (not `${VAR}` refs)
- `.env.example` / sample files (warn)
- Git-tracked `.env` / key files when in a work tree (error)

Secrets in output are **redacted**. Example keys and placeholders are allowlisted.

---

## Related suite tools

| Tool | Role |
|------|------|
| [ai-setup-doctor](../ai-setup-doctor) | Full setup diagnostics (includes a secrets category) |
| [mcp-sync](../mcp-sync) | Sync MCP configs across clients |
| [instruct-sync](../instruct-sync) | Sync agent rules across tools |
| **secret-guard** | Focused secrets guard for AI paths + CI |

Patterns started from setup-doctor’s secret module, then specialized for pre-commit/SARIF.

---

## Develop

```bash
cd secret-guard
npm install
npm test
node dist/cli.js scan --cwd fixtures/leaky-rules
```

## License

MIT
