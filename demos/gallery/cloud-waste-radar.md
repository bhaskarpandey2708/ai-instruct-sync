# Demo — cloud-waste-radar

**Package:** `@bhaskarauthor/cloud-waste-radar`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P11 cloud-waste-radar ===
Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups
{
  "product": "cloud-waste-radar",
  "id": "P11",
  "result": {
    "findings": [
      {
        "id": "vol-x",
        "kind": "idle_ebs",
        "monthlyUsd": 10
      }
    ],
    "monthlySavingsUsd": 10,
    "count": 1
  }
}
```

## Try it

```bash
npx @bhaskarauthor/cloud-waste-radar@0.1.0-alpha.1 --help
# or from monorepo:
cd cloud-waste-radar && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
