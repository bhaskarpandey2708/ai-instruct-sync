---
name: documentary-demo
description: >
  Senior documentary-style product video production (20+ years bar). Story
  structure, cold open, tension, evidence, CTA. Use for demo video, social
  video, re-render story, /documentary-demo, "make the video more engaging",
  production storytelling, tech documentary POV.
---

# Documentary demo video — series director / 20+ year bar

You are not making a feature list with music. You are making a **3–5 beat short
film** where the product is the only logical resolution.

## Non-negotiables

1. **Cold open before brand** — first 2–4s: tension, contradiction, or crime-scene detail. Logo later.
2. **One spine** — one wound, one investigation, one tool. No suite dump mid-film.
3. **Show the mess** before the fix — stale file names, wrong tool, bug returning.
4. **Evidence > adjectives** — terminal output, diffs, counts, timestamps.
5. **Silence is a cut** — hold frames; don’t fill every second with typing SFX.
6. **Mute-safe** — story readable with sound off (titles, lower thirds).
7. **Earn the CTA** — command only after the viewer already wants the discipline.

## Documentary beat sheet (≈40–55s social)

| Beat | Time | Job |
|------|------|-----|
| **Cold open** | 0–5s | Paradox or failure in plain language |
| **World** | 5–12s | How the broken system works (paste / tabs / hope) |
| **Stakes** | 12–18s | Cost: reopened bug, wrong agent behavior, wasted week |
| **Investigation** | 18–32s | Live evidence (CLI / fixtures) — slow enough to read |
| **Turn** | 32–40s | Name the discipline (product) once the need is clear |
| **CTA** | 40–50s | One command, hold, no hype |

Optional chapter cards: `01 THE PASTE SYSTEM` · `02 THE COST` · `03 THE PROOF` — short, high contrast.

## Visual grammar (tech documentary)

- Dark room, not neon carnival
- Large type for claims; mono for evidence
- Lower-third captions, not walls of marketing
- Terminal as **interview subject** — type command, pause, stream truth
- Accent color = one series identity, not rainbow

## Audio

- Soft bed under investigation; drop slightly under terminal
- Keyclicks ambient only (never the star)
- No stock “inspiring startup” risers on security/finops topics

## Anti-patterns

- Product name in frame 1
- “P06 · AI DEV HYGIENE” as the emotional open
- Feature checklist as the whole middle
- CTA longer than the problem
- Unreadable JSON dump without narrative framing

## This monorepo

- Default renderer: `scripts/suite_story_demos.py` (good baseline)
- **Documentary pass:** product-specific scripts when quality must jump (e.g. `scripts/render_skill_sync_documentary.py`)
- Outputs: `demo/<slug>-demo-1080p.mp4` + `demo/social/<slug>-social-1080p.mp4`
- After CLI output changes: re-render before social post
- Pair with **copywriting** skill so post hooks match cold open

## Delivery checklist

- [ ] Cold open works silent
- [ ] Product named after minute-of-need (not first title)
- [ ] Terminal readable at 1080p phone crop (safe margins)
- [ ] ≤55s for social; no dead air longer than intentional hold
- [ ] Honest alpha limit in end card or post, not mid-tension
