# Demo — dev-onboard-os

**Package:** `@bhaskarauthor/dev-onboard-os`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P12 dev-onboard-os ===
Opinionated new-hire engineering onboarding OS: env, access, docs, first PR in days not weeks
{
  "product": "dev-onboard-os",
  "id": "P12",
  "result": {
    "items": [
      {
        "id": "laptop",
        "title": "Dev machine provisioned",
        "done": true
      },
      {
        "id": "github",
        "title": "GitHub access + 2FA",
        "done": false
      },
      {
        "id": "repo",
        "title": "Clone monorepo + build green",
        "done": false
      },
      {
        "id": "secrets",
        "title": "Secrets via vault (not chat)",
        "done": false
      },
      {
        "id": "agents",
        "title": "AI agents + MCP configured safely",
        "done": false
      },
      {
        "id": "first-pr",
        "title": "First PR merged",
        "done": false
      }
    ],
    "done": 1,
    "total": 6,
    "pct": 17
  }
}
```

## Try it

```bash
npx @bhaskarauthor/dev-onboard-os@0.1.0-alpha.1 --help
# or from monorepo:
cd dev-onboard-os && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
