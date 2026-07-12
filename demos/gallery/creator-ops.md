# Demo — creator-ops

**Package:** `@bhaskarauthor/creator-ops`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P24 creator-ops ===
Ops OS for mid-tier creators: content calendar, sponsor CRM, asset vault, analytics rollup
{
  "product": "creator-ops",
  "id": "P24",
  "result": {
    "pipeline": {
      "byStage": {
        "pitch": 1
      },
      "dealCount": 1,
      "pipelineValue": 2000
    },
    "conflicts": []
  }
}
```

## Try it

```bash
npx @bhaskarauthor/creator-ops@0.1.0-alpha.1 --help
# or from monorepo:
cd creator-ops && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
