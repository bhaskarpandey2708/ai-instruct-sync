---
name: automation
description: >
  Senior automation engineering (20+ years bar): scripts, demos, litmus, publish,
  social pack generation, CI hooks. Use for scripting, batch jobs, suite-litmus,
  demo render, /automation, "generate packs", "run the suite".
---

# Automation — principal automation / platform bar

Automate the **repeatable**; never automate a wrong process. Prefer one solid
script over five brittle ones.

## This repo’s automation map

| Script / path | Job |
|---------------|-----|
| `scripts/suite-litmus.mjs` | Full product test truth |
| `scripts/suite-watch.mjs` | Interval self-check (no push) |
| `scripts/suite_story_demos.py` | 1080p story videos P04–P30 |
| `scripts/generate-social-packs.mjs` | Bulk social packs P06–P28 |
| `scripts/publish-suite.mjs` | npm publish helper |
| `scripts/generate_software_portfolio.py` | Portfolio source of truth |
| `scripts/scaffold_p05_p28.mjs` | Offline MVP scaffolds |

## Principles

1. **Idempotent** — re-run safe; skip exists on publish
2. **Hermetic** — tests/demos don’t need network
3. **Observable** — print product id, path, duration, exit
4. **Fail loud** — non-zero on real failure; don’t mask with `|| true` unless intentional
5. **Secrets** — no tokens in scripts; no literal malware signatures in fixtures
6. **Artifacts** — gitignore render scratch (`story_v2/frames`, wavs); keep final social mp4

## Demo / video automation

- Prefer `suite_story_demos.py --only <slug>`
- Quiet keyclicks (KEY_GAIN) for social
- After code CLI changes that affect terminal capture: **re-render** video
- Locale: prefer `en-US` number formatting in CLI so videos don’t show locale surprises

## Social pack automation

- Generator = baseline; **principal copywriting skill overrides** templates for go-live products
- After generate: human-quality rewrite for the **next** post (hooks)

## Publish automation

- Never `npm publish` / `git push` unless owner authorized (standing rule; exceptions when they explicitly ask)
- Bump version when code changed and version already on registry
- Lean `files` / `.npmignore` — no multi-MB scratch audio

## When building new automation

1. Write the manual 3-step procedure first
2. Script the middle; keep human confirm for push/publish/destructive
3. Add `--dry-run` if it mutates shared state
