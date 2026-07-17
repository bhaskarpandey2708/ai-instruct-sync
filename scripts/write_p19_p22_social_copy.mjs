#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P19",
    slug: "learn-loop",
    npm: "@bhaskarauthor/learn-loop",
    redditTitle: "You binge-read the notes. The card was due yesterday.",
    redditBody: `Highlighting feels like learning. Spaced repetition is learning on a schedule.

**learn-loop** (free local OSS alpha) runs a simple SM-2-ish loop: quality 0–5 → next interval · due queue.

\`\`\`
npx @bhaskarauthor/learn-loop
\`\`\`

Honest limit: offline SRS core — not a full LMS.

Video: documentary cut.`,
    xPremium: `You binge-read the notes.
The card was due yesterday.

That’s the binge trap:
highlight everything → re-read the PDF → blank on the interview card.

**learn-loop** — free, local, OSS alpha:

→ cards with EF / interval / reps  
→ review quality 0–5 updates schedule  
→ due queue for today  
→ zero deps · MIT · offline  

Investigation shows due cards and post-review intervals — not a guilt pile.

Honest limit: offline SRS core — not Duolingo/Anki cloud.

npx @bhaskarauthor/learn-loop

Video below.

What card would be due if you were honest?

#OpenSource #DevTools #BuildInPublic #Learning #SpacedRepetition #indiehacker #AIcoding`,
    xShort: `Binge notes.
Card was due yesterday.

learn-loop — free local OSS alpha
SRS · due queue

npx @bhaskarauthor/learn-loop

#OpenSource #Learning #DevTools`,
    linkedin: `You binge-read the notes. The card was due yesterday.

Memory is a schedule — not a highlight color.

I built learn-loop: free, local, OSS alpha for spaced-repetition scheduling (due queue + interval updates).

npx @bhaskarauthor/learn-loop

Honest limit: offline core, not a full LMS.

#OpenSource #BuildInPublic #Learning #DevTools`,
  },
  {
    id: "P20",
    slug: "cyber-smb-shield",
    npm: "@bhaskarauthor/cyber-smb-shield",
    redditTitle: "MFA on. Backups untested. 11 of 40 staff clicked the phish sim.",
    redditBody: `SMBs often buy one tool and call it security.

**cyber-smb-shield** scores baseline controls (MFA, backups, DNS, training, patching) + phishing click rate.

\`\`\`
npx @bhaskarauthor/cyber-smb-shield
\`\`\`

Honest limit: offline score — not MDR/EDR.

Video attached.`,
    xPremium: `MFA: on.
Backups: untested.
Phish sim: 11 of 40 clicked (27%).

That’s not “pretty good for an SMB.”
That’s a **weak band with a loud click rate.**

**cyber-smb-shield** — free, local, OSS alpha:

→ score mfa · backups · dns · training · patching  
→ phishing click % → risk band  
→ weak / fair / strong  
→ zero deps · MIT  

Investigation prints OK/GAP per control and phishing risk — before the real attachment.

Honest limit: offline baseline — not a full SOC.

npx @bhaskarauthor/cyber-smb-shield

Video below.

Would your team fail the click-rate test?

#OpenSource #DevTools #BuildInPublic #CyberSecurity #SMB #InfoSec #IndiaStartups #indiehacker`,
    xShort: `MFA on. Backups off.
11/40 clicked the phish.

cyber-smb-shield — free local OSS alpha
score · phishing %

npx @bhaskarauthor/cyber-smb-shield

#OpenSource #CyberSecurity #SMB`,
    linkedin: `MFA on. Backups untested. 11 of 40 clicked the phish sim.

Score baseline controls before the real phish.

I built cyber-smb-shield: free, local, OSS alpha for SMB security scoring + phishing click rate.

npx @bhaskarauthor/cyber-smb-shield

Honest limit: offline core, not MDR.

#OpenSource #BuildInPublic #CyberSecurity #SMB #DevTools`,
  },
  {
    id: "P21",
    slug: "data-quality-guard",
    npm: "@bhaskarauthor/data-quality-guard",
    redditTitle: "Pipeline green. Empty emails, duplicate ids, amount = -5.",
    redditBody: `Code has tests. Rows still ship garbage.

**data-quality-guard** runs not_null · unique · range expectations → suite GREEN/RED.

\`\`\`
npx @bhaskarauthor/data-quality-guard
\`\`\`

Honest limit: offline expectations — not full Great Expectations cloud.

Video attached.`,
    xPremium: `Pipeline: green.
Dashboard: refreshed.
Data: empty emails, duplicate ids, amount=-5 and 99999.

That’s the green pipeline lie.

**data-quality-guard** — free, local, OSS alpha:

→ not_null · unique · range  
→ PASS/FAIL with bad counts  
→ suite GREEN or RED  
→ zero deps · MIT · offline  

Investigation fails the load before the war room.

Honest limit: offline core — not a full DQ platform.

npx @bhaskarauthor/data-quality-guard

Video below.

Which expectation would fail first in *your* warehouse?

#OpenSource #DevTools #BuildInPublic #DataEngineering #DataQuality #Analytics #indiehacker`,
    xShort: `Pipeline green.
amount=-5. Duplicate ids.

data-quality-guard — free local OSS alpha
not_null · unique · range

npx @bhaskarauthor/data-quality-guard

#OpenSource #DataEngineering`,
    linkedin: `Pipeline green. Empty emails, duplicate ids, amount=-5.

Gate rows like you gate tests.

I built data-quality-guard: free, local, OSS alpha for not_null / unique / range expectations.

npx @bhaskarauthor/data-quality-guard

Honest limit: offline core, not full DQ suite.

#OpenSource #BuildInPublic #DataEngineering #DevTools`,
  },
  {
    id: "P22",
    slug: "care-companion",
    npm: "@bhaskarauthor/care-companion",
    redditTitle: "Ten reminders. None know which med is actually due.",
    redditBody: `Adherence is a schedule problem.

**care-companion** lists meds due now and advances nextAt by interval.

\`\`\`
npx @bhaskarauthor/care-companion
\`\`\`

Honest limit: offline schedule — not a full EMR / regulated medical device.

Video attached.`,
    xPremium: `Ten app reminders.
None know which med is actually due.

That’s notification spam, not care.

**care-companion** — free, local, OSS alpha:

→ meds with everyHours + nextAt  
→ due-now list  
→ scheduleNext advances the interval  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
due now
  DUE   Metformin 500
  DUE   Atorvastatin
next schedule
  NEXT  Vitamin D     …
\`\`\`

Honest limit: offline schedule core — not a regulated medical product.

npx @bhaskarauthor/care-companion

Video below.

#OpenSource #DevTools #BuildInPublic #HealthTech #Caregiving #indiehacker`,
    xShort: `10 reminders.
0 idea what’s due.

care-companion — free local OSS alpha
due list · nextAt

npx @bhaskarauthor/care-companion

#OpenSource #HealthTech`,
    linkedin: `Ten reminders. None know which med is actually due.

Adherence is a schedule — not notification volume.

I built care-companion: free, local, OSS alpha for due meds + next interval scheduling.

npx @bhaskarauthor/care-companion

Honest limit: offline core, not a full EMR / medical device.

#OpenSource #BuildInPublic #HealthTech #DevTools`,
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
    `# Publish pack — ${p.slug} (${p.id})\n\n**Product:** \`${p.npm}\`\n**Video:** \`${p.slug}/demo/social/${p.slug}-social-1080p.mp4\`\n\n\`\`\`bash\npython3 scripts/render_documentary_product.py --only ${p.slug}\nopen -R "${video}"\n\`\`\`\n\n**Hook:** ${p.redditTitle}\n\nCopy: POST_REDDIT · POST_X · POST_X_PREMIUM · POST_LINKEDIN\n`,
  );
  console.log("wrote", p.id, p.slug);
}

for (const p of PRODUCTS) writeProduct(p);
