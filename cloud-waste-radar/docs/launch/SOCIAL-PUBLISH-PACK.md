# Publish pack — Reddit · X · LinkedIn

**Product:** P11 cloud-waste-radar (`@bhaskarauthor/cloud-waste-radar@0.1.0-alpha.1`)  
**Category:** Cloud FinOps  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/cloud-waste-radar/demo/social/cloud-waste-radar-social-1080p.mp4`

Also: `cloud-waste-radar/demo/cloud-waste-radar-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/cloud-waste-radar
npx @bhaskarauthor/cloud-waste-radar --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd cloud-waste-radar && npm test && npm run demo
node cloud-waste-radar/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups — free OSS alpha CLI (P11)
```

**Body**
```
Surveys classically cite ~30% cloud waste; startups overprovision without FinOps staff.

I shipped a free open-source alpha CLI for this: **cloud-waste-radar**

```
npx @bhaskarauthor/cloud-waste-radar
npx @bhaskarauthor/cloud-waste-radar --json
```

What it is:
- Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups
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
Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups

Shipped **cloud-waste-radar** as a free local OSS alpha:

npx @bhaskarauthor/cloud-waste-radar

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Surveys classically cite ~30% cloud waste; startups overprovision without FinOps staff.

I built **cloud-waste-radar** — a free, local, open-source alpha CLI:

→ Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/cloud-waste-radar

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
open -R "/Users/bhaskar_pandey/Documents/development/cloud-waste-radar/demo/social/cloud-waste-radar-social-1080p.mp4"
```
