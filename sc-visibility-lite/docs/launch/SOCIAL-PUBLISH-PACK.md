# Publish pack — Reddit · X · LinkedIn

**Product:** P26 supply-chain-visibility-lite (`@bhaskarauthor/sc-visibility-lite@0.1.0-alpha.1`)  
**Category:** Supply Chain  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/sc-visibility-lite/demo/social/sc-visibility-lite-social-1080p.mp4`

Also: `sc-visibility-lite/demo/sc-visibility-lite-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/sc-visibility-lite
npx @bhaskarauthor/sc-visibility-lite --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd sc-visibility-lite && npm test && npm run demo
node sc-visibility-lite/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Lite multi-tier supplier status & risk notes for SMEs without SAP budgets — free OSS alpha CLI (P26)
```

**Body**
```
SMEs lack visibility beyond tier-1 suppliers; enterprise SC tools are overkill.

I shipped a free open-source alpha CLI for this: **sc-visibility-lite**

```
npx @bhaskarauthor/sc-visibility-lite
npx @bhaskarauthor/sc-visibility-lite --json
```

What it is:
- Lite multi-tier supplier status & risk notes for SMEs without SAP budgets
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
Lite multi-tier supplier status & risk notes for SMEs without SAP budgets

Shipped **sc-visibility-lite** as a free local OSS alpha:

npx @bhaskarauthor/sc-visibility-lite

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
SMEs lack visibility beyond tier-1 suppliers; enterprise SC tools are overkill.

I built **sc-visibility-lite** — a free, local, open-source alpha CLI:

→ Lite multi-tier supplier status & risk notes for SMEs without SAP budgets
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/sc-visibility-lite

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
open -R "/Users/bhaskar_pandey/Documents/development/sc-visibility-lite/demo/social/sc-visibility-lite-social-1080p.mp4"
```
