# Workspace guide (for humans and AI agents)

This monorepo is Bhaskar Pandey's indie product workspace. Read this first — it is the
single orientation point so no agent loses track of state or strategy.

## What lives here

| Path | What it is | State |
|------|-----------|-------|
| `instruct-sync/` | P01 — AI rules/instructions sync CLI | **npm `ai-instruct-sync@0.2.0-beta.0`** |
| `ai-setup-doctor/` | P02 — read-only AI setup diagnostics CLI | **npm `ai-setup-doctor@0.1.0-beta.0`** |
| `mcp-sync/` | P03 — MCP config sync across Claude/Cursor/VS Code/… | **npm `mcp-config-sync@0.2.0`** (+ `@bhaskarauthor/mcp-sync`). Own git remote → [github.com/bhaskarpandey2708/mcp-sync](https://github.com/bhaskarpandey2708/mcp-sync). Gitignored by this monorepo. |
| `secret-guard/` | P04 — secrets in AI rules / MCP env / prompts | **MVP** — litmus green; demo at `secret-guard/demo/` |
| `llm-spend/` … `api-contract-sentinel/` | P05–P28 portfolio products | **Scaffolded MVP** — offline cores + litmus + demos (2026-07-11) |
| `agent-skill-scan/` | P29 — agent skills/MCP security scanner | **MVP verified** (8/8 tests) — but `src/rules.ts` is AV-quarantined; verified defused copy staged at `~/agent-skill-scan-verified-staging/`, see Current focus item 0 |
| `scripts/suite-litmus.mjs` | Cross-product test harness + retry | Source of suite truth |
| `scripts/suite-watch.mjs` | Interval self-check scheduler | No remote push |
| `WORKSPACE_MEMORY.md` | Persistent agent memory | Read first on session resume |
| `scripts/generate_software_portfolio.py` | Regenerates the portfolio files below | Source of truth for portfolio data |
| `Software_Opportunity_Master_Portfolio.csv` | Flat portfolio export (32 items, scores, visibility) | Generated — do not hand-edit |
| `Software_Opportunity_Research_Portfolio.xlsx` | 9-sheet research workbook | Generated — do not hand-edit |
| `SOFTWARE_PORTFOLIO_INDEX.md` | Portfolio index + strategy summary | Generated — do not hand-edit |
| `ai-agent-roadmap.md` | 90-day AI tooling plan | Reference |
| `demo-instruct-sync/`, `ai-setup-doctor/demo/` | Product demo assets/scripts | Videos/frames are gitignored, rebuildable |

## Strategy — the AI dev hygiene suite

One audience (AI-assisted developers), one flywheel (npx cold-start), OSS CLIs that
cross-market each other, paid layers on top:

1. **Sync** — P01 instruct-sync + P03 mcp-sync (shipped)
2. **Diagnose** — P02 ai-setup-doctor (shipped)
3. **Secure** — P29 agent-skill-scan (build next; rides the 2026 agent supply-chain security wave)
4. **Control spend** — P30 agent-spend-guard (design; the suite's money product — token budgets + kill-switch)

Standalone consumer revenue bet outside the suite: P31 indic-voice-flow (Hinglish/Indic
voice dictation, PRIVATE-PAID, NEXT — parked until suite compounds or a cofounder owns it).

## Portfolio conventions

- 32 opportunities P01–P32, scored 1–5 on Burn / Software-native / Ship speed / Distribution / Moat.
- Priority: NOW ≥ 20 · NEXT 16–19 · LATER 12–15 · PARK < 12.
- **Visibility marker:** `OPEN-CORE` = public OSS repo, money on a paid layer on top;
  `PRIVATE-PAID` = closed source, the product itself is paid.
- To change portfolio data, edit `scripts/generate_software_portfolio.py` (the `OPPS` list
  and `VISIBILITY` dict) and re-run `python3 scripts/generate_software_portfolio.py`.
  Never hand-edit the CSV/XLSX/index.
- Log every research finding or status change in the generator's Research Log entries.

## Code conventions (all suite CLIs)

- TypeScript, Node 20+, **zero runtime dependencies**, ESM (`"type": "module"`).
- Dual bin names (long + short), `--json` for CI, dry-run/read-only by default, `--cwd` support.
- Build via `scripts/build.mjs` (typescript transpileModule pattern — see ai-setup-doctor).
- Tests with `node --test` against hermetic fixtures; fixture secrets stay **untracked**
  (see ai-setup-doctor/fixtures/leaky-secrets/.env — intentionally not in git).
- Severity model: ok / info / warn / error; score out of 100 (see ai-setup-doctor/src/types.ts).

## Current focus (2026-07-11)

0. **P29 PENDING SYNC:** agent-skill-scan MVP is built and verified (8/8 tests green,
   CLI exercised end-to-end) but macOS security software quarantined
   `agent-skill-scan/src/rules.ts` (literal threat signatures looked like a dropper)
   and blocked shell access to `~/Documents` mid-session. The verified, AV-defused
   copy (signatures assembled via concatenation) is staged at
   `~/agent-skill-scan-verified-staging/`. Once Documents access works: copy
   `src/rules.ts` from staging over the workspace one, `npm install && npm test`
   in `agent-skill-scan/`, commit locally, delete staging. Convention going forward:
   never write literal exfil domains / reverse-shell strings / secret prefixes in
   suite source or fixtures — always concatenate.
1. **Suite green** — `node scripts/suite-litmus.mjs` must stay 28/28 (see `SUITE_STATUS.md`).
2. **Do not push** remotes until explicit go-ahead.
3. Deepen high-conviction OSS: P01–P04 publish polish; promote selected P05–P28 (e.g. eval-harness, api-contract-sentinel, sbom-lite).
4. Launch traction for P01–P03; then P29 agent-skill-scan; P30 spend-guard design.
5. Commercial layers only after OSS cores prove usage.

Persistent agent memory also mirrors this strategy; if portfolio state changes, update
both the generator script and this file.
