# Publish pack — Reddit · X · LinkedIn

**Product:** P29 agent-skill-scan (`agent-skill-scan@0.1.0-alpha.1`)  
**Suite slot:** 5th launch — **Secure** pillar after instruct-sync → doctor → mcp-sync → secret-guard

**Video:**  
`/Users/bhaskar_pandey/Documents/development/agent-skill-scan/demo/social/agent-skill-scan-social-1080p.mp4`  
(also `agent-skill-scan/demo/agent-skill-scan-demo-1080p.mp4`)  
1920×1080 · ~35s · quiet typing + live terminal + soft BGM

**Links:**  
- npm: https://www.npmjs.com/package/agent-skill-scan  
- Try: `npx agent-skill-scan`  
- Suite siblings: instruct-sync · ai-setup-doctor · mcp-config-sync · ai-secret-guard

**Order:** Reddit → X → LinkedIn. Stay for comments after Reddit.

---

## 1) Reddit — r/ClaudeAI (primary)

**Submit:** https://www.reddit.com/r/ClaudeAI/submit  
**Type:** Image & Video → upload MP4

**Title**
```
Your agent will happily run a marketplace skill. I built a one-command security scan for skills / MCP / rules / hooks
```

**Body**
```
A 2026 audit of ~4,000 marketplace agent skills found **36.8% with at least one security flaw** and **1,467 malicious payloads** (Snyk ToxicSkills). MCP audits graded most servers F.

I got tired of installing a “helpful” skill without knowing if it:

- injects “ignore previous instructions”
- harvests env vars to Discord/Telegram/request bins
- hides zero-width Unicode in CLAUDE.md
- runs `curl | sh` from a hook that fires automatically

So I shipped **agent-skill-scan** (open source, read-only, zero deps):

```
npx agent-skill-scan
npx agent-skill-scan --no-user          # project only / CI
npx agent-skill-scan --strict --min-score 80
```

What it checks:
- **skills** — injection, exfil, reverse shells, obfuscation, live credentials
- **mcp** — hardcoded secrets, unpinned npx/uvx, plain HTTP remotes
- **rules** — same threats + invisible Unicode smuggling
- **hooks** — dangerous commands that auto-run with your shell

Score out of 100. Exit 1 on high/critical for CI.

[video ~35s attached]

npm: https://www.npmjs.com/package/agent-skill-scan  

Sibling tools: instruct-sync, ai-setup-doctor, mcp-sync, secret-guard.

Honest limit: heuristic, not a sandbox. A clean scan lowers risk; it is not a guarantee. Feedback on false positives welcome.
```

### Also post

| Sub | Title angle |
|-----|-------------|
| https://www.reddit.com/r/cursor/submit | Scan Cursor rules, MCP, and commands for prompt injection / exfil before they run |
| https://www.reddit.com/r/netsec/submit | (optional) Agent skill supply-chain scanner for Claude/Cursor workspaces |
| https://www.reddit.com/r/devops/submit | CI gate for AI agent skills/MCP: `npx agent-skill-scan --strict` |

---

## 2) X / Twitter

**Compose:** https://x.com/compose/post · attach MP4

```
Your agent will run SKILL.md without reading it.

Marketplace skills: injection, env exfil, curl|sh, hidden Unicode.

I shipped agent-skill-scan — one command, local, zero deps:

npx agent-skill-scan

skills · MCP · rules · hooks
score / 100 · CI exit codes

npmjs.com/package/agent-skill-scan
```

### Optional thread

**1/3**
```
Hot take: agent skills are a supply chain now.

36.8% of marketplace skills had a security flaw in a 2026 audit.
Your agent will still install them in one click.
```

**2/3**
```
agent-skill-scan (OSS):

• prompt injection + exfil patterns
• MCP secrets / unpinned npx
• invisible Unicode in rules
• auto-firing hooks

npx agent-skill-scan
```

**3/3**
```
Suite so far:
instruct-sync → doctor → mcp-sync → secret-guard → skill-scan

Next: spend kill-switch.

npmjs.com/package/agent-skill-scan
```

---

## 3) LinkedIn

```
AI coding agents now execute content you didn’t write: marketplace skills, MCP servers, shared rules, auto-firing hooks.

That is a supply chain.

A 2026 audit found over a third of marketplace agent skills with security flaws — and hundreds of malicious payloads. Most MCP servers scored poorly on security reviews. Prompt injection is a top developer concern for a reason.

I built agent-skill-scan (open source, read-only, zero dependencies).

What it does:
→ Scans skills, MCP configs, rules files, and hooks
→ Flags injection, secret exfiltration, dangerous shell, hidden Unicode
→ Scores 0–100 and fails CI with --strict / --min-score

One command:

npx agent-skill-scan

Part of the AI dev hygiene suite I’m shipping:
• instruct-sync — keep rules in sync
• ai-setup-doctor — diagnose the whole setup
• mcp-sync — sync MCP servers
• secret-guard — secrets in AI paths
• agent-skill-scan — skill/MCP/rules/hooks security

npm: https://www.npmjs.com/package/agent-skill-scan

If you install skills or MCP servers from the internet, this is for you. Feedback welcome.

#OpenSource #AISecurity #DevTools #ClaudeAI #Cursor #BuildInPublic #CyberSecurity #SoftwareEngineering
```

---

## Checklist

- [ ] Preview video with sound (typing should be quiet)
- [ ] `npx agent-skill-scan@latest --help` (or alpha tag if not latest)
- [ ] Reddit → X → LinkedIn
- [ ] Reply to comments 1–2h after Reddit

**Note:** Package is alpha on npm. Prefer `npx agent-skill-scan@0.1.0-alpha.1` in posts if `latest` is unclear — verify with `npm view agent-skill-scan`.
