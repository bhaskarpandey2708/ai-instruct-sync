# Demo — sbom-lite

**Package:** `@bhaskarauthor/sbom-lite`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P13 sbom-lite ===
Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI
{
  "product": "sbom-lite",
  "id": "P13",
  "result": {
    "sbom": {
      "bomFormat": "secret-guard-sbom-lite",
      "components": [
        {
          "name": "foo",
          "version": "1.2.3",
          "license": "MIT"
        }
      ],
      "count": 1
    },
    "gate": {
      "ok": true,
      "violations": []
    }
  }
}
```

## Try it

```bash
npx @bhaskarauthor/sbom-lite@0.1.0-alpha.1 --help
# or from monorepo:
cd sbom-lite && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
