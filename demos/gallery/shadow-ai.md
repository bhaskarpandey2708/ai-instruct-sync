# Demo — shadow-ai

**Package:** `@bhaskarauthor/shadow-ai`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P07 shadow-AI ===
Discover unauthorized AI tools, browser extensions, and SaaS usage across the enterprise
{
  "product": "shadow-AI",
  "id": "P07",
  "result": {
    "total": 1,
    "unauthorized": [
      "ChatGPT Free"
    ],
    "riskScore": 30,
    "severity": "medium"
  }
}
```

## Try it

```bash
npx @bhaskarauthor/shadow-ai@0.1.0-alpha.1 --help
# or from monorepo:
cd shadow-ai && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
