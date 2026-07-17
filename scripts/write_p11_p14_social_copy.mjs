#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P11",
    slug: "cloud-waste-radar",
    npm: "@bhaskarauthor/cloud-waste-radar",
    redditTitle:
      "The cloud bill grew. The product didn’t. Something in the inventory is idle.",
    redditBody: `Orphan EBS. Dangling EIP. Staging RDS with zero connections for 21 days. A “temporary” m5.xlarge still at 2% CPU.

Finance sees a line item.
Engineering never got a waste ticket.

**cloud-waste-radar** (free local OSS alpha) scores an inventory JSON:

- idle EBS / EIP / RDS / low-CPU EC2  
- monthlySavingsUsd rollup  
- zero deps · MIT  

\`\`\`
npx @bhaskarauthor/cloud-waste-radar
\`\`\`

Honest limit: offline waste core — not a full FinOps platform.

Video: documentary cut with live findings.`,
    xPremium: `The cloud bill grew.
The product didn’t.

Something in the inventory is idle.

I keep finding the same quiet offenders:

• unattached volumes still billing  
• EIPs nobody associated  
• staging databases with zero connections for weeks  
• “temporary” instances at 2% CPU  

That’s not a pricing mystery.
That’s **unowned inventory**.

**cloud-waste-radar** — free, local, OSS alpha:

→ scan inventory JSON  
→ flag idle_ebs · idle_eip · idle_rds · rightsizing_ec2  
→ monthlySavingsUsd  
→ zero runtime deps · MIT  

Investigation looks like:

\`\`\`
waste findings     4
monthly savings    $xxx
  $ 48/mo  idle_ebs          vol-orphan-01
  $180/mo  idle_rds          rds-staging-old
  …
signal  idle bill is a product of unowned resources
\`\`\`

Honest limit: offline core — not a full FinOps suite.

npx @bhaskarauthor/cloud-waste-radar

Video below.

What idle resource would show up first in *your* account?

#OpenSource #DevTools #BuildInPublic #FinOps #CloudComputing #AWS #indiehacker`,
    xShort: `Bill up. Product flat.
Orphan volumes. Idle RDS. 2% CPU boxes.

cloud-waste-radar — free local OSS alpha
findings · monthlySavingsUsd

npx @bhaskarauthor/cloud-waste-radar

#OpenSource #FinOps #DevTools`,
    linkedin: `The cloud bill grew. The product didn’t. Something is idle.

Cloud waste is usually unowned inventory — not a mysterious tariff.

I built cloud-waste-radar: free, local, OSS alpha that scores inventory for idle EBS/EIP/RDS and low-CPU EC2, with a monthly savings rollup.

npx @bhaskarauthor/cloud-waste-radar

Honest limit: offline core, not a full FinOps platform.

#OpenSource #BuildInPublic #FinOps #DevTools #Cloud`,
  },
  {
    id: "P12",
    slug: "dev-onboard-os",
    npm: "@bhaskarauthor/dev-onboard-os",
    redditTitle:
      "Day 4 of onboard: laptop works. Secrets still arrived in chat. Agents not configured.",
    redditBody: `New hire opens five wiki pages. Three are stale. One says “ask on Slack.”

MCP and agent setup is “optional chrome” — until someone pastes a key into a DM.

**dev-onboard-os** treats day-one as a checklist OS:

laptop · github · repo · secrets · agents · first-pr  
progress % · explicit blockers  

\`\`\`
npx @bhaskarauthor/dev-onboard-os
\`\`\`

Honest limit: offline checklist core — not an HRIS.

Video attached.`,
    xPremium: `Day 4 of onboard.
Laptop: done.
GitHub: done.
Repo builds: done.

Secrets: still in chat.
Agents + MCP: not configured.
First PR: not yet.

That’s not “ramping.”
That’s a **checklist with open risk.**

**dev-onboard-os** (free local OSS alpha):

→ default day-one checklist including AI/MCP safety  
→ DONE / TODO with percent complete  
→ blockers called out by id  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
progress           3/6  (50%)
  DONE  laptop
  DONE  github
  DONE  repo
  TODO  secrets     Secrets via vault (not chat)
  TODO  agents      AI agents + MCP configured safely
  TODO  first-pr
blockers           secrets, agents, first-pr
signal  AI/MCP setup is now part of day-one risk
\`\`\`

Honest limit: offline checklist core — not an HRIS / LMS.

npx @bhaskarauthor/dev-onboard-os

Video below (documentary).

What’s still TODO on day four on *your* team?

#OpenSource #DevTools #BuildInPublic #EngineeringManagement #DevEx #AIcoding #onboarding`,
    xShort: `Day 4: laptop OK.
Secrets still in chat. Agents TODO.

dev-onboard-os — free local OSS alpha
checklist · % · blockers

npx @bhaskarauthor/dev-onboard-os

#OpenSource #DevEx #DevTools`,
    linkedin: `Day 4 of onboard: laptop works. Secrets still arrived in chat. Agents not configured.

Onboarding is not a wiki scavenger hunt. It’s a checklist with a percent — and AI/MCP is day-one risk.

I built dev-onboard-os: free, local, OSS alpha for day-one progress (including secrets + agents).

npx @bhaskarauthor/dev-onboard-os

Honest limit: offline core, not an HRIS.

#OpenSource #BuildInPublic #DevEx #Engineering #DevTools`,
  },
  {
    id: "P13",
    slug: "sbom-lite",
    npm: "@bhaskarauthor/sbom-lite",
    redditTitle:
      "Tests are green. GPL-3.0 and a denied package still rode into main.",
    redditBody: `SBOM without a gate is a PDF for auditors.
SBOM with a gate is a merge blocker.

**sbom-lite** (free OSS alpha):

- components from package-lock style input  
- denyLicenses / denyNames policy  
- gate.ok → CI  

\`\`\`
npx @bhaskarauthor/sbom-lite
\`\`\`

Demo fails on GPL-3.0 + denied package name.

Honest limit: offline SBOM core — not full SCA/vuln DB.

Video attached.`,
    xPremium: `Tests: green.
License field: unread.
A GPL-3.0 dep and a denied package name just entered main.

That’s the blind merge.

**sbom-lite** — free, local, OSS alpha:

→ SBOM-ish component list from lockfile JSON  
→ policy: denyLicenses · denyNames  
→ gate PASS/FAIL for CI  
→ zero runtime deps · MIT  

Investigation:

\`\`\`
components         N
policy gate        FAIL
violations         2
  BLOCK  leftpad-evil  ·  denied-package
  BLOCK  …             ·  license=GPL-3.0
signal  license/package policy should fail CI
\`\`\`

Honest limit: offline core — not a full SCA platform with CVE feeds.

npx @bhaskarauthor/sbom-lite

Video below.

What license would you deny by default?

#OpenSource #DevTools #BuildInPublic #AppSec #SupplyChain #SBOM #CI #npm`,
    xShort: `Tests green.
GPL-3.0 still merged.

sbom-lite — free local OSS alpha
SBOM · policy gate · CI

npx @bhaskarauthor/sbom-lite

#OpenSource #SBOM #AppSec`,
    linkedin: `Tests are green. GPL-3.0 and a denied package still rode into main.

SBOM without a gate is a PDF. SBOM with a gate is a merge blocker.

I built sbom-lite: free, local, OSS alpha — components from lockfile input + deny license/name policy for CI.

npx @bhaskarauthor/sbom-lite

Honest limit: offline core, not full SCA.

#OpenSource #BuildInPublic #AppSec #SBOM #DevTools`,
  },
  {
    id: "P14",
    slug: "grc-evidence-autopilot",
    npm: "@bhaskarauthor/grc-evidence-autopilot",
    redditTitle:
      "Audit week. Control P1.1 has zero artifacts. Everyone is in a shared drive.",
    redditBody: `Controls in a spreadsheet. Evidence in five folders. Week of audit: who has the screenshot?

**grc-evidence-autopilot** maps artifacts → controls and prints coverage % + gaps.

\`\`\`
npx @bhaskarauthor/grc-evidence-autopilot
\`\`\`

Demo: several controls OK, privacy control GAP.

Honest limit: offline mapping core — not a full GRC suite.

Video attached.`,
    xPremium: `Audit week.
Control P1.1: zero artifacts.
Everyone is searching a shared drive.

That’s not compliance.
That’s **folder panic.**

**grc-evidence-autopilot** (free local OSS alpha):

→ map artifacts to control ids  
→ coveragePct  
→ explicit GAP list  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
controls           5
covered            4
coverage           80%
  OK   CC6.1   arts=1
  OK   CC7.2   arts=1
  GAP  P1.1    arts=0  Privacy — data retention…
gaps               P1.1
signal  auditor will ask for P1.1 — empty folder is a finding
\`\`\`

Honest limit: offline mapping core — not a full GRC / audit workflow product.

npx @bhaskarauthor/grc-evidence-autopilot

Video below.

Which control would be empty if audit started Monday?

#OpenSource #DevTools #BuildInPublic #GRC #Compliance #InfoSec #SOC2 #indiehacker`,
    xShort: `Audit week.
P1.1: zero artifacts.

grc-evidence-autopilot — free local OSS alpha
coverage % · gaps

npx @bhaskarauthor/grc-evidence-autopilot

#OpenSource #GRC #Compliance`,
    linkedin: `Audit week. Control P1.1 has zero artifacts. Everyone is in a shared drive.

Evidence under panic is incomplete evidence. Map artifacts to controls continuously.

I built grc-evidence-autopilot: free, local, OSS alpha for control coverage % and explicit gaps.

npx @bhaskarauthor/grc-evidence-autopilot

Honest limit: offline core, not a full GRC suite.

#OpenSource #BuildInPublic #GRC #Compliance #DevTools`,
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
    `# Publish pack — ${p.slug} (${p.id})

**Product:** \`${p.npm}\` · free OSS alpha · local · zero deps  
**Video (documentary ~50s):** \`${p.slug}/demo/social/${p.slug}-social-1080p.mp4\`

\`\`\`bash
python3 scripts/render_documentary_product.py --only ${p.slug}
open -R "${video}"
npx ${p.npm}
\`\`\`

**Copy:** POST_REDDIT · POST_X · POST_X_PREMIUM · POST_LINKEDIN  

**Hook:** ${p.redditTitle}
`,
  );
  console.log("wrote", p.id, p.slug);
}

for (const p of PRODUCTS) writeProduct(p);
