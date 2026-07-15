# Publish pack — Reddit · X · LinkedIn

**Product:** P07 shadow-AI (`@bhaskarauthor/shadow-ai@0.1.0-alpha.1`)  
**Category:** AI Tooling / Security / GRC  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/shadow-ai/demo/social/shadow-ai-social-1080p.mp4`

Also: `shadow-ai/demo/shadow-ai-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/shadow-ai
npx @bhaskarauthor/shadow-ai --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd shadow-ai && npm test && npm run demo
node shadow-ai/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Discover unauthorized AI tools, browser extensions, and SaaS usage across the enterprise — free OSS alpha CLI (P07)
```

**Body**
```
Employees paste company data into consumer ChatGPT/Claude without IT visibility.

I shipped a free open-source alpha CLI for this: **shadow-ai**

```
npx @bhaskarauthor/shadow-ai
npx @bhaskarauthor/shadow-ai --json
```

What it is:
- Discover unauthorized AI tools, browser extensions, and SaaS usage across the enterprise
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
Discover unauthorized AI tools, browser extensions, and SaaS usage across the enterprise

Shipped **shadow-ai** as a free local OSS alpha:

npx @bhaskarauthor/shadow-ai

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Employees paste company data into consumer ChatGPT/Claude without IT visibility.

I built **shadow-ai** — a free, local, open-source alpha CLI:

→ Discover unauthorized AI tools, browser extensions, and SaaS usage across the enterprise
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/shadow-ai

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
open -R "/Users/bhaskar_pandey/Documents/development/shadow-ai/demo/social/shadow-ai-social-1080p.mp4"
```
