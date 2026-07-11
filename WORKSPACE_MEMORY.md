# Workspace memory (agents + humans)

**Last updated:** 2026-07-11 (overnight ops)  
**Rule:** Do **not** `git push` or **npm publish** until Bhaskar explicitly asks.  
**Morning file:** `MORNING_BRIEFING.md`

## Where things live

Root: `/Users/bhaskar_pandey/Documents/development`

| Path | Role |
|------|------|
| `instruct-sync/` | P01 shipped beta |
| `ai-setup-doctor/` | P02 shipped beta |
| `mcp-sync/` | P03 shipped (own GitHub remote; monorepo-gitignored) |
| `secret-guard/` | P04 MVP CLI |
| `llm-spend/` … `api-contract-sentinel/` | P05–P28 offline MVPs + litmus + demos |
| `agent-skill-scan/` | P29 scaffold (beyond P28) |
| `scripts/suite-litmus.mjs` | Full suite test runner + retry |
| `scripts/suite-watch.mjs` | Interval scheduler for litmus |
| `scripts/scaffold_p05_p28.mjs` | Regenerator for P05–P28 scaffolds |
| `logs/litmus/` | JSON + markdown run history |
| `SUITE_STATUS.md` | Latest human-readable suite report |
| `suite/cross-fixtures/` | Shared multi-tool datasets |

## Suite health (latest)

Run: `node scripts/suite-litmus.mjs`  

Last known: **28/28 green** + cross-check OK (see `logs/litmus/latest.json`).

## Product tiers

1. **Ship track (OSS npx):** P01–P04 — full CLI, fixtures, demos, published or publish-ready  
2. **Offline MVP track:** P05–P28 — domain core algorithms, `npm test` litmus, `npm run demo`, MIT  
3. **Commercial later:** hosted dashboards, seats, India WA Cloud API, compliance exports — not blocking OSS cores  

## Commands

```bash
# full litmus (all products, retry once)
node scripts/suite-litmus.mjs

# continuous self-check every 10 min (no push)
node scripts/suite-watch.mjs --interval 600

# single product
cd secret-guard && npm test && node demo/run-demo.mjs
cd eval-harness && npm test && npm run demo
```

## Non-goals until discussion

- No `git push` / npm publish  
- No fake stars/downloads  
- No enterprise sales for P07/P14 until OSS cores prove value  

## Open decisions for next chat

1. Which P05–P28 promote to “deep” (network, UI, publish)?  
2. Publish `ai-secret-guard` beta?  
3. Push monorepo `ai-instruct-sync` with scaffolds?  
4. Prioritize P29 agent-skill-scan vs commercial layers on P01–P04?
