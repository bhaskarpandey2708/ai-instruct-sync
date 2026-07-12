# Demo — care-companion

**Package:** `@bhaskarauthor/care-companion`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P22 care-companion ===
Family care coordination app: meds, appointments, shared notes for elders
{
  "product": "care-companion",
  "id": "P22",
  "result": {
    "due": [
      {
        "id": "aspirin",
        "everyHours": 12,
        "nextAt": 0
      }
    ],
    "next": [
      {
        "id": "aspirin",
        "everyHours": 12,
        "nextAt": 1783875163924
      }
    ]
  }
}
```

## Try it

```bash
npx @bhaskarauthor/care-companion@0.1.0-alpha.1 --help
# or from monorepo:
cd care-companion && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
