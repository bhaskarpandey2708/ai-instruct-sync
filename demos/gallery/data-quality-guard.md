# Demo — data-quality-guard

**Package:** `@bhaskarauthor/data-quality-guard`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P21 data-quality-guard ===
Pipeline data quality checks as code with anomaly alerts for analytics teams
{
  "product": "data-quality-guard",
  "id": "P21",
  "result": {
    "results": [
      {
        "id": "nn",
        "pass": true,
        "bad": 0
      }
    ],
    "ok": true
  }
}
```

## Try it

```bash
npx @bhaskarauthor/data-quality-guard@0.1.0-alpha.1 --help
# or from monorepo:
cd data-quality-guard && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
