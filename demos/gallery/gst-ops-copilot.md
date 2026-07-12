# Demo — gst-ops-copilot

**Package:** `@bhaskarauthor/gst-ops-copilot`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P16 gst-ops-copilot ===
GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs
{
  "product": "gst-ops-copilot",
  "id": "P16",
  "result": {
    "issues": [],
    "ok": true,
    "count": 1
  }
}
```

## Try it

```bash
npx @bhaskarauthor/gst-ops-copilot@0.1.0-alpha.1 --help
# or from monorepo:
cd gst-ops-copilot && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
