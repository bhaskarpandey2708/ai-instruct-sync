# 1-week social calendar — P06 → P28

**Generated:** 2026-07-15  
**Rule:** Free OSS alpha CLI only. No paid product / seats / SaaS pricing in posts.  
**Cadence:** 3–4 products/day max. Reddit → X → LinkedIn. One primary sub per product.  
**Order within day:** post morning product first; space 2–3h; engage comments before next.

**Not in this week:** P01–P05 (already shipped/social track), P29–P30 (suite secure/spend — separate cadence).

---

## Day 1 — Mon — AI tooling (**documentary ready**)

| ID | Product | Video (~50s doc) | Pack + Premium X |
|----|---------|------------------|------------------|
| P06 | skill-sync | `skill-sync/demo/social/skill-sync-social-1080p.mp4` | pack + `POST_X_PREMIUM.txt` |
| P07 | shadow-ai | `shadow-ai/demo/social/shadow-ai-social-1080p.mp4` | pack + `POST_X_PREMIUM.txt` |
| P08 | eval-harness | `eval-harness/demo/social/eval-harness-social-1080p.mp4` | pack + `POST_X_PREMIUM.txt` |

Space 2–3h · Reddit → X Premium long → LinkedIn. Deep terminal proof in each video.

## Day 2 — Tue — Security signals (**documentary ready**)

| ID | Product | Video (~50s doc) | Pack + Premium X |
|----|---------|------------------|------------------|
| P09 | auth-anomaly-radar | `auth-anomaly-radar/demo/social/auth-anomaly-radar-social-1080p.mp4` | pack + `POST_X_PREMIUM.txt` |
| P10 | fraud-signal-kit | `fraud-signal-kit/demo/social/fraud-signal-kit-social-1080p.mp4` | pack + `POST_X_PREMIUM.txt` |
| P20 | cyber-smb-shield | *(baseline pack — doc upgrade later)* | pack |
| P28 | api-contract-sentinel | *(baseline pack — doc upgrade later)* | pack |

**Re-render P07–P10:** `python3 scripts/render_documentary_product.py --only shadow-ai,eval-harness,auth-anomaly-radar,fraud-signal-kit`

**Copy-paste posts:** each product’s `demo/social/POST_*.txt`

## Day 3 — Wed — Cloud & data

| ID | Product | Video | Pack |
|----|---------|-------|------|
| P11 | cloud-waste-radar | `cloud-waste-radar/demo/social/cloud-waste-radar-social-1080p.mp4` | `cloud-waste-radar/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P12 | dev-onboard-os | `dev-onboard-os/demo/social/dev-onboard-os-social-1080p.mp4` | `dev-onboard-os/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P21 | data-quality-guard | `data-quality-guard/demo/social/data-quality-guard-social-1080p.mp4` | `data-quality-guard/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P14 | grc-evidence-autopilot | `grc-evidence-autopilot/demo/social/grc-evidence-autopilot-social-1080p.mp4` | `grc-evidence-autopilot/docs/launch/SOCIAL-PUBLISH-PACK.md` |

**Copy-paste posts:** each product’s `demo/social/POST_*.txt`

## Day 4 — Thu — India ops

| ID | Product | Video | Pack |
|----|---------|-------|------|
| P15 | wa-ops-desk | `wa-ops-desk/demo/social/wa-ops-desk-social-1080p.mp4` | `wa-ops-desk/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P16 | gst-ops-copilot | `gst-ops-copilot/demo/social/gst-ops-copilot-social-1080p.mp4` | `gst-ops-copilot/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P17 | appt-book-india | `appt-book-india/demo/social/appt-book-india-social-1080p.mp4` | `appt-book-india/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P18 | clinic-admin-lite | `clinic-admin-lite/demo/social/clinic-admin-lite-social-1080p.mp4` | `clinic-admin-lite/docs/launch/SOCIAL-PUBLISH-PACK.md` |

**Copy-paste posts:** each product’s `demo/social/POST_*.txt`

## Day 5 — Fri — Life / learning

| ID | Product | Video | Pack |
|----|---------|-------|------|
| P19 | learn-loop | `learn-loop/demo/social/learn-loop-social-1080p.mp4` | `learn-loop/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P22 | care-companion | `care-companion/demo/social/care-companion-social-1080p.mp4` | `care-companion/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P23 | personal-crm | `personal-crm/demo/social/personal-crm-social-1080p.mp4` | `personal-crm/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P27 | focus-forge | `focus-forge/demo/social/focus-forge-social-1080p.mp4` | `focus-forge/docs/launch/SOCIAL-PUBLISH-PACK.md` |

**Copy-paste posts:** each product’s `demo/social/POST_*.txt`

## Day 6 — Sat — Creator & climate & SC

| ID | Product | Video | Pack |
|----|---------|-------|------|
| P24 | creator-ops | `creator-ops/demo/social/creator-ops-social-1080p.mp4` | `creator-ops/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P25 | climate-ops-meter | `climate-ops-meter/demo/social/climate-ops-meter-social-1080p.mp4` | `climate-ops-meter/docs/launch/SOCIAL-PUBLISH-PACK.md` |
| P26 | supply-chain-visibility-lite | `sc-visibility-lite/demo/social/sc-visibility-lite-social-1080p.mp4` | `sc-visibility-lite/docs/launch/SOCIAL-PUBLISH-PACK.md` |

**Copy-paste posts:** each product’s `demo/social/POST_*.txt`

## Day 7 — Sun — buffer / repost best + engagement

Engagement day: reply to comments, repost best-performing clip, pin one thread.

## Daily checklist

1. `open -R "<video path>"` — watch once with sound  
2. Paste Reddit body + attach MP4  
3. X single post + MP4  
4. LinkedIn + MP4  
5. Drop three URLs in chat / `demos/WEEK_POSTING_LOG.md`  

## Honest product stance

These are **offline MVP cores** (litmus-tested, demo fixtures). Post as **alpha tools**, not finished enterprise SaaS. Invite format feedback.

## Regenerate packs

```bash
node scripts/generate-social-packs.mjs --from 6 --to 28
```
