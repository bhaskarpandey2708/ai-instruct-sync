# Demo — grc-evidence-autopilot

**Package:** `@bhaskarauthor/grc-evidence-autopilot`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P14 grc-evidence-autopilot ===
Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO startups
{
  "product": "grc-evidence-autopilot",
  "id": "P14",
  "result": {
    "controls": [
      {
        "id": "CC6.1",
        "title": "Logical access",
        "artifacts": []
      }
    ],
    "covered": 0,
    "total": 1,
    "coveragePct": 0
  }
}
```

## Try it

```bash
npx @bhaskarauthor/grc-evidence-autopilot@0.1.0-alpha.1 --help
# or from monorepo:
cd grc-evidence-autopilot && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
