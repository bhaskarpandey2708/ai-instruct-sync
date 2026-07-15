# llm-spend

**Multi-provider LLM cost, tokens, and budget observability — one local command.**

```bash
npx @bhaskarauthor/llm-spend              # uses fixtures demo or ./usage.json
npx @bhaskarauthor/llm-spend usage.json   # your export
npx @bhaskarauthor/llm-spend --strict --budget 50 usage.jsonl
```

Also: `npx llm-spend` (short bin). Zero runtime dependencies. MIT. Free CLI.

---

## Why

Usage is scattered: OpenAI dashboard, Anthropic console, Google AI Studio, Azure,
open-model proxies. Finance sees one number next month. Engineers need a rollup
**now** — by provider, model, project, and day — plus a budget line that CI can fail.

`llm-spend` is that rollup. Point it at a JSON/JSONL export. No cloud account.
Nothing leaves your machine.

## Quick start

```bash
cd llm-spend
npm test
npm run demo
node src/cli.js fixtures/sample.json
node src/cli.js --json fixtures/sample.json
node src/cli.js --strict fixtures/over-budget.json   # exit 1
```

## Input

| Format | Shape |
|--------|--------|
| JSON object | `{ "events": [ ... ], "budgetUsd": 100 }` |
| JSON array | `[ { ...event }, ... ]` |
| JSONL | one event object per line |

**Event fields** (flexible — common aliases accepted):

| Field | Notes |
|-------|--------|
| `provider` | openai, anthropic, google, azure, … |
| `model` | used for built-in list pricing |
| `inputTokens` / `outputTokens` | preferred |
| `tokens` | total if split unknown |
| `costUsd` | overrides pricing table |
| `project` | optional app / feature bucket |
| `ts` | ISO timestamp → by-day rollup |
| `pricePer1k` | legacy total-token pricing |

## Pricing

Built-in approximate **USD per million tokens** (mid-2026 list) for Claude / GPT /
Gemini / Mistral / DeepSeek families. Longest model-id prefix wins; unknown models
get a conservative default. Override with `costUsd` per event or `prices` in the
JSON root. **Budget-accurate, not invoice-exact.**

## Commands & flags

| | |
|---|---|
| `[file]` | usage JSON / JSONL (default: `usage.json` → demo fixture) |
| `--budget N` | period budget USD (else file `budgetUsd`, else 100) |
| `--strict` / `--check` | exit **1** when over budget |
| `--json` | machine-readable report |
| `--help` | usage |

**Verdicts:** `ok` · `warn` (≥80% budget) · `over`

## Example human output

```
llm-spend — fixtures/sample.json
7 events · 531500 tokens · $2.14 estimated

By provider
  anthropic       $1.07  …
  openai          $0.78  …
  …

Budget
  OK  $2.14 / $100.00  (2.14% · $97.86 left)
  Within budget.
```

## Honest limits

- Offline rollup of **your** export — does not call provider billing APIs.
- List prices ≠ contracted enterprise rates or monthly subscription caps.
- For agent kill-switch on Claude Code transcripts, see sibling **agent-spend-guard**.

## License

MIT
