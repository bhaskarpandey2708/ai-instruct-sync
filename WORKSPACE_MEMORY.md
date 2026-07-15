# Workspace memory (agents + humans)

**Last updated:** 2026-07-15  
**Publish rule:** Push/npm only when Bhaskar asks — **authorized 2026-07-15** for P05 code bump + P06–P28 social packs.  
**Morning file:** `MORNING_BRIEFING.md`  
**Product cycles:** `PRODUCT_CYCLE_REGISTRY.md` — Alpha/Beta **closed** locally (29 packages).  
**Week social (P06–P28):** `demos/WEEK_P06_P28_CALENDAR.md` · packs via `node scripts/generate-social-packs.mjs`

## Social launch track (LinkedIn + X + Reddit + demo video)

**Policy (locked 2026-07-15):**
- Path = **P01 → P04 → P29 → P30** only (hygiene suite). **No P05–P28 in between.**
- **Free OSS only on public accounts.** No paid product, seats, SaaS, or Action pricing in posts until Bhaskar says ready.
- P05–P28 stay local / offline MVP; do not social-launch until deliberately promoted.

| # | Product | Status |
|---|---------|--------|
| 1 | P01 instruct-sync | Posted |
| 2 | P02 ai-setup-doctor | Posted |
| 3 | P03 mcp-sync | Posted |
| 4 | P04 secret-guard | Posted (2026-07-15) |
| — | P05–P28 | **Skip social** (not ready / not free-suite track) |
| 5 | **P29 agent-skill-scan** | **Next** — free CLI · pack `agent-skill-scan/docs/launch/SOCIAL-PUBLISH-PACK.md` · video `agent-skill-scan/demo/social/agent-skill-scan-social-1080p.mp4` |
| 6 | **P30 agent-spend-guard** | After P29 — free CLI kill-switch (not a paid app in posts) · pack `agent-spend-guard/docs/launch/SOCIAL-PUBLISH-PACK.md` |

**Cadence:** One product per day-ish. P29 next → P30 1–2 days later. Don’t dump both same hour.

**Renderer:** `python3 scripts/suite_story_demos.py --only agent-skill-scan,agent-spend-guard` (KEY_GAIN≈90% quieter).

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
- **No paid-product social posts** (SaaS, seats, Action pricing) until owner is ready  
- **No P05–P28 social** between suite posts  

## Open decisions for next chat

1. Post P29 agent-skill-scan (pack + video ready)?  
2. After P29: post P30 free CLI (spend guardrails — not billing)?  
3. Later: which P05–P28 promote to “deep” (only if free OSS story is solid)?  
4. Push / npm only on explicit go-ahead?

## Claim released (2026-07-12): P30 + P32 closed

**agent-spend-guard** (P30) and **pr-triage** (P32) are built, tested, and
committed (34c43b6 / 44bace1). Suite litmus **31/31 green** including both.
Hourly cron loop deleted. No push / no publish, per standing rule.
