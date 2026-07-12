# Demo — skill-sync

**Package:** `@bhaskarauthor/skill-sync`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P06 skill-sync ===
Package, version, and sync agent skills/tools/prompts like packages across teams
{
  "product": "skill-sync",
  "id": "P06",
  "result": {
    "validate": {
      "ok": true,
      "errors": []
    },
    "plan": null
  }
}
```

## Try it

```bash
npx @bhaskarauthor/skill-sync@0.1.0-alpha.1 --help
# or from monorepo:
cd skill-sync && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
