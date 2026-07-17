# Publish pack — skill-sync (P06)

**Product:** `@bhaskarauthor/skill-sync@0.1.0-alpha.1`  
**Framing:** Free OSS alpha · local · zero deps · no paid pitch  
**Video:** `skill-sync/demo/social/skill-sync-social-1080p.mp4` (also `demo/skill-sync-demo-1080p.mp4`)

**Order:** Reddit → X → LinkedIn. Engage ~1h after Reddit.

**Try:**
```bash
npx @bhaskarauthor/skill-sync
npx @bhaskarauthor/skill-sync --json
```

**Open video:**
```bash
open -R "/Users/bhaskar_pandey/Documents/development/skill-sync/demo/social/skill-sync-social-1080p.mp4"
```

Copy-paste files (use these — kept in sync with this pack):
- `demo/social/POST_REDDIT.txt`
- `demo/social/POST_X.txt`
- `demo/social/POST_X_THREAD.txt` (optional)
- `demo/social/POST_LINKEDIN.txt`

---

## Hook strategy (why these lines)

| Platform | Hook job | Line |
|----------|----------|------|
| Reddit title | Specific pain + identity | “I kept pasting the same agent skill into 3 tools…” |
| X | Mini-story, punch | Fixed in Claude / Cursor still broken / week later |
| LinkedIn | Stake + reframe | Bug “came back” → packaging, not model |

Never lead with product name. Lead with the wound.

---

## 1) Reddit — r/ClaudeAI (primary)

**Submit:** https://www.reddit.com/r/ClaudeAI/submit · Image & Video · attach MP4

**Title**
```
I kept pasting the same agent skill into 3 tools. One of them was always stale.
```

**Body**
```
You know the move:

- Claude gets the good SKILL.md
- Cursor gets last week’s version
- Someone’s fork still has the “temporary” prompt from March

No semver. No “what changed.” Just Slack screenshots and hope.

I got tired of treating agent skills like random markdown files, so I shipped **skill-sync** — a free, local OSS alpha that treats skills like packages:

```
npx @bhaskarauthor/skill-sync
```

What it does today:
- Validate a skill package (name, version, skills[])
- Diff local vs remote → what would be **added** / **updated**
- `--json` for scripts / CI
- Zero runtime deps · MIT · nothing leaves your machine

Honest limit: alpha core (schema + plan/install math), not a full private registry SaaS yet. The point is stop the copy-paste drift *before* you build the whole platform.

Video attached.

npm: https://www.npmjs.com/package/@bhaskarauthor/skill-sync

If your “source of truth” for skills is a Notion page + vibes, I’d love feedback on the package shape.
```

### Also

| Sub | Title |
|-----|--------|
| r/cursor | Cursor rules / skills drift every time you “just paste the latest version” |
| r/LocalLLaMA | Tiny free CLI to version/sync agent skill packs (validate + install plan) |

Bodies: see `demo/social/POST_REDDIT.txt`

---

## 2) X / Twitter

**Single post (default)**
```
I fixed a skill in Claude.
Cursor still had the broken one.
Nobody noticed for a week.

Agent skills deserve versions — not “final_v3_REAL.md”.

skill-sync (free OSS alpha):
validate packs · plan adds/updates · local · zero deps

npx @bhaskarauthor/skill-sync

MIT
```

**Optional 3-post thread:** `demo/social/POST_X_THREAD.txt`

---

## 3) LinkedIn

```
I fixed an agent skill in one tool.
Two days later, a teammate’s Cursor still ran the old version — and the bug “came back.”

That wasn’t a model problem.
It was a packaging problem.

We version npm packages.
We barely version the prompts and skills that steer AI coding agents.

So I built skill-sync — a free, local, open-source alpha CLI that treats agent skills like packages:

→ Validate name, version, and skill entries
→ Diff local vs remote: what would be added or updated
→ JSON output for scripts and CI
→ Zero runtime dependencies — nothing leaves your machine

One command:

npx @bhaskarauthor/skill-sync

Honest limit: this is the offline core (schema + install plan), not a hosted private registry yet. Ship the discipline first; platform later.

If your team’s “skill source of truth” is a shared Drive folder and goodwill, this is for you. Feedback welcome.

#OpenSource #BuildInPublic #DevTools #AIcoding #ClaudeAI #Cursor #AgentSkills
```

---

## Checklist

- [ ] Preview video with sound
- [ ] Hook first — product name second
- [ ] Free OSS only (no seats / $)
- [ ] Reddit Image & Video + flair if available
- [ ] Stay for comments ~1h

## After post

Drop Reddit / X / LinkedIn URLs → engagement replies + `demos/WEEK_POSTING_LOG.md`
