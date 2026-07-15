# Publish pack — Reddit · X · LinkedIn

**Product:** P16 gst-ops-copilot (`@bhaskarauthor/gst-ops-copilot@0.1.0-alpha.1`)  
**Category:** India SMB / Fintech  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/gst-ops-copilot/demo/social/gst-ops-copilot-social-1080p.mp4`

Also: `gst-ops-copilot/demo/gst-ops-copilot-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/gst-ops-copilot
npx @bhaskarauthor/gst-ops-copilot --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd gst-ops-copilot && npm test && npm run demo
node gst-ops-copilot/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs — free OSS alpha CLI (P16)
```

**Body**
```
SMEs struggle with invoice data quality and GSTR mismatches before CA filing.

I shipped a free open-source alpha CLI for this: **gst-ops-copilot**

```
npx @bhaskarauthor/gst-ops-copilot
npx @bhaskarauthor/gst-ops-copilot --json
```

What it is:
- GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs
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
GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs

Shipped **gst-ops-copilot** as a free local OSS alpha:

npx @bhaskarauthor/gst-ops-copilot

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
SMEs struggle with invoice data quality and GSTR mismatches before CA filing.

I built **gst-ops-copilot** — a free, local, open-source alpha CLI:

→ GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/gst-ops-copilot

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
open -R "/Users/bhaskar_pandey/Documents/development/gst-ops-copilot/demo/social/gst-ops-copilot-social-1080p.mp4"
```
