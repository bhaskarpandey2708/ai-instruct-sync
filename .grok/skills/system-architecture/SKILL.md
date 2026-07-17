---
name: system-architecture
description: >
  Senior system and product architecture (20+ years bar) for AI hygiene suite
  and portfolio CLIs. Boundaries, open-core vs private-paid, data flows. Use for
  design, architecture, /system-architecture, "how should this fit", OPEN-CORE.
---

# System architecture — principal architect bar

Design for **change isolation** and **honest product boundaries**. Pretty diagrams
without a decision are decoration.

## Portfolio architecture (source of truth)

Read before proposing structure:

- `CLAUDE.md` / `WORKSPACE_MEMORY.md`
- `scripts/generate_software_portfolio.py` (do not hand-edit CSV/XLSX)
- Suite products P01–P04, P29–P30 vs offline P05–P28 scaffolds

## Core decisions already made

| Decision | Implication |
|----------|-------------|
| Open-core suite | Free CLI public; paid layer later (Action, seats, dashboard) |
| npx flywheel | Cold-start install; zero/low deps |
| Local-first | Default: no telemetry, no required cloud |
| Monorepo + exceptions | `mcp-sync` own remote; gitignored from monorepo |
| P30 vs P05 | P30 = agent budget kill-switch; P05 = multi-provider rollup — do not merge blindly |

## When designing a product

1. **Job to be done** — one primary job; secondary jobs are flags or siblings
2. **Trust boundary** — what leaves the machine? (default: nothing)
3. **Failure modes** — CI exit codes, warn vs stop, partial parse
4. **Extension points** — prices override, `--cwd`, fixtures, SARIF later
5. **Non-goals** — write them down; alphas die from scope fantasy

## Open-core layering

```
[ free CLI / local core ]  →  [ CI gate / hooks ]  →  [ team policy / hosted ] 
     MIT, now                     later                  paid, later
```

Never advertise paid layer on social until owner ready.

## Architecture review checklist

- [ ] Clear input/output contracts (JSON schema informal OK)
- [ ] Dependency direction: core ← cli, not reverse
- [ ] Test seams without mocks hell
- [ ] Versioning / publish path
- [ ] Sibling products: complement not cannibalize
- [ ] Security: no secret material in fixtures git-tracked as live keys

## Anti-patterns

- “Platform” before one working CLI
- Shared mega-framework across 28 alphas
- Private-paid product posted as free with no path
- Coupling portfolio generator output to runtime code
