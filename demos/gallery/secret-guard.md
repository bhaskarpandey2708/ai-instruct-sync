# Demo — secret-guard

**Package:** `ai-secret-guard`  
**Version:** `0.1.0-beta.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P04 secret-guard ===
Stop secrets leaking into AI rules / MCP env

--- fixture: clean ---
  ✓ No secrets found in AI agent / MCP paths

exit 0

--- fixture: leaky-rules ---
  ✗ .cursor/rules/api.mdc:3  Possible anthropic secret in .cursor/rules/api.mdc:3
      pattern anthropic · sk-ant…Z789
      → Remove the secret; use env vars / a secret manager; rotate the exposed credential
  ✗ .cursor/rules/api.mdc:5  Possible openai secret in .cursor/rules/api.mdc:5
      pattern openai · sk-pro…CDEF
      → Remove the secret; use env vars / a secret manager; rotate the exposed credential

exit 1

--- fixture: mcp-hardcoded ---
  ✗ .cursor/mcp.json:7  Possible github-pat secret in .cursor/mcp.json:7
      pattern github-pat · ghp_ab…6789
      → Remove the secret; use env vars / a secret manager; rotate the exposed credential

exit 1

--- fixture: env-example ---
  ⚠ .env.example:2  Possible openai secret in .env.example:2
      pattern openai · sk-pro…CDEF
      → Use placeholders only in .env.example (e.g. your-api-key); never real credentials

exit 0
```

## Try it

```bash
npx ai-secret-guard@0.1.0-beta.1 --help
# or from monorepo:
cd secret-guard && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
