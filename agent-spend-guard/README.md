# agent-spend-guard

**Token budgets + a kill-switch for AI coding agents. Know what you're burning; stop it before the invoice does.**

```bash
npx agent-spend-guard            # spend vs budgets, right now
npx agent-spend-guard init      # drop a .spend-guard.json to set limits
npx agent-spend-guard check     # exit 1 when over budget — wire into hooks/CI
```

Read-only. Zero dependencies. Nothing leaves your machine.

---

## Why

2026 is the year the token bill came due: teams blowing entire annual AI budgets
by April, "3x over budget" panic, licenses getting revoked. Dashboards tell you
what you spent *after the fact* — nothing indie-sized actually **enforces** a
limit. This does:

- **Meter**: parses real usage — Claude Code transcripts (`~/.claude/projects`)
  and generic JSON event files from any agent/proxy — and prices it with a
  built-in (overridable) price table.
- **Budget**: daily / monthly / per-project USD ceilings in `.spend-guard.json`,
  with a warn threshold (default 80%).
- **Kill-switch**: `check` exits 1 the moment a ceiling is crossed, so a hook or
  CI gate can stop the agent instead of emailing you next month.

## Wiring the kill-switch

**Claude Code** — stop tool calls when over budget (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "npx agent-spend-guard check --cwd ." }] }
    ]
  }
}
```

**CI** — fail the pipeline before it gets expensive:

```bash
npx agent-spend-guard check --strict   # exit 1 on warn too
```

## Config

`.spend-guard.json` in your project (create with `init`):

```json
{
  "budgets": {
    "dailyUsd": 25,
    "monthlyUsd": 300,
    "perProjectUsd": { "my-app": 100 },
    "warnAtPct": 0.8
  },
  "prices": {
    "claude-sonnet": { "input": 3, "output": 15 }
  }
}
```

Prices are USD per **million** tokens, matched by longest model-id prefix;
built-ins cover Claude / GPT / Gemini families with a conservative fallback.
They aim to be budget-accurate, not invoice-accurate — override freely.

## Commands & options

| | |
|---|---|
| `status` (default) | spend summary + budget lines |
| `check` | same, but exit 1 on STOP (with `--strict`, on WARN too) |
| `init` | write a sample `.spend-guard.json` |
| `--usage <file>` | add a `.jsonl` transcript or JSON event array (repeatable) |
| `--no-user` | skip `~/.claude/projects` scan (hermetic/CI) |
| `--json` | machine-readable report |
| `--verbose` | per-project breakdown |

## Sibling tools (AI dev hygiene suite)

[`ai-instruct-sync`](https://www.npmjs.com/package/ai-instruct-sync) · [`ai-setup-doctor`](https://www.npmjs.com/package/ai-setup-doctor) · [`mcp-config-sync`](https://www.npmjs.com/package/mcp-config-sync) · `agent-skill-scan`

## Honest limits

Estimates use list prices and parsed transcripts — subscription plans, provider
discounts, and non-transcript usage aren't visible to it. The kill-switch stops
what's wired through it (hooks/CI); it cannot reach into a provider account.

## License

MIT
