#!/usr/bin/env node
/** Principal social packs for P07–P10 (hooks + premium X). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P07",
    slug: "shadow-ai",
    npm: "@bhaskarauthor/shadow-ai",
    redditTitle:
      "IT’s AI inventory says “approved only.” The laptop has ChatGPT Free pasting company Notion.",
    redditBody: `Security’s catalog lists three approved tools.

The engineer’s browser has personal ChatGPT with confidential paste.
.cursor/mcp.json has an unpinned server nobody ticketed.
Somewhere a prompt landed on a public paste site.

That’s not “AI risk” in the abstract.
That’s **shadow AI** — assets with data classes, living outside the approved surface.

I shipped **shadow-ai** — free, local, OSS alpha:

\`\`\`
npx @bhaskarauthor/shadow-ai
\`\`\`

It scores an inventory of tools:
- unauthorized list
- riskScore / 100 (confidential weighted heavier)
- severity band

Honest limit: offline inventory core — not a full CASB/DLP platform.

Video: mini-doc · cold open → shadow surface → cost → live score → CTA.

If your “AI policy” is a PDF and a prayer, this is the boring inventory layer underneath.`,
    xPremium: `IT’s AI inventory says “approved only.”
The laptop has ChatGPT Free pasting company Notion.

I keep seeing the same pattern:

• Personal ChatGPT with confidential context  
• Random MCP servers in .cursor/mcp.json — unpinned, uncatalogued  
• Prompt dumps on public paste sites  
• Security still thinks the catalog is the truth  

Shadow AI isn’t a model problem.
It’s an **asset** problem with data classes attached.

**shadow-ai** (free local OSS alpha) scores a tool inventory:

→ unauthorized names  
→ riskScore / 100 (confidential weighted)  
→ severity: low · medium · high  
→ zero runtime deps · MIT · nothing leaves the machine  

Live investigation style output:

\`\`\`
unauthorized (3)
  HIGH  ChatGPT Free (personal)
        CONF · browser-extension · company Notion paste
  HIGH  Random MCP server (unpinned npx)
...
severity         HIGH
riskScore         …
signal  company context is leaving the approved surface
\`\`\`

Honest limit: offline inventory core — not a full CASB.

One command:

npx @bhaskarauthor/shadow-ai

Video below (documentary cut).

What tool would show up first in *your* shadow inventory?

#OpenSource #DevTools #BuildInPublic #AIcoding #CyberSecurity #ShadowIT #ClaudeCode #Cursor #AgentSkills`,
    xShort: `IT approved three AI tools.
The laptop has seven.

Personal ChatGPT + confidential paste.
Unpinned MCP. Pastebin prompts.

shadow-ai — free local OSS alpha
inventory · riskScore · severity

npx @bhaskarauthor/shadow-ai

#OpenSource #DevTools #ShadowIT #AIcoding`,
    linkedin: `IT’s AI inventory says “approved only.”
The laptop has ChatGPT Free pasting company Notion.

That’s not abstract “AI risk.”
That’s shadow AI — tools with data classes living outside the catalog.

I built shadow-ai: a free, local, open-source alpha CLI that scores an inventory of AI tools — unauthorized list, riskScore, severity band. Zero runtime deps. Nothing leaves your machine.

npx @bhaskarauthor/shadow-ai

Honest limit: offline inventory core, not a full CASB. Discipline first.

#OpenSource #BuildInPublic #DevTools #CyberSecurity #AIcoding #ShadowIT`,
  },
  {
    id: "P08",
    slug: "eval-harness",
    npm: "@bhaskarauthor/eval-harness",
    redditTitle:
      "You changed the system prompt at 5pm. Ship at 6pm. How do you know the refuse-secrets case still passes?",
    redditBody: `Without golden cases, prompt edits are leaps of faith.

I wanted a tiny, local suite:

- expectContains / forbidContains  
- PASS / FAIL per case  
- suite GREEN or RED for CI  

**eval-harness** (free OSS alpha):

\`\`\`
npx @bhaskarauthor/eval-harness
\`\`\`

Demo suite deliberately includes a **regression-trap** that fails when the model leaks a demo key phrase — so you see RED before prod does.

Honest limit: offline string harness, not a hosted eval platform with LLM judges.

Video: cold open → blind ship → cost → live suite → CTA.`,
    xPremium: `You changed the system prompt at 5pm.
Ship at 6pm.

How do you know the refuse-secrets case still passes?

Most teams don’t.
They “vibe check” in the playground and call it QA.

Then a customer sees:
• a refusal rule that silently died  
• a summary format that regressed  
• a “helpful” model that pastes env-shaped secrets  

**eval-harness** is a free, local, open-source alpha for the boring spine:

→ cases with expectContains / forbidContains  
→ PASS / FAIL table  
→ suite GREEN or RED  
→ --json for CI  
→ zero runtime deps · MIT  

On a fixture built to hurt:

\`\`\`
case                  result
  summarize-email       PASS
  refuse-secrets        PASS
  no-shell-exfil        PASS
  regression-trap       FAIL
verdict         RED — gate should fail CI
signal  prompt/agent regression caught before ship
\`\`\`

That FAIL is the feature.

Honest limit: offline string checks — not a multi-model hosted eval cloud.

One command:

npx @bhaskarauthor/eval-harness

Video below (documentary).

What golden case would you add first?

#OpenSource #DevTools #BuildInPublic #AIcoding #LLM #PromptEngineering #CI #ClaudeCode #Cursor`,
    xShort: `Prompt tweak at 5pm. Ship at 6pm.
Did refuse-secrets still pass?

eval-harness — free local OSS alpha
golden cases · PASS/FAIL · CI-ready

npx @bhaskarauthor/eval-harness

#OpenSource #LLM #DevTools #AIcoding`,
    linkedin: `You changed the system prompt at 5pm. Ship at 6pm.
How do you know the refuse-secrets case still passes?

Without golden cases, prompt work is a leap of faith.

I built eval-harness — free, local, OSS alpha:
expectContains / forbidContains · PASS/FAIL · suite GREEN/RED · JSON for CI.

Honest limit: offline harness, not a hosted eval platform.

npx @bhaskarauthor/eval-harness

#OpenSource #BuildInPublic #DevTools #AIcoding #LLM #CI`,
  },
  {
    id: "P09",
    slug: "auth-anomaly-radar",
    npm: "@bhaskarauthor/auth-anomaly-radar",
    redditTitle:
      "Mumbai → San Francisco in two hours, same user. Your logs still say “login success.”",
    redditBody: `Successful login rows look calm.

Physics doesn’t.

**auth-anomaly-radar** scores a sequence:

- impossible travel (haversine + time)  
- credential stuffing (failure bursts)  
- risk: low / medium / high  

\`\`\`
npx @bhaskarauthor/auth-anomaly-radar
\`\`\`

Demo fixture: Mumbai→SFO ~2h + another user with 42 failures.

Honest limit: offline scoring core — not a full SIEM.

Video attached.`,
    xPremium: `Mumbai → San Francisco in two hours.
Same user.
Logs: login success.

That’s the quiet shape of account takeover.

Volume dashboards see traffic.
Sequences see incidents.

**auth-anomaly-radar** (free local OSS alpha) scores login *sequences*:

→ impossible travel via distance/time  
→ credential stuffing via failure bursts  
→ risk band: low · medium · high  
→ zero deps · MIT · offline  

Investigation output looks like:

\`\`\`
timeline
  dev@corp.io  @Mumbai
  dev@corp.io  @San Francisco
  ops@corp.io  @Delhi · failures=42

flags
  CRITICAL  impossible_travel  dev@corp.io
            ~~13,000 km  ·  absurd km/h
  HIGH      credential_stuffing  ops@corp.io
            failures=42
risk            HIGH
\`\`\`

Honest limit: offline core — not a full SIEM or UEBA suite.

One command:

npx @bhaskarauthor/auth-anomaly-radar

Video below (documentary cut).

What signal do you wish your auth logs scored by default?

#OpenSource #DevTools #BuildInPublic #CyberSecurity #AppSec #FraudPrevention #AIcoding #InfoSec`,
    xShort: `Mumbai → SFO in 2 hours. Same user.
Logs: success.

auth-anomaly-radar — free local OSS alpha
impossible travel · stuffing · risk band

npx @bhaskarauthor/auth-anomaly-radar

#OpenSource #CyberSecurity #AppSec`,
    linkedin: `Mumbai → San Francisco in two hours. Same user. Logs: login success.

Account takeover rarely looks loud in a single row. It looks normal until you score velocity and geography.

I built auth-anomaly-radar — free, local, OSS alpha for sequence scoring: impossible travel, credential stuffing, risk bands.

npx @bhaskarauthor/auth-anomaly-radar

Honest limit: offline core, not a full SIEM.

#OpenSource #BuildInPublic #CyberSecurity #AppSec #DevTools`,
  },
  {
    id: "P10",
    slug: "fraud-signal-kit",
    npm: "@bhaskarauthor/fraud-signal-kit",
    redditTitle:
      "Disposable email + six actions in 60 seconds. You don’t need deep learning to call that HIGH.",
    redditBody: `Before heavy ML, fraud is often already loud:

- temp/disposable mail patterns  
- burst velocity (signup → card → checkout×N)  
- composite score for step-up / hold  

**fraud-signal-kit** composes cheap signals offline:

\`\`\`
npx @bhaskarauthor/fraud-signal-kit
\`\`\`

Demo: mailinator-style address + burst events → composite HIGH.

Honest limit: offline heuristics — not a full fraud platform.

Video attached.`,
    xPremium: `Disposable email.
Six actions in sixty seconds.
Composite: HIGH.

You don’t need a neural net to hold the payout.

Marketplaces and fintech burn money when signals stay siloed:
email tool over here · velocity rules over there · human in the middle never sees the blend.

**fraud-signal-kit** (free local OSS alpha) composes cheap signals:

→ email risk (disposable / pattern heuristics)  
→ velocity (actions in a rolling window)  
→ blend 0.6·email + 0.4·velocity → band  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
email           buyer…@mailinator.com
email band      HIGH
velocity band   HIGH
composite       HIGH  score=…
signal  step-up auth / hold payout — composite HIGH
discipline  compose cheap signals before heavy ML
\`\`\`

Honest limit: offline heuristic core — not a full fraud graph / device intel suite.

One command:

npx @bhaskarauthor/fraud-signal-kit

Video below (documentary).

Which cheap signal catches the most junk in *your* funnel?

#OpenSource #DevTools #BuildInPublic #FinTech #FraudPrevention #IndiaStartups #AIcoding #Risk`,
    xShort: `Disposable mail + 6 actions in 60s.
Composite HIGH — before ML.

fraud-signal-kit — free local OSS alpha
email · velocity · blend

npx @bhaskarauthor/fraud-signal-kit

#OpenSource #FinTech #FraudPrevention`,
    linkedin: `Disposable email. Six actions in a minute. Composite: HIGH.

Before heavy ML, fraud is often already loud — if you compose the cheap signals.

I built fraud-signal-kit — free, local, OSS alpha: email risk + velocity + blended band for step-up or review.

npx @bhaskarauthor/fraud-signal-kit

Honest limit: offline heuristics, not a full fraud platform.

#OpenSource #BuildInPublic #FinTech #FraudPrevention #DevTools`,
  },
];

function writeProduct(p) {
  const dir = path.join(ROOT, p.slug);
  const social = path.join(dir, "demo", "social");
  const launch = path.join(dir, "docs", "launch");
  fs.mkdirSync(social, { recursive: true });
  fs.mkdirSync(launch, { recursive: true });

  const video = path.join(dir, "demo", "social", `${p.slug}-social-1080p.mp4`);

  fs.writeFileSync(
    path.join(social, "POST_REDDIT.txt"),
    `=== PRIMARY ===
TITLE:
${p.redditTitle}

BODY:
${p.redditBody}

npm: https://www.npmjs.com/package/${p.npm}
`,
  );
  fs.writeFileSync(path.join(social, "POST_X.txt"), p.xShort + "\n");
  fs.writeFileSync(path.join(social, "POST_X_PREMIUM.txt"), p.xPremium + "\n");
  fs.writeFileSync(path.join(social, "POST_LINKEDIN.txt"), p.linkedin + "\n");

  fs.writeFileSync(
    path.join(launch, "SOCIAL-PUBLISH-PACK.md"),
    `# Publish pack — ${p.slug} (${p.id})

**Product:** \`${p.npm}\`  
**Framing:** Free OSS alpha · local · zero deps  
**Video (documentary ~50s):** \`${p.slug}/demo/social/${p.slug}-social-1080p.mp4\`

**Re-render:**
\`\`\`bash
python3 scripts/render_documentary_product.py --only ${p.slug}
\`\`\`

**Order:** Reddit → X (short or Premium long) → LinkedIn  

**Copy files:**
- \`demo/social/POST_REDDIT.txt\`
- \`demo/social/POST_X.txt\`
- \`demo/social/POST_X_PREMIUM.txt\`
- \`demo/social/POST_LINKEDIN.txt\`

## Hook
${p.redditTitle}

## Try
\`\`\`bash
npx ${p.npm}
\`\`\`

## Open video
\`\`\`bash
open -R "${video}"
\`\`\`
`,
  );
  console.log("wrote", p.id, p.slug);
}

for (const p of PRODUCTS) writeProduct(p);
console.log("done");
