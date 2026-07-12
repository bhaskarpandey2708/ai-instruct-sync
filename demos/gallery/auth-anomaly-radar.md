# Demo — auth-anomaly-radar

**Package:** `@bhaskarauthor/auth-anomaly-radar`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P09 auth-anomaly-radar ===
Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)
{
  "product": "auth-anomaly-radar",
  "id": "P09",
  "result": {
    "flags": [],
    "risk": "low"
  }
}
```

## Try it

```bash
npx @bhaskarauthor/auth-anomaly-radar@0.1.0-alpha.1 --help
# or from monorepo:
cd auth-anomaly-radar && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
