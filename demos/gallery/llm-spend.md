# Demo — llm-spend

**Package:** `@bhaskarauthor/llm-spend`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P05 llm-spend ===
Unified LLM cost, token, and budget observability across OpenAI, Anthropic, Google, Azure, open models
{
  "product": "llm-spend",
  "id": "P05",
  "result": {
    "usage": {
      "byProvider": {
        "openai": {
          "tokens": 5000,
          "costUsd": 0.05,
          "calls": 1
        }
      },
      "totalTokens": 5000,
      "totalCostUsd": 0.05,
      "eventCount": 1
    },
    "budget": {
      "budgetUsd": 100,
      "totalCostUsd": 0.05,
      "usedPct": 0.05,
      "over": false
    }
  }
}
```

## Try it

```bash
npx @bhaskarauthor/llm-spend@0.1.0-alpha.1 --help
# or from monorepo:
cd llm-spend && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
