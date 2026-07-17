---
name: music-demo
description: >
  Senior audio taste for product demos (20+ years bar). BGM, SFX levels, social
  video sound. Use for demo audio, BGM, keyclick levels, /music-demo, "video too
  loud", story demo sound design.
---

# Music / demo sound — senior motion + sound design bar

Sound supports the story. If the viewer mutes, the **visual hierarchy** must still sell.

## Goals

- Social autoplay often starts muted → readable slides without audio
- With sound: soft BGM + subtle keyclick; never karaoke typing
- Length ~30–45s for social; don’t pad

## Levels (this repo)

- `suite_story_demos.py` uses `KEY_GAIN` ≈ quiet typing (~0.02 range historically)
- BGM under speech/terminal; no clipping
- Prefer one ambient bed; no genre whiplash mid-clip

## Checklist

- [ ] First 3s readable silent
- [ ] Terminal contrast high (dark theme, green/cyan accents OK)
- [ ] No ear-shatter key spam
- [ ] Final CTA frame holds ≥2s
- [ ] Export 1920×1080 H.264 + AAC

## Don’t

- Stock “corporate upbeat” that fights a security story
- Loud risers every cut
- Ship `story_v2/*.wav` to npm

## When adjusting

Re-render with `--only <slug>`; copy final to `demo/social/<slug>-social-1080p.mp4`.
