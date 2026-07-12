# Demo — sc-visibility-lite

**Package:** `@bhaskarauthor/sc-visibility-lite`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P26 supply-chain-visibility-lite ===
Lite multi-tier supplier status & risk notes for SMEs without SAP budgets
{
  "product": "supply-chain-visibility-lite",
  "id": "P26",
  "result": {
    "risk": {
      "bands": {
        "low": 0,
        "medium": 1,
        "high": 0
      },
      "highRisk": [],
      "count": 1
    },
    "stale": []
  }
}
```

## Try it

```bash
npx @bhaskarauthor/sc-visibility-lite@0.1.0-alpha.1 --help
# or from monorepo:
cd sc-visibility-lite && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
