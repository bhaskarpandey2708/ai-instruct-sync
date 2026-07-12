# Demo — climate-ops-meter

**Package:** `@bhaskarauthor/climate-ops-meter`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P25 climate-ops-meter ===
Lightweight Scope 1–3 carbon estimate and supplier survey tool for mid-market exporters
{
  "product": "climate-ops-meter",
  "id": "P25",
  "result": {
    "lines": [
      {
        "type": "electricity_kwh",
        "amount": 100,
        "kgCO2e": 70
      }
    ],
    "totalKgCO2e": 70,
    "totalTCO2e": 0.07
  }
}
```

## Try it

```bash
npx @bhaskarauthor/climate-ops-meter@0.1.0-alpha.1 --help
# or from monorepo:
cd climate-ops-meter && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
