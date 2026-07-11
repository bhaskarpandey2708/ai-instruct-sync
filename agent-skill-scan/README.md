# agent-skill-scan

**One command to security-scan the agent content your AI coding tools execute: skills, MCP server configs, rules files, and hooks.**

```bash
npx agent-skill-scan
```

Read-only. Zero dependencies. Nothing leaves your machine.

---

## Why

AI agents now run content you didn't write: marketplace skills, MCP servers,
shared rules files, auto-firing hooks. That content is a supply chain — and it's
being attacked:

- A 2026 audit of ~4,000 marketplace agent skills found **36.8% with at least one
  security flaw** and **1,467 malicious payloads** (Snyk ToxicSkills).
- An MCP server audit graded **71% of servers "F"** — and zero "A".
- Prompt injection is the #2 developer security concern of 2026.

Your agent will happily read `SKILL.md`. Did you?

## What it detects

| Category | Checks |
|----------|--------|
| **skills** (`.claude/skills`, `agents`, `commands`, `.cursor/commands`) | Prompt-injection primitives ("ignore previous instructions", hidden-from-user directives, covert actions) · secret-exfiltration directives · env harvesting piped to the network · suspicious webhooks (Discord/Telegram/request bins/ngrok) · `curl \| sh` · reverse shells · SSH-key and keychain access · `rm -rf ~` · persistence via cron/launchd · npm install hooks · base64/charcode/hex obfuscation · embedded live credentials |
| **mcp** (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, Claude Desktop, `~/.claude.json`) | Hardcoded secrets in `env` blocks (masked in output) · dangerous command strings · unpinned `npx`/`uvx` server packages · remote servers over plain HTTP |
| **rules** (`CLAUDE.md`, `.cursorrules`, `.cursor/rules/`, copilot-instructions, Windsurf/Cline/Continue) | Same injection/threat rules · invisible-Unicode smuggling (zero-width chars, bidi overrides, Unicode tag characters) |
| **hooks** (`.claude/settings.json`) | Threat patterns in hook commands — hooks run automatically with your shell |

Unicode checks are script-aware: ZWJ/ZWNJ in emoji or Indic text never fire; the
same characters hidden in ASCII instructions do.

## Usage

```bash
npx agent-skill-scan                    # scan current project + user-home agent dirs
npx agent-skill-scan --no-user          # project only (CI)
npx agent-skill-scan --json             # machine-readable report
npx agent-skill-scan --only skills,mcp  # limit categories
npx agent-skill-scan --strict --min-score 80   # gate a pipeline
```

Also installed as `skill-scan`.

### Exit codes

- `0` — clean (low/medium findings don't fail without `--strict`)
- `1` — critical or high findings (`--strict`: medium too; `--min-score` misses)
- `2` — usage error

### Severity → score

`score = 100 − 25·critical − 10·high − 4·medium − 1·low` (floor 0).

## Sibling tools (AI dev hygiene suite)

- [`ai-instruct-sync`](https://www.npmjs.com/package/ai-instruct-sync) — keep rules files in sync across agents
- [`ai-setup-doctor`](https://www.npmjs.com/package/ai-setup-doctor) — diagnose your whole AI coding setup
- [`mcp-config-sync`](https://www.npmjs.com/package/mcp-config-sync) — sync MCP server configs across clients

## Honest limits

Heuristic, not a sandbox: it catches known injection/exfil/obfuscation patterns,
not novel ones. A clean scan lowers risk; it is not a guarantee. Pair it with
reading what you install.

## Development

```bash
npm install
npm test        # builds then runs node --test against generated temp fixtures
```

Malicious fixtures are generated at test time in temp dirs — nothing
secret-shaped is tracked in git.

## License

MIT
