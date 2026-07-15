# Publish pack — Reddit · X · LinkedIn

**Product:** P30 agent-spend-guard (`agent-spend-guard@0.1.0-alpha.1`)  
**Suite slot:** 6th launch — **Control spend** (the suite’s money product)

**Video:**  
`/Users/bhaskar_pandey/Documents/development/agent-spend-guard/demo/social/agent-spend-guard-social-1080p.mp4`  
1920×1080 · quiet typing + terminal + soft BGM

**Links:**  
- Try: `npx agent-spend-guard`  
- `npx agent-spend-guard check` → exit 1 over budget (hooks/CI)  
- Suite: skill-scan · secret-guard · doctor · mcp-sync · instruct-sync

**Order:** Reddit → X → LinkedIn

---

## 1) Reddit — r/ClaudeAI

**Submit:** https://www.reddit.com/r/ClaudeAI/submit  
**Type:** Image & Video

**Title**
```
I built a kill-switch for Claude Code token bills — daily/monthly budgets, exit 1 when over
```

**Body**
```
Dashboards tell you what you spent *after* the damage. Indie teams still get 3× over budget by spring.

**agent-spend-guard** is a tiny local CLI:

```
npx agent-spend-guard            # spend vs budgets
npx agent-spend-guard init       # drop .spend-guard.json
npx agent-spend-guard check      # exit 1 when over — stop the agent
```

- Reads Claude Code transcripts (`~/.claude/projects`) + generic JSON events
- Daily / monthly / per-project USD ceilings
- Warn at 80%, **STOP** over limit
- Zero runtime deps, nothing leaves your machine

Wire into Claude Code hooks:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command",
        "command": "npx agent-spend-guard check --cwd ." }]
    }]
  }
}
```

[video attached]

npm: search `agent-spend-guard` (alpha)

Part of the AI hygiene suite: sync → doctor → mcp-sync → secret-guard → skill-scan → **spend-guard**.

Feedback on price tables / sources welcome.
```

### Also
| Sub | Angle |
|-----|--------|
| r/cursor | Budget + kill-switch for agent token spend (hooks/CI) |
| r/devops | CI gate: fail when AI agent spend exceeds budget |

---

## 2) X

```
Your agent doesn’t have a credit limit.

Dashboards show the bill later. By then it’s too late.

agent-spend-guard:
• meter Claude Code + events
• daily/monthly budgets
• check → exit 1 = kill-switch

npx agent-spend-guard check

Zero deps. Local. Wire into PreToolUse hooks.

#devtools #ClaudeAI #FinOps
```

---

## 3) LinkedIn

```
2026 is the year the token bill came due.

Teams blowing annual AI budgets by April. Licenses revoked. Finance discovering agent spend after the fact.

Dashboards explain the damage. Almost nothing indie-sized enforces a limit mid-session.

I built agent-spend-guard (open source, zero dependencies, local-only):

→ Meter real usage (Claude Code transcripts + generic events)
→ Budget daily / monthly / per-project USD
→ Kill-switch: `check` exits 1 so a hook or CI job can stop the agent

```
npx agent-spend-guard
npx agent-spend-guard check
```

Wire it into Claude Code PreToolUse hooks or your pipeline. One config file: `.spend-guard.json`.

This is the “control spend” layer of the AI dev hygiene suite I’m shipping:
sync → diagnose → secrets → skill security → **spend guardrails**

If you’ve ever been surprised by an AI invoice, this one’s for you. Feedback welcome.

#OpenSource #FinOps #AI #DevTools #ClaudeAI #BuildInPublic #SoftwareEngineering
```

---

## Checklist

- [ ] Preview video
- [ ] Confirm npm name/version: `npm view agent-spend-guard`
- [ ] Post Reddit → X → LinkedIn
- [ ] Cross-link from skill-scan / secret-guard posts later

**After secret-guard + skill-scan posts land**, this is the natural “money product” follow-up (2–4 days later, not same day).
