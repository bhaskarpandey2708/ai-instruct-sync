#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P27",
    slug: "focus-forge",
    npm: "@bhaskarauthor/focus-forge",
    redditTitle: "Calendar full. Deep work: two sessions. Activity without a score is storytelling.",
    redditBody: `**focus-forge** scores sessions: planned vs actual − distraction tax → weekly avg + deep count (≥70).

\`\`\`
npx @bhaskarauthor/focus-forge
\`\`\`

Honest limit: offline focus core — not a full productivity suite.

Video: documentary cut.`,
    xPremium: `Calendar: full.
Slack: green.
Deep work: two sessions all week.

Activity without a score is storytelling.

**focus-forge** — free, local, OSS alpha:

→ plannedMin · actualMin · distractions  
→ focus 0–100 · deep ≥ 70  
→ weekly avgFocus + deepSessions  
→ zero deps · MIT · offline  

Investigation prints DEEP vs WEAK sessions — the week’s real grade.

Honest limit: offline core — not RescueTime cloud.

npx @bhaskarauthor/focus-forge

Video below.

#OpenSource #DevTools #BuildInPublic #Productivity #DeepWork #indiehacker`,
    xShort: `Busy week.
Two deep sessions.

focus-forge — free local OSS alpha
focus score · deep count

npx @bhaskarauthor/focus-forge

#OpenSource #DeepWork #Productivity`,
    linkedin: `Calendar full. Deep work: two sessions.

Activity without a score is storytelling.

I built focus-forge: free, local, OSS alpha for session focus scoring and weekly deep-work counts.

npx @bhaskarauthor/focus-forge

Honest limit: offline core, not a full productivity suite.

#OpenSource #BuildInPublic #Productivity #DevTools`,
  },
  {
    id: "P28",
    slug: "api-contract-sentinel",
    npm: "@bhaskarauthor/api-contract-sentinel",
    redditTitle: "Backend green. DELETE removed. paymentMethod now required. Mobile will page at 2am.",
    redditBody: `**api-contract-sentinel** diffs prev vs next OpenAPI-ish JSON:

- path/method removed → BREAK  
- required field added → BREAK  
- path added → WARN  
- ok = no breaks (CI gate)

\`\`\`
npx @bhaskarauthor/api-contract-sentinel
\`\`\`

Honest limit: offline diff core — not a full API gateway.

Video attached.`,
    xPremium: `Backend: green.
DELETE /orders/{id}: gone.
paymentMethod: now required.

Mobile still posts the old body.

That’s the quiet break.

**api-contract-sentinel** — free, local, OSS alpha:

→ diff prev vs next paths/methods  
→ required_field_added → BREAK  
→ path_added → WARN  
→ ok false → fail CI  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
contract gate      FAIL
BREAK  method_removed         /v1/orders/{id}  delete
BREAK  required_field_added   …  paymentMethod
WARN   path_added             /v2/orders
\`\`\`

Honest limit: offline core — not full API management.

npx @bhaskarauthor/api-contract-sentinel

Video below.

#OpenSource #DevTools #BuildInPublic #API #OpenAPI #Backend #CI #indiehacker`,
    xShort: `DELETE removed.
New required field.
Mobile still ships.

api-contract-sentinel — free local OSS alpha
diff · BREAK · CI

npx @bhaskarauthor/api-contract-sentinel

#OpenSource #API #Backend`,
    linkedin: `Backend green. DELETE removed. paymentMethod now required. Mobile will page at 2am.

Contracts break on removals and new required fields.

I built api-contract-sentinel: free, local, OSS alpha to diff OpenAPI-ish contracts and fail CI on breaks.

npx @bhaskarauthor/api-contract-sentinel

Honest limit: offline core, not a full API gateway.

#OpenSource #BuildInPublic #API #Backend #DevTools`,
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
