# Product cycle — agent-skill-scan

| Field | Value |
|-------|--------|
| **Track** | Alpha (`alpha`) |
| **Version** | `0.1.0-alpha.1` |
| **Cycle** | **CLOSED** (Alpha) |
| **Closed at** | 2026-07-12T04:12:35.713Z |
| **Publish** | **Not published** — local workspace only until explicit go-ahead |

## Closed-cycle checklist

- [x] `package.json` name + version set
- [x] MIT LICENSE
- [x] README documents scope + limitations
- [x] Automated tests exist and pass under suite litmus
- [x] Cycle smoke tests (`tests/cycle.test.mjs`) for core entrypoints
- [x] Demo or usage path documented
- [x] Zero runtime dependencies (suite convention)
- [x] Known limitations listed (below)
- [ ] npm publish (blocked until owner says go)
- [ ] git remote push (blocked until owner says go)

## Known limitations (Alpha)

- Offline domain MVP — no live cloud / WhatsApp / payments integrations.
- Litmus + cycle smoke tests, not full E2E or load tests.
- Commercial hosted layers are future work; OSS core stays free.

## How to verify

```bash
cd agent-skill-scan
npm test
npm run cycle:check 2>/dev/null || node --test tests/*.test.mjs tests/**/*.test.mjs
```

Suite: `node scripts/suite-litmus.mjs` from workspace root.
