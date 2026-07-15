# Publish pack — Reddit · X · LinkedIn

**Product:** P05 llm-spend (`@bhaskarauthor/llm-spend@0.1.0-alpha.3`)  
**Framing:** **Free open-source CLI only** — no seats, no SaaS, no paid tier in copy.

**Video (attach everywhere):**  
`/Users/bhaskar_pandey/Documents/development/llm-spend/demo/social/llm-spend-social-1080p.mp4`  

Also: `llm-spend/demo/llm-spend-demo-1080p.mp4`  
1920×1080 · ~40s · story + live terminal

**Try (after publish):**  
```bash
npx @bhaskarauthor/llm-spend
npx @bhaskarauthor/llm-spend --strict --budget 50 usage.json
```

**Until npm publish:** run from clone  
```bash
node llm-spend/src/cli.js fixtures/sample.json
```

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit.

---

## 1) Reddit

### Primary — r/LocalLLaMA or r/ClaudeAI

**r/ClaudeAI title**
```
OpenAI + Anthropic + Gemini bills live in five tabs — I built a free one-command cost rollup
```

**Body**
```
I kept bouncing between provider dashboards to answer “what did we actually spend on LLMs this week?”

**llm-spend** is a tiny free CLI that rolls up a usage export:

```
npx @bhaskarauthor/llm-spend usage.json
npx @bhaskarauthor/llm-spend --budget 50 --strict usage.jsonl
```

What you get:
- By **provider** (OpenAI, Anthropic, Google, Azure, …)
- By **model** (built-in list prices for Claude / GPT / Gemini families)
- By **project** and **day**
- Budget line + **exit 1** with `--strict` for CI

Design:
- Zero runtime deps
- Local only — nothing leaves your machine
- JSON or JSONL exports
- MIT

Honest: list prices ≠ enterprise invoices. Bring your own `costUsd` per event if you have exact numbers.

[video attached]

Feedback on export formats welcome.
```

### Also post

| Sub | Title angle |
|-----|-------------|
| r/devops | CI-friendly LLM cost rollup from usage JSON (`--strict` exit codes) |
| r/OpenAI | Multi-provider spend report when you’re not only on OpenAI |
| r/MachineLearning | optional — keep practical, not research |

---

## 2) X / Twitter

**Attach:** same MP4

```
OpenAI bill. Anthropic bill. Gemini bill. Azure bill.

I shipped llm-spend — free local CLI, one command:

npx @bhaskarauthor/llm-spend usage.json

provider · model · project · day
budget + --strict for CI

Zero deps · MIT
```

### Optional thread

**1/3**
```
Hot take: if your LLM cost lives in five provider dashboards, you don’t have FinOps — you have tabs.
```

**2/3**
```
llm-spend (OSS):

• rollup JSON / JSONL usage exports
• by provider / model / project / day
• built-in list prices + costUsd override
• --strict exit 1 over budget

npx @bhaskarauthor/llm-spend
```

**3/3**
```
Free CLI only. Local. Zero deps.

Video ↓
```

---

## 3) LinkedIn

```
I kept answering “how much did we spend on LLMs?” by opening four browser tabs.

So I built llm-spend — a free, local, open-source CLI that rolls up multi-provider usage in one command.

What it does:
→ Reads JSON or JSONL usage exports
→ Breaks cost down by provider, model, project, and day
→ Applies approximate list prices (or your own costUsd)
→ Shows budget used % and can fail CI with --strict

One command (no install after npm publish):

npx @bhaskarauthor/llm-spend usage.json

Design principles:
• Zero runtime dependencies
• Read-only, nothing leaves your machine
• Built for engineers who need a rollup now — not a finance dashboard next quarter

Honest limit: list prices are budget-accurate, not invoice-exact. Override with real costs when you have them.

If you’ve ever paste-reconciled three provider invoices into a spreadsheet, this one’s for you. Feedback welcome.

#OpenSource #DevTools #FinOps #LLM #BuildInPublic #AIcoding
```

**Tip:** First line is the hook. Upload video natively.

---

## Checklist before post

- [ ] Preview video once with sound on
- [ ] npm live **or** post clearly as open-source repo/local CLI (if not published yet)
- [ ] Copy mentions **free** only — no seats / SaaS / pricing tiers
- [ ] Reddit: Image & Video type
- [ ] After Reddit: reply 1–2h

## Open video in Finder

```bash
open -R "/Users/bhaskar_pandey/Documents/development/llm-spend/demo/social/llm-spend-social-1080p.mp4"
```

---

## What I can’t do from this CLI

Posting needs **your** logged-in browser. This pack is copy-paste ready.

After you post, drop the three URLs and we can draft follow-ups.
