# Demo — fraud-signal-kit

**Package:** `@bhaskarauthor/fraud-signal-kit`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P10 fraud-signal-kit ===
Composable fraud signal APIs (device, velocity, email risk) for Indian fintech and marketplaces
{
  "product": "fraud-signal-kit",
  "id": "P10",
  "result": {
    "email": {
      "email": "user@example.com",
      "score": 0,
      "band": "low"
    },
    "velocity": {
      "count": 1,
      "score": 15,
      "band": "low"
    },
    "score": 6,
    "band": "low"
  }
}
```

## Try it

```bash
npx @bhaskarauthor/fraud-signal-kit@0.1.0-alpha.1 --help
# or from monorepo:
cd fraud-signal-kit && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
