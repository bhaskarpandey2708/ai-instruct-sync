# Publish pack — Reddit · X · LinkedIn

**Product:** P14 grc-evidence-autopilot (`@bhaskarauthor/grc-evidence-autopilot@0.1.0-alpha.1`)  
**Category:** Compliance / GRC  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/grc-evidence-autopilot/demo/social/grc-evidence-autopilot-social-1080p.mp4`

Also: `grc-evidence-autopilot/demo/grc-evidence-autopilot-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/grc-evidence-autopilot
npx @bhaskarauthor/grc-evidence-autopilot --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd grc-evidence-autopilot && npm test && npm run demo
node grc-evidence-autopilot/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO star… — free OSS alpha CLI (P14)
```

**Body**
```
SOC2 prep is spreadsheet hell; evidence collection is continuous toil.

I shipped a free open-source alpha CLI for this: **grc-evidence-autopilot**

```
npx @bhaskarauthor/grc-evidence-autopilot
npx @bhaskarauthor/grc-evidence-autopilot --json
```

What it is:
- Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO startups
- Offline / local-first MVP core
- Zero runtime dependencies
- `--json` for CI / scripts
- MIT

Honest: this is an alpha domain core (fixtures + litmus), not a full SaaS product.

[video attached]

Feedback welcome on false positives / formats to support.
```

### Optional subs (pick 1–2 that fit)

| Angle | Where |
|-------|--------|
| DevTools / AI | r/ClaudeAI, r/cursor, r/LocalLLaMA |
| Security | r/netsec, r/cybersecurity |
| India ops | r/india, r/developersIndia |
| Startup | r/SaaS, r/startups (soft pitch only) |

---

## 2) X / Twitter

**Attach:** same MP4

```
Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO startups

Shipped **grc-evidence-autopilot** as a free local OSS alpha:

npx @bhaskarauthor/grc-evidence-autopilot

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
SOC2 prep is spreadsheet hell; evidence collection is continuous toil.

I built **grc-evidence-autopilot** — a free, local, open-source alpha CLI:

→ Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO startups
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/grc-evidence-autopilot

Honest limit: alpha MVP core, not a full hosted product. Built to ship learnings in public.

Feedback welcome.

#OpenSource #BuildInPublic #DevTools #AI
```

**Tip:** First line is the hook. Upload video natively.

---

## Checklist

- [ ] Preview video with sound
- [ ] Free OSS framing only (no $ / seats / “buy”)
- [ ] npm live **or** clear “local alpha / clone” CTA
- [ ] Reddit: Image & Video type
- [ ] Reply to comments 1h

## Open video

```bash
open -R "/Users/bhaskar_pandey/Documents/development/grc-evidence-autopilot/demo/social/grc-evidence-autopilot-social-1080p.mp4"
```
