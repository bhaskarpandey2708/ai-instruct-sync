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

- **Node.js** version (≥20)
- **Agent configs** — Cursor, Windsurf, Copilot, Claude Code, Gemini, Aider, Continue
- **MCP configs** — project + user locations, empty/broken JSON
- **Secrets safety** — `.env` gitignore, secret-like patterns in rule/MCP files
- **Project hygiene** — git, README, oversized rules

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
ai-setup-doctor --strict   # exit 1 on warnings too
```

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
npm test
npm run demo
```

## License

MIT
