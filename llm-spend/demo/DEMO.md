# llm-spend (P05) — Demo

Unified LLM cost, token, and budget observability across OpenAI, Anthropic, Google, Azure, open models

## Run

```bash
cd llm-spend
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

Proxy + per-key budgets + simple dashboard + alerts

## Platforms

Web,API,CLI

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
