# Publish pack — Reddit · X · LinkedIn

**Product:** P22 care-companion (`@bhaskarauthor/care-companion@0.1.0-alpha.1`)  
**Category:** Consumer Care  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/care-companion/demo/social/care-companion-social-1080p.mp4`

Also: `care-companion/demo/care-companion-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/care-companion
npx @bhaskarauthor/care-companion --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd care-companion && npm test && npm run demo
node care-companion/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Family care coordination app: meds, appointments, shared notes for elders — free OSS alpha CLI (P22)
```

**Body**
```
Adult children coordinate elder care over chaotic WhatsApp groups.

I shipped a free open-source alpha CLI for this: **care-companion**

```
npx @bhaskarauthor/care-companion
npx @bhaskarauthor/care-companion --json
```

What it is:
- Family care coordination app: meds, appointments, shared notes for elders
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
Family care coordination app: meds, appointments, shared notes for elders

Shipped **care-companion** as a free local OSS alpha:

npx @bhaskarauthor/care-companion

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Adult children coordinate elder care over chaotic WhatsApp groups.

I built **care-companion** — a free, local, open-source alpha CLI:

→ Family care coordination app: meds, appointments, shared notes for elders
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/care-companion

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
open -R "/Users/bhaskar_pandey/Documents/development/care-companion/demo/social/care-companion-social-1080p.mp4"
```
