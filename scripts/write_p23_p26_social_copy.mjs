#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P23",
    slug: "personal-crm",
    npm: "@bhaskarauthor/personal-crm",
    redditTitle: "Investor silent 38 days. Lead: never touched. Who’s on your nudge list?",
    redditBody: `Relationships decay on a timer — not a vibe.

**personal-crm** (free local OSS alpha): lastTouch + window → nudge list.

\`\`\`
npx @bhaskarauthor/personal-crm
\`\`\`

Honest limit: offline nudge core — not a full CRM suite.

Video: documentary cut.`,
    xPremium: `Investor: silent 38 days.
Lead: never touched.
Peer: fine.

Who’s on your nudge list?

**personal-crm** — free, local, OSS alpha:

→ people + lastTouch  
→ window (e.g. 30d) → NUDGE list  
→ zero deps · MIT · offline  

Investigation prints who went cold — before the deal does.

Honest limit: offline core — not Salesforce-for-founders cloud.

npx @bhaskarauthor/personal-crm

Video below.

#OpenSource #DevTools #BuildInPublic #CRM #Networking #indiehacker #Founders`,
    xShort: `38 days silent.
Lead: never.

personal-crm — free local OSS alpha
nudge list

npx @bhaskarauthor/personal-crm

#OpenSource #CRM #Founders`,
    linkedin: `Investor silent 38 days. Lead never touched.

Relationships decay on a timer.

I built personal-crm: free, local, OSS alpha for lastTouch → nudge lists.

npx @bhaskarauthor/personal-crm

Honest limit: offline core, not a full CRM suite.

#OpenSource #BuildInPublic #CRM #DevTools`,
  },
  {
    id: "P24",
    slug: "creator-ops",
    npm: "@bhaskarauthor/creator-ops",
    redditTitle: "Pipeline looks fat. Two shoots overlap. Cash meets chaos.",
    redditBody: `Creator businesses die on double-books and fuzzy pipelines.

**creator-ops** rolls deals by stage + value and flags calendar conflicts.

\`\`\`
npx @bhaskarauthor/creator-ops
\`\`\`

Honest limit: offline ops core — not a full agency OS.

Video attached.`,
    xPremium: `Pipeline: tens of thousands on paper.
Calendar: two shoots overlap.

That’s cash meeting chaos.

**creator-ops** — free, local, OSS alpha:

→ deals by stage · pipelineValue  
→ calendar conflict pairs  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
pipeline value     $…
by stage           pitch / negotiate / signed …
CLASH  shoot-a ↔ shoot-b
\`\`\`

Honest limit: offline core — not a full creator suite.

npx @bhaskarauthor/creator-ops

Video below.

#OpenSource #DevTools #BuildInPublic #CreatorEconomy #InfluencerMarketing #indiehacker`,
    xShort: `Fat pipeline.
Overlapping shoots.

creator-ops — free local OSS alpha
deals · conflicts

npx @bhaskarauthor/creator-ops

#OpenSource #CreatorEconomy`,
    linkedin: `Pipeline looks fat. Two shoots overlap.

Pipeline value without calendar truth is fiction.

I built creator-ops: free, local, OSS alpha for deal stages + conflict detection.

npx @bhaskarauthor/creator-ops

Honest limit: offline core, not a full agency OS.

#OpenSource #BuildInPublic #CreatorEconomy #DevTools`,
  },
  {
    id: "P25",
    slug: "climate-ops-meter",
    npm: "@bhaskarauthor/climate-ops-meter",
    redditTitle: "You can’t cut what you never measured. Electricity, diesel, flights — one kgCO2e number.",
    redditBody: `**climate-ops-meter** applies simple factors to ops activities → kgCO2e lines + total.

\`\`\`
npx @bhaskarauthor/climate-ops-meter
\`\`\`

Honest limit: offline factors — not a full ESG platform.

Video attached.`,
    xPremium: `Electricity. Diesel. Flights. Waste.
One number: kgCO2e.

You can’t cut what you never measured.

**climate-ops-meter** — free, local, OSS alpha:

→ factor × amount per activity  
→ line kg + total tCO2e  
→ hotspot = top line  
→ zero deps · MIT · offline  

Honest limit: simplified factors — not a full GHG inventory consultancy product.

npx @bhaskarauthor/climate-ops-meter

Video below.

#OpenSource #DevTools #BuildInPublic #Climate #ESG #Sustainability #indiehacker`,
    xShort: `Unmeasured ops.
No cut plan.

climate-ops-meter — free local OSS alpha
kgCO2e rollup

npx @bhaskarauthor/climate-ops-meter

#OpenSource #Climate #ESG`,
    linkedin: `You can’t cut what you never measured.

I built climate-ops-meter: free, local, OSS alpha for simple ops emissions (electricity, diesel, flights, waste) → kgCO2e.

npx @bhaskarauthor/climate-ops-meter

Honest limit: offline factors, not full ESG suite.

#OpenSource #BuildInPublic #Climate #ESG #DevTools`,
  },
  {
    id: "P26",
    slug: "sc-visibility-lite",
    npm: "@bhaskarauthor/sc-visibility-lite",
    redditTitle: "Two high-risk suppliers. One never checked in. Blind tiers become headlines.",
    redditBody: `**sc-visibility-lite** rolls supplier risk bands + stale check-ins (maxDays).

\`\`\`
npx @bhaskarauthor/sc-visibility-lite
\`\`\`

Honest limit: offline visibility — not full SCM/traceability suite.

Video attached.`,
    xPremium: `Two high-risk suppliers.
One never checked in.

Brand story says ethical.
Tier reality says blind.

**sc-visibility-lite** — free, local, OSS alpha:

→ risk bands low/med/high  
→ stale if lastCheckin > maxDays  
→ high-risk id list  
→ zero deps · MIT · offline  

Investigation flags HIGH + STALE before the recall headline.

Honest limit: offline core — not a full supply-chain platform.

npx @bhaskarauthor/sc-visibility-lite

Video below.

#OpenSource #DevTools #BuildInPublic #SupplyChain #ESG #Manufacturing #indiehacker`,
    xShort: `High-risk mill.
Never checked in.

sc-visibility-lite — free local OSS alpha
risk · stale

npx @bhaskarauthor/sc-visibility-lite

#OpenSource #SupplyChain`,
    linkedin: `Two high-risk suppliers. One never checked in.

Visibility is risk bands + freshness — not last year’s PDF.

I built sc-visibility-lite: free, local, OSS alpha for supplier risk rollup + stale check-ins.

npx @bhaskarauthor/sc-visibility-lite

Honest limit: offline core, not full SCM.

#OpenSource #BuildInPublic #SupplyChain #ESG #DevTools`,
  },
];

