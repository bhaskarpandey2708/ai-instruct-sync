# Publish pack — Reddit · X · LinkedIn

**Product:** P20 cyber-smb-shield (`@bhaskarauthor/cyber-smb-shield@0.1.0-alpha.1`)  
**Category:** Cyber / SMB  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/cyber-smb-shield/demo/social/cyber-smb-shield-social-1080p.mp4`

Also: `cyber-smb-shield/demo/cyber-smb-shield-demo-1080p.mp4` (if present)

**Try after npm publish:**
```bash
npx @bhaskarauthor/cyber-smb-shield
npx @bhaskarauthor/cyber-smb-shield --json fixtures/sample.json
```

**Until published / offline:**
```bash
cd cyber-smb-shield && npm test && npm run demo
node cyber-smb-shield/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
```
Managed cybersecurity starter pack for SMBs: DNS filter, phishing drills, backup check,… — free OSS alpha CLI (P20)
```

**Body**
```
SMBs are ransomware targets but cannot staff a SOC.

I shipped a free open-source alpha CLI for this: **cyber-smb-shield**

```
npx @bhaskarauthor/cyber-smb-shield
npx @bhaskarauthor/cyber-smb-shield --json
```

What it is:
- Managed cybersecurity starter pack for SMBs: DNS filter, phishing drills, backup check, score
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
Managed cybersecurity starter pack for SMBs: DNS filter, phishing drills, backup check, score

Shipped **cyber-smb-shield** as a free local OSS alpha:

npx @bhaskarauthor/cyber-smb-shield

Zero deps · --json · MIT

#OpenSource #devtools
```

---

## 3) LinkedIn

```
SMBs are ransomware targets but cannot staff a SOC.

I built **cyber-smb-shield** — a free, local, open-source alpha CLI:

→ Managed cybersecurity starter pack for SMBs: DNS filter, phishing drills, backup check, score
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

npx @bhaskarauthor/cyber-smb-shield

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
open -R "/Users/bhaskar_pandey/Documents/development/cyber-smb-shield/demo/social/cyber-smb-shield-social-1080p.mp4"
```
