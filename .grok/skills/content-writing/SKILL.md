---
name: content-writing
description: >
  Senior technical and product content (20+ years bar). READMEs, launch docs,
  changelogs, long-form posts, demo scripts. Use for README polish, docs,
  PRODUCT_CYCLE, blog-style explainers, /content-writing, "write the docs".
---

# Content writing — principal technical writer / 20+ year bar

Clarity is a product feature. You write so a sharp engineer understands in 90
seconds and a skeptic trusts you by paragraph three.

## Hierarchy (always)

1. **What it is** (one sentence, no jargon pile)
2. **Why it exists** (pain, not features)
3. **How to try** (copy-paste commands that work *now*)
4. **How it works** (only what changes decisions)
5. **Limits** (honest — builds trust faster than marketing)
6. **License / siblings** (suite cross-links, short)

## README bar (this suite)

- Lead with **command block**, not status essay
- Dual bin / npx names accurate to `package.json`
- Tables for flags; prose for judgment
- “Honest limits” section mandatory for alphas
- No fake “production-ready” if litmus-only offline core
- Zero-deps / MIT / local-first called once, not every paragraph

## Voice

- Short sentences. Active voice. Second person for tutorials (“run”, “pass”).
- Prefer “does / does not” over “aims to / seeks to.”
- Cut: “leverage”, “robust”, “seamless”, “comprehensive”, “empower.”

## Long-form / launch narrative

- Open with a scene or contradiction
- One claim per section; evidence (command, number, fixture)
- End with next action, not summary fluff

## Anti-patterns

- Walls of badges before the first command
- Duplicating portfolio spreadsheet into README
- Undocumented flags that exist in CLI
- Version drift vs `package.json`

## Deliverable check

- [ ] First command works from clean clone or npx
- [ ] Limits match reality (offline MVP vs shipped suite)
- [ ] No contradiction with CLAUDE.md / WORKSPACE_MEMORY
