# Publish pack — Reddit · X · LinkedIn

**Product:** P04 secret-guard (`ai-secret-guard@0.1.0-beta.1`)  
**Suite slot:** 4th launch after instruct-sync → ai-setup-doctor → mcp-sync

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/secret-guard/demo/social/secret-guard-social-1080p.mp4`  

Same file: `secret-guard/demo/secret-guard-demo-1080p.mp4`  
1920×1080 · ~35s · typewriter + keyclicks + live terminal + BGM

**Links:**  
- npm: https://www.npmjs.com/package/ai-secret-guard  
- Source: https://github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard  
- Try: `npx ai-secret-guard@beta`

**Post order (recommended):** Reddit first (video-friendly) → X → LinkedIn  
Stay online ~1–2h after Reddit and reply to comments.

---

## 1) Reddit

### Primary — r/ClaudeAI (Day 1)

**Submit:** https://www.reddit.com/r/ClaudeAI/submit  
**Type:** Image & Video → upload the MP4  
**Flair:** Tools / Projects if available

**Title**
```
Classic secret scanners miss CLAUDE.md / Cursor rules / MCP env — so I built a focused open-source guard
```

**Body**
```
I use gitleaks. Still found live keys in `.cursor/rules` and hardcoded MCP `env` blocks — paths most scanners never prioritize.

**secret-guard** is a tiny CLI for that surface:

```
npx ai-secret-guard@beta
npx ai-secret-guard@beta --strict
npx ai-secret-guard@beta --sarif > out.sarif
```

What it scans:
- Agent rules (`CLAUDE.md`, `.cursor/rules`, AGENTS.md, …)
- MCP config env blocks (hardcoded tokens)
- `.env.example` “samples” that are actually live keys

Design:
- Zero runtime deps
- Redacted output
- Pre-commit / CI exit codes
- SARIF for GitHub Code Scanning
- MIT

[video attached — ~35s: problem → live scan on leaky fixture → CTA]

npm: https://www.npmjs.com/package/ai-secret-guard  
Repo: https://github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard

Sibling tools in the same suite: instruct-sync, ai-setup-doctor, mcp-sync.

Would love feedback on false positives / patterns to add.
```

### Also post (same day or +1)

| Sub | Submit | Title angle |
|-----|--------|-------------|
| r/cursor | https://www.reddit.com/r/cursor/submit | Secret keys in `.cursor/rules` and MCP JSON — open-source guard that actually scans them |
| r/LocalLLaMA | only if it fits | skip if too off-topic |
| r/devops | https://www.reddit.com/r/devops/submit | Pre-commit/CI secret scan for AI agent configs (not just .env) |
| r/netsec | optional | Keep technical; emphasize redaction + SARIF |

**r/cursor title**
```
Built a tiny OSS CLI that finds API keys in .cursor/rules and MCP env (gitleaks often misses these)
```

**r/cursor body** (shorter)
```
Pasted a key into a Cursor rule “just for a minute” once. Classic scanners never looked there.

```
npx ai-secret-guard@beta
```

Scans agent rules + MCP env + .env.example. Zero deps, redacted output, CI-friendly.

npm: https://www.npmjs.com/package/ai-secret-guard  
Repo: https://github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard

Video in post. Feedback welcome.
```

---

## 2) X / Twitter

**Compose:** https://x.com/compose/post  
**Attach:** same MP4 (native video)

### Single post (best for reach)
```
gitleaks and GitHub secret scanning miss the new leak surface:

CLAUDE.md · .cursor/rules · MCP env blocks · .env.example

I built secret-guard — one command that scans the AI paths classic tools ignore.

npx ai-secret-guard@beta

Zero deps · redacted output · pre-commit / CI / SARIF

npmjs.com/package/ai-secret-guard
```

### Optional thread (if you prefer)

**1/3**
```
Hot take: your AI coding setup is a secret scanner blind spot.

Keys get pasted into CLAUDE.md, Cursor rules, and MCP JSON.
gitleaks never looks there.
```

**2/3**
```
So I shipped secret-guard (open source beta).

• Scans agent rules + MCP env + .env.example
• Redacts findings
• Exit codes for pre-commit / CI
• SARIF for GitHub Code Scanning

npx ai-secret-guard@beta
```

**3/3**
```
Part of the AI dev hygiene suite:
instruct-sync → setup-doctor → mcp-sync → secret-guard

Video + repo ↓
github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard
```

**Hashtags (sparingly):** `#devtools #ClaudeAI #Cursor #OpenSource #security`

---

## 3) LinkedIn

**Compose:** https://www.linkedin.com/feed/  
Start a post → add video → paste text

### Post body
```
I keep finding API keys in places classic secret scanners never look.

Not .env.
Not source files.

CLAUDE.md. Cursor rules. MCP server env blocks. “Example” files that aren’t examples.

gitleaks and GitHub secret scanning are great at the old surface. The AI coding stack created a new one — and teams paste live tokens into it every day.

So I built secret-guard (open source beta).

What it does:
→ Scans AI agent rules, MCP configs, and sample env files
→ Flags live-looking keys (redacted in output)
→ Exits non-zero for pre-commit / CI
→ Optional SARIF for GitHub Code Scanning

One command (no install):

npx ai-secret-guard@beta

Design principles:
• Zero runtime dependencies
• Read-only by default
• Built for the AI workspace, not a generic repo crawl

Part of a small suite I’m shipping for multi-tool AI setups:
• instruct-sync — keep rules in sync
• ai-setup-doctor — diagnose the whole setup
• mcp-sync — sync MCP servers across clients
• secret-guard — stop secrets in AI paths

npm: https://www.npmjs.com/package/ai-secret-guard  
Source: https://github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard

If you’ve ever pasted a key into a rules file “just for a minute,” this one’s for you. Feedback welcome.

#OpenSource #DevTools #CyberSecurity #ClaudeAI #Cursor #BuildInPublic #AIcoding #SoftwareEngineering
```

**Tip:** First line is the hook. Upload video natively (don’t only link GitHub).

---

## Checklist before Post

- [x] npm live: `ai-secret-guard@0.1.0-beta.1`
- [x] Video: 1920×1080 · ~35s · audio
- [ ] Preview video once with sound on
- [ ] Logged into Reddit / X / LinkedIn
- [ ] Reddit: Image & Video type + flair
- [ ] After Reddit: reply for 1–2h

## Open video in Finder

```bash
open -R "/Users/bhaskar_pandey/Documents/development/secret-guard/demo/social/secret-guard-social-1080p.mp4"
```

---

## What I can’t do from this CLI

Posting needs **your** logged-in browser. This pack is copy-paste ready.

After you post, drop the three URLs (Reddit / X / LinkedIn) and we can track engagement + draft follow-ups.
