# Demo — api-contract-sentinel

**Package:** `@bhaskarauthor/api-contract-sentinel`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P28 api-contract-sentinel ===
Detect breaking API contract changes in PRs with consumer impact maps
{
  "product": "api-contract-sentinel",
  "id": "P28",
  "result": {
    "breaks": [],
    "warns": [
      {
        "type": "path_added",
        "path": "/v2"
      }
    ],
    "ok": true
  }
}
```

## Try it

```bash
npx @bhaskarauthor/api-contract-sentinel@0.1.0-alpha.1 --help
# or from monorepo:
cd api-contract-sentinel && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
