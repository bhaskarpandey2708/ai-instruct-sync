# Demo — personal-crm

**Package:** `@bhaskarauthor/personal-crm`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P23 personal-crm ===
Privacy-first personal CRM for founders: follow-ups, context notes, birthday nudges
{
  "product": "personal-crm",
  "id": "P23",
  "result": {
    "nudge": [
      {
        "id": "founder-friend",
        "lastTouch": 0
      }
    ]
  }
}
```

## Try it

```bash
npx @bhaskarauthor/personal-crm@0.1.0-alpha.1 --help
# or from monorepo:
cd personal-crm && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
