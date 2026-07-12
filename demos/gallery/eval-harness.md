# Demo — eval-harness

**Package:** `@bhaskarauthor/eval-harness`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P08 eval-harness ===
Lightweight eval harness for prompt/agent regression tests in CI for product teams
{
  "product": "eval-harness",
  "id": "P08",
  "result": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "results": [
      {
        "id": "greet",
        "pass": true,
        "expected": true,
        "forbidden": false
      }
    ],
    "ok": true
  }
}
```

## Try it

```bash
npx @bhaskarauthor/eval-harness@0.1.0-alpha.1 --help
# or from monorepo:
cd eval-harness && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
