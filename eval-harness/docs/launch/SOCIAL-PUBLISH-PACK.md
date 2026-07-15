# Publish pack — Reddit · X · LinkedIn

**Product:** P08 eval-harness (`@bhaskarauthor/eval-harness@0.1.0-alpha.1`)  
**Category:** AI Tooling  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/eval-harness/demo/social/eval-harness-social-1080p.mp4`

Also: `eval-harness/demo/eval-harness-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/eval-harness
npx @bhaskarauthor/eval-harness --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd eval-harness && npm test && npm run demo
node eval-harness/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Lightweight eval harness for prompt/agent regression tests in CI for product teams — free OSS alpha CLI (P08)
```

**Body**
```
Prompt changes break behavior silently; full ML platforms are overkill for app teams.

I shipped a free open-source alpha CLI for this: **eval-harness**

```
npx @bhaskarauthor/eval-harness
npx @bhaskarauthor/eval-harness --json
```

What it is:
- Lightweight eval harness for prompt/agent regression tests in CI for product teams
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
Lightweight eval harness for prompt/agent regression tests in CI for product teams

Shipped **eval-harness** as a free local OSS alpha:

npx @bhaskarauthor/eval-harness

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
Prompt changes break behavior silently; full ML platforms are overkill for app teams.

I built **eval-harness** — a free, local, open-source alpha CLI:

→ Lightweight eval harness for prompt/agent regression tests in CI for product teams
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/eval-harness

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
open -R "/Users/bhaskar_pandey/Documents/development/eval-harness/demo/social/eval-harness-social-1080p.mp4"
```
