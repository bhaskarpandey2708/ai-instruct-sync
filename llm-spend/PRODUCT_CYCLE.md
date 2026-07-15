# Product cycle — llm-spend (P05)

| Field | Value |
|-------|--------|
| **Track** | Alpha (`alpha`) |
| **Version** | `0.1.0-alpha.4` |
| **Cycle** | **CLOSED** (Alpha) — product deepened 2026-07-15 |
| **Publish** | **Not published** — local until explicit go-ahead |

## Closed-cycle checklist

- [x] Dual bin: `llm-spend` + `ai-llm-spend`
- [x] Multi-provider pricing table + flexible event normalize
- [x] Human report + `--json` + `--budget` + `--strict` exit codes
- [x] Fixtures: sample multi-provider + over-budget
- [x] Litmus + cycle tests
- [x] Demo script
- [x] README (honest limits)
- [x] Zero runtime dependencies
- [x] Social pack + 1080p video paths
- [ ] npm publish (blocked until owner says go)
- [ ] git remote push (blocked until owner says go)

## Known limitations (Alpha)

- Offline rollup only — no live provider billing API
- List prices approximate; not invoice-exact
- Not a kill-switch for Claude Code hooks (see agent-spend-guard)

## How to verify

```bash
cd llm-spend
npm test
npm run demo
```
