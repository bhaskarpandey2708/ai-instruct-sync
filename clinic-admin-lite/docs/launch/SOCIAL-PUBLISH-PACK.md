# Publish pack — Reddit · X · LinkedIn

**Product:** P18 clinic-admin-lite (`@bhaskarauthor/clinic-admin-lite@0.1.0-alpha.1`)  
**Category:** India SMB / Health Ops  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/clinic-admin-lite/demo/social/clinic-admin-lite-social-1080p.mp4`

Also: `clinic-admin-lite/demo/clinic-admin-lite-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/clinic-admin-lite
npx @bhaskarauthor/clinic-admin-lite --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd clinic-admin-lite && npm test && npm run demo
node clinic-admin-lite/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for smal… — free OSS alpha CLI (P18)
```

**Body**
```
Small Indian clinics still paper/Excel; full HMS is overkill and expensive.

I shipped a free open-source alpha CLI for this: **clinic-admin-lite**

```
npx @bhaskarauthor/clinic-admin-lite
npx @bhaskarauthor/clinic-admin-lite --json
```

What it is:
- Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for small practices
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
Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for small practices

Shipped **clinic-admin-lite** as a free local OSS alpha:

npx @bhaskarauthor/clinic-admin-lite

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Small Indian clinics still paper/Excel; full HMS is overkill and expensive.

I built **clinic-admin-lite** — a free, local, open-source alpha CLI:

→ Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for small practices
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/clinic-admin-lite

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
open -R "/Users/bhaskar_pandey/Documents/development/clinic-admin-lite/demo/social/clinic-admin-lite-social-1080p.mp4"
```
