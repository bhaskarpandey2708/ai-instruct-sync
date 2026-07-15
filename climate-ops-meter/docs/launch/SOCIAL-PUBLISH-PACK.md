# Publish pack — Reddit · X · LinkedIn

**Product:** P25 climate-ops-meter (`@bhaskarauthor/climate-ops-meter@0.1.0-alpha.1`)  
**Category:** Climate / ESG  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/climate-ops-meter/demo/social/climate-ops-meter-social-1080p.mp4`

Also: `climate-ops-meter/demo/climate-ops-meter-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/climate-ops-meter
npx @bhaskarauthor/climate-ops-meter --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd climate-ops-meter && npm test && npm run demo
node climate-ops-meter/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Lightweight Scope 1–3 carbon estimate and supplier survey tool for mid-market exporters — free OSS alpha CLI (P25)
```

**Body**
```
Exporters face ESG questionnaires without enterprise sustainability teams.

I shipped a free open-source alpha CLI for this: **climate-ops-meter**

```
npx @bhaskarauthor/climate-ops-meter
npx @bhaskarauthor/climate-ops-meter --json
```

What it is:
- Lightweight Scope 1–3 carbon estimate and supplier survey tool for mid-market exporters
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
Lightweight Scope 1–3 carbon estimate and supplier survey tool for mid-market exporters

Shipped **climate-ops-meter** as a free local OSS alpha:

npx @bhaskarauthor/climate-ops-meter

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Exporters face ESG questionnaires without enterprise sustainability teams.

I built **climate-ops-meter** — a free, local, open-source alpha CLI:

→ Lightweight Scope 1–3 carbon estimate and supplier survey tool for mid-market exporters
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/climate-ops-meter

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
open -R "/Users/bhaskar_pandey/Documents/development/climate-ops-meter/demo/social/climate-ops-meter-social-1080p.mp4"
```
