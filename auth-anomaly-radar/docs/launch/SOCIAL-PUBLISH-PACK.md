# Publish pack — Reddit · X · LinkedIn

**Product:** P09 auth-anomaly-radar (`@bhaskarauthor/auth-anomaly-radar@0.1.0-alpha.1`)  
**Category:** Security / Identity / Fraud  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/auth-anomaly-radar/demo/social/auth-anomaly-radar-social-1080p.mp4`

Also: `auth-anomaly-radar/demo/auth-anomaly-radar-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/auth-anomaly-radar
npx @bhaskarauthor/auth-anomaly-radar --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd auth-anomaly-radar && npm test && npm run demo
node auth-anomaly-radar/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing sig… — free OSS alpha CLI (P09)
```

**Body**
```
SMBs enable Auth0/Cognito but lack fraud signals without enterprise SIEM.

I shipped a free open-source alpha CLI for this: **auth-anomaly-radar**

```
npx @bhaskarauthor/auth-anomaly-radar
npx @bhaskarauthor/auth-anomaly-radar --json
```

What it is:
- Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)
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
Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)

Shipped **auth-anomaly-radar** as a free local OSS alpha:

npx @bhaskarauthor/auth-anomaly-radar

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
SMBs enable Auth0/Cognito but lack fraud signals without enterprise SIEM.

I built **auth-anomaly-radar** — a free, local, open-source alpha CLI:

→ Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/auth-anomaly-radar

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
open -R "/Users/bhaskar_pandey/Documents/development/auth-anomaly-radar/demo/social/auth-anomaly-radar-social-1080p.mp4"
```
