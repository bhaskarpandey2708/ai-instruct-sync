# Software Opportunity Portfolio — Index

**Last generated:** 2026-07-11

## Files

| File | Description |
|------|-------------|
| [`Software_Opportunity_Research_Portfolio.xlsx`](./Software_Opportunity_Research_Portfolio.xlsx) | Full multi-sheet research workbook (openpyxl) |
| [`Software_Opportunity_Master_Portfolio.csv`](./Software_Opportunity_Master_Portfolio.csv) | Flat export of all 32 opportunities with scores + visibility markers |
| [`SOFTWARE_PORTFOLIO_INDEX.md`](./SOFTWARE_PORTFOLIO_INDEX.md) | This index |
| [`scripts/generate_software_portfolio.py`](./scripts/generate_software_portfolio.py) | Regenerator script |

## Workbook sheets

1. **00_README** — how to use, scoring legend, conventions
2. **01_Master_Portfolio** — all opportunities; editable scores (yellow/blue); `TOTAL` and `Priority` formulas
3. **02_Deep_Research** — market, competitors, risks, evidence
4. **03_Build_Delivery** — platforms (CLI/Web/Android/iOS/Desktop/API/Extension), MVP, stack, repos
5. **04_Monetization** — ICP, pricing, GTM
6. **05_Scoring_Matrix** — cross-sheet formulas, color scale, bar chart
7. **06_Pipeline** — NOW / NEXT / LATER / PARK phases
8. **07_Market_Context** — macro notes with source classes
9. **08_Research_Log** — research log with starter entries

## Scoring

Dimensions (1–5): **Burn**, **Software-native**, **Ship speed**, **Distribution**, **Moat**.

- **TOTAL** = sum of five scores (Excel: `=F+G+H+I+J`)
- **Priority:** NOW ≥ 20 · NEXT 16–19 · LATER 12–15 · PARK < 12
- Inputs: **blue font + yellow fill** (financial modeling convention)

## Visibility markers

- **OPEN-CORE** — goes public (OSS repo, npx distribution); money made on a paid layer on top (CI action, team/policy tier, hosted service)
- **PRIVATE-PAID** — stays private (closed source); the product itself is the paid thing

## Strategic line — AI dev hygiene suite

One audience (AI-assisted developers), one flywheel (npx cold-start), five OPEN-CORE products that cross-market each other; paid layers on top:

1. **Sync** — P01 instruct-sync (shipped) + P03 mcp-sync (shipped)
2. **Diagnose** — P02 ai-setup-doctor (shipped)
3. **Secure** — P29 agent-skill-scan (build next, ≈3 wks)
4. **Control spend** — P30 agent-spend-guard (design; the suite's money product)

Standalone revenue bet outside the suite: P31 indic-voice-flow (PRIVATE-PAID, NEXT).

## Top NOW priorities (by TOTAL)

| Rank | ID | Name | TOTAL | Visibility | Notes |
|------|----|------|-------|------------|-------|
| 1 | P01 | instruct-sync | 23 | OPEN-CORE | npm ai-instruct-sync@0.2.0-beta.0; hygiene suite #1 (sync); primary NOW product |
| 2 | P29 | agent-skill-scan | 23 | OPEN-CORE | Hygiene suite #4 (secure); rides ToxicSkills wave; reuses setup-doctor config parsers |
| 3 | P02 | ai-setup-doctor | 22 | OPEN-CORE | npm ai-setup-doctor@0.1.0-beta.0 (latest+beta); hygiene suite #2 (diagnose) |
| 4 | P03 | mcp-sync | 21 | OPEN-CORE | npm mcp-config-sync@0.2.0 + @bhaskarauthor/mcp-sync; hygiene suite #3; co-located at development/mcp-sync (own git remote) |
| 5 | P04 | secret-guard | 21 | OPEN-CORE | Can extract patterns from setup-doctor secret checks |
| 6 | P30 | agent-spend-guard | 21 | OPEN-CORE | Hygiene suite #5 (control spend); sharper guardrails wedge that supersedes P05 for NOW |

## Regenerate

```bash
cd /Users/bhaskar_pandey/Documents/development
python3 scripts/generate_software_portfolio.py
```

## Related workspace projects

- `instruct-sync/` — P01 (npm `ai-instruct-sync@0.2.0-beta.0`)
- `ai-setup-doctor/` — P02 (npm `ai-setup-doctor@0.1.0-beta.0`)
- `mcp-sync/` — P03 (npm `mcp-config-sync@0.2.0` + `@bhaskarauthor/mcp-sync`; own git remote, co-located)
- `ai-agent-roadmap.md` — 90-day AI tooling plan
