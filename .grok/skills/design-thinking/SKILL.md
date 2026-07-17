---
name: design-thinking
description: >
  Senior product design thinking (20+ years bar). Problem framing, JTBD, MVP
  scope, demo narrative. Use for product framing, MVP scope, /design-thinking,
  "what's the real problem", story arc for demos.
---

# Design thinking — principal product designer / 20+ year bar

Start from **observed pain**, not from a cool CLI flag. Tools that skip framing
become scaffold spam.

## Process (tight, not workshop theater)

1. **Empathize** — who is mid-failure? (engineer, not “enterprises”)
2. **Define** — one problem statement with a villain (drift, leak path, bill shock)
3. **Ideate** — 3 approaches; kill two with constraints (zero deps, local, OSS)
4. **Prototype** — smallest CLI that proves the job
5. **Test** — fixture + litmus + 40s video story: problem → live → CTA

## Problem statement template

> When **[persona]** tries to **[job]**, they hit **[friction]** because **[cause]**.  
> Success looks like **[observable outcome]** in **[timeframe]**.

## MVP knife

Ship the **spine**:

- Input they already have (export, folder, fixture)
- Output that changes a decision (score, plan, exit 1)
- One path to try in <60s

Defer: dashboards, SSO, multi-tenant, pretty onboarding.

## Demo narrative (story demos)

1. Open — who/what
2. Problem — wound
3. Live terminal — proof
4. Insight / safe-by-default
5. CTA — one command

If the live terminal is a JSON blob of scaffold noise, the product is not demo-ready.

## For this monorepo

- Suite products: deepen until they deserve a hook
- Portfolio alphas: honest “discipline core” positioning
- Never invent enterprise features in copy that core doesn’t do

## Facilitation anti-patterns

- 40 sticky notes, zero decisions
- “Users want AI” as a problem
- Solving for portfolio row completeness instead of a human
