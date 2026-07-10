# ai-setup-doctor

**One command to diagnose why your AI coding setup feels broken.**

Rules missing? MCP JSON invalid? `.env` about to be committed? Secrets pasted into agent rules?  
`ai-setup-doctor` checks the common failure modes and tells you how to fix them.

```bash
npx ai-setup-doctor
```

## Why this exists

Developers now juggle Cursor, Claude Code, Copilot, Windsurf, MCP servers, and rule files.  
When something fails, the error is rarely obvious. This tool is a **health check for your AI workspace** — companion to:

| Tool | Job |
|------|-----|
| [mcp-sync](https://github.com/bhaskarpandey2708/mcp-sync) | Sync MCP configs |
| [ai-instruct-sync](https://www.npmjs.com/package/ai-instruct-sync) | Sync rules/instructions |
| **ai-setup-doctor** | Diagnose the whole setup |

## What it checks

| Category | Examples |
|----------|----------|
| **runtime** | Node.js ≥20, `engines.node` mismatch |
| **agents** | Cursor, Windsurf, Copilot, Claude, Gemini, Codex, Cline, Zed, Aider, Continue, `AGENTS.md` — empty shells, multi-agent drift, rule contradictions, empty stubs, legacy `.cursorrules`, broken `.mdc` frontmatter |
| **mcp** | Project + user configs, broken JSON/JSONC, empty servers, missing `command`/`url`, bad URLs, name collisions, unpinned `npx` packages, missing commands on PATH |
| **secrets** | `.env` gitignore, git-tracked secret files, keys in rules/MCP `env`/`args`/`headers`, live keys in `.env.example` — with docs-sample allowlisting (fewer false positives) |
| **hygiene** | Git worktree (incl. monorepos), README, package.json validity, placeholders (`CHANGE_ME`), oversized rules, `.cursorignore` hints |

Scoring applies **per-category caps** so one bad MCP file with many servers does not alone zero the whole score. Checks are sorted errors → warnings → info → ok.

Safe by design: **read-only**. Never writes or uploads files.

## Install

```bash
npm install -g ai-setup-doctor
# or
npx ai-setup-doctor
```

## Usage

```bash
# Current directory
ai-setup-doctor

# Another project
ai-setup-doctor check --cwd ~/code/my-app

# CI / scripts
ai-setup-doctor --json
ai-setup-doctor --strict          # exit 1 on warnings too

# Focus / filter
ai-setup-doctor --only secrets,mcp --verbose
ai-setup-doctor --skip runtime --no-user   # project MCP only
```

### CLI options

| Flag | Meaning |
|------|---------|
| `--cwd <dir>` | Project directory |
| `--json` | Machine-readable report (includes `summary.byCategory`) |
| `--strict` | Exit 1 on warnings as well as errors |
| `--min-score <n>` | Exit 1 if score is below `n` (CI gate) |
| `--only <list>` | Categories: `runtime,agents,mcp,secrets,hygiene` |
| `--skip <list>` | Skip categories |
| `--no-user` | Ignore user-home MCP configs |
| `-q, --quiet` | Hide ok checks (issues only) |
| `-v, --verbose` | Show categories + details + per-category breakdown |

## Example output

```
ai-setup-doctor — /Users/you/my-app
  ✓ Node.js          Node 22.x
  ✓ AI agents        Detected 2 agent setup(s): Cursor, Claude Code
  ℹ Multi-agent      Rules can drift — run ai-instruct-sync
  ✓ MCP configs      Found 1 MCP config(s)
  ✗ Secrets: .env    .env exists but may not be gitignored
      → Add `.env` to .gitignore immediately
  ✓ Secret scan      No obvious secrets in agent files

Score 75/100
```

## Development

```bash
cd ai-setup-doctor
npm install
npm run build
npm test              # tough fixture suite (node:test)
npm run demo          # this package
npm run demo:hard     # all adversarial fixtures + sibling projects
```

Fixtures under `fixtures/` cover broken MCP JSON, leaked keys, instruction drift, empty agent dirs, hardcoded MCP env, rule bloat, and more.

## License

MIT
