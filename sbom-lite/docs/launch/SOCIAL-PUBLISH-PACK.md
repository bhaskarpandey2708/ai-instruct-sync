# Publish pack — Reddit · X · LinkedIn

**Product:** P13 sbom-lite (`@bhaskarauthor/sbom-lite@0.1.0-alpha.1`)  
**Category:** Security / Supply Chain  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/sbom-lite/demo/social/sbom-lite-social-1080p.mp4`

Also: `sbom-lite/demo/sbom-lite-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/sbom-lite
npx @bhaskarauthor/sbom-lite --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd sbom-lite && npm test && npm run demo
node sbom-lite/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI — free OSS alpha CLI (P13)
```

**Body**
```
Executive orders and enterprise buyers demand SBOMs; SMBs find tools heavy.

I shipped a free open-source alpha CLI for this: **sbom-lite**

```
npx @bhaskarauthor/sbom-lite
npx @bhaskarauthor/sbom-lite --json
```

What it is:
- Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI
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
Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI

Shipped **sbom-lite** as a free local OSS alpha:

npx @bhaskarauthor/sbom-lite

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Executive orders and enterprise buyers demand SBOMs; SMBs find tools heavy.

I built **sbom-lite** — a free, local, open-source alpha CLI:

→ Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/sbom-lite

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
open -R "/Users/bhaskar_pandey/Documents/development/sbom-lite/demo/social/sbom-lite-social-1080p.mp4"
```
