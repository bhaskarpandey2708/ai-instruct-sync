# Demo — llm-spend (P05)

**Package:** `@bhaskarauthor/llm-spend`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P05 llm-spend ===
Multi-provider LLM cost · tokens · budget (free OSS CLI)

llm-spend — fixtures/sample.json
7 events · tokens · ~$1.02 estimated

By provider
  anthropic  …
  google     …
  azure      …
  openai     …

By model / project / day …

Budget
  OK  $1.02 / $100.00
  Within budget.
```

## Try it

```bash
cd llm-spend
npm test
npm run demo
node src/cli.js fixtures/sample.json
node src/cli.js --strict fixtures/over-budget.json
```

## Social

- Pack: `llm-spend/docs/launch/SOCIAL-PUBLISH-PACK.md`
- Video: `llm-spend/demo/social/llm-spend-social-1080p.mp4`