function writeProduct(p) {
  const social = path.join(ROOT, p.slug, "demo", "social");
  const launch = path.join(ROOT, p.slug, "docs", "launch");
  fs.mkdirSync(social, { recursive: true });
  fs.mkdirSync(launch, { recursive: true });
  const video = path.join(ROOT, p.slug, "demo", "social", `${p.slug}-social-1080p.mp4`);
  fs.writeFileSync(
    path.join(social, "POST_REDDIT.txt"),
    `=== PRIMARY ===\nTITLE:\n${p.redditTitle}\n\nBODY:\n${p.redditBody}\n\nnpm: https://www.npmjs.com/package/${p.npm}\n`,
  );
  fs.writeFileSync(path.join(social, "POST_X.txt"), p.xShort + "\n");
  fs.writeFileSync(path.join(social, "POST_X_PREMIUM.txt"), p.xPremium + "\n");
  fs.writeFileSync(path.join(social, "POST_LINKEDIN.txt"), p.linkedin + "\n");
  fs.writeFileSync(
    path.join(launch, "SOCIAL-PUBLISH-PACK.md"),
    `# Publish pack — ${p.slug} (${p.id})\n\n**Video:** \`${p.slug}/demo/social/${p.slug}-social-1080p.mp4\`\n\n\`\`\`bash\npython3 scripts/render_documentary_product.py --only ${p.slug}\nopen -R "${video}"\n\`\`\`\n\n**Hook:** ${p.redditTitle}\n`,
  );
  console.log("wrote", p.id, p.slug);
}

for (const p of PRODUCTS) writeProduct(p);
