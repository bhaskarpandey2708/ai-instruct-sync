#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRODUCTS = [
  {
    id: "P15",
    slug: "wa-ops-desk",
    npm: "@bhaskarauthor/wa-ops-desk",
    redditTitle:
      "Three WhatsApp chats: refund, book 3pm, password reset. The founder is still the router.",
    redditBody: `Every Indian SME WhatsApp is a second office.

Orders, bookings, FAQs — same blue ticks. More headcount is one answer. **Label + least-load routing** is cheaper first.

**wa-ops-desk** (free local OSS alpha):

- classify: orders · booking · faq · general  
- assign least-load staff by label  
- auto-FAQ when safe  

\`\`\`
npx @bhaskarauthor/wa-ops-desk
\`\`\`

Honest limit: offline routing core — not WhatsApp Cloud API / BSP.

Video: documentary cut.`,
    xPremium: `Three WhatsApp threads.
Refund. Book 3pm. Password reset.
The founder is still the router.

That’s not “customer love.”
That’s an **inbox architecture** problem.

**wa-ops-desk** — free, local, OSS alpha:

→ label messages (orders / booking / faq / general)  
→ route to least-load staff with matching labels  
→ auto-FAQ reply when safe  
→ zero runtime deps · MIT · offline  

Investigation:

\`\`\`
routing
  m1 → orders    @riya
  m2 → booking   @arjun
  m3 → faq       @bot-faq · auto-FAQ
signal  WhatsApp chaos is a routing problem
\`\`\`

Honest limit: offline rules — not a hosted WA Cloud product.

npx @bhaskarauthor/wa-ops-desk

Video below.

What % of your WhatsApp is actually FAQ?

#OpenSource #DevTools #BuildInPublic #WhatsApp #IndiaStartups #SMB #CustomerSupport #indiehacker`,
    xShort: `Refund. Book 3pm. FAQ.
Founder still routing.

wa-ops-desk — free local OSS alpha
label · least-load · auto-FAQ

npx @bhaskarauthor/wa-ops-desk

#OpenSource #WhatsApp #IndiaStartups`,
    linkedin: `Three WhatsApp chats: refund, book 3pm, password reset. The founder is still the router.

Before more headcount, label and route.

I built wa-ops-desk: free, local, OSS alpha for message labels, least-load assignment, and safe FAQ auto-replies.

npx @bhaskarauthor/wa-ops-desk

Honest limit: offline core, not WhatsApp Cloud API.

#OpenSource #BuildInPublic #WhatsApp #SMB #India #DevTools`,
  },
  {
    id: "P16",
    slug: "gst-ops-copilot",
    npm: "@bhaskarauthor/gst-ops-copilot",
    redditTitle:
      "Filing week: bad GSTIN, tax mismatch, missing tax lines — catch them before the portal does.",
    redditBody: `GST hygiene fails quietly until filing.

**gst-ops-copilot** scans invoices offline:

- bad_gstin  
- missing_tax  
- tax_mismatch (CGST/SGST vs taxable × 9%)  

\`\`\`
npx @bhaskarauthor/gst-ops-copilot
\`\`\`

Honest limit: offline hygiene — not full GSTR filing product.

Video attached.`,
    xPremium: `Filing week.
Three invoices already fail hygiene.

• bad GSTIN pattern  
• CGST/SGST don’t match taxable × 9%  
• tax fields missing entirely  

The CA finds it at the portal.
You can find it in a CLI **first**.

**gst-ops-copilot** — free, local, OSS alpha:

→ invoice hygiene scan  
→ issue codes: bad_gstin · missing_tax · tax_mismatch  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
hygiene            ISSUES
  FAIL  INV-1002   bad_gstin
  FAIL  INV-1003   tax_mismatch
  FAIL  INV-1004   missing_tax
signal  cheaper to catch before filing week
\`\`\`

Honest limit: offline checks — not a full GST suite / e-invoice network.

npx @bhaskarauthor/gst-ops-copilot

Video below.

How many invoices would fail a 60-second hygiene pass?

#OpenSource #DevTools #BuildInPublic #GST #IndiaStartups #FinOps #Compliance #indiehacker`,
    xShort: `Filing week.
bad_gstin · tax_mismatch · missing_tax.

gst-ops-copilot — free local OSS alpha

npx @bhaskarauthor/gst-ops-copilot

#OpenSource #GST #IndiaStartups`,
    linkedin: `Filing week: bad GSTIN, tax mismatch, missing tax lines — catch them before the portal does.

I built gst-ops-copilot: free, local, OSS alpha for invoice hygiene (GSTIN + CGST/SGST checks).

npx @bhaskarauthor/gst-ops-copilot

Honest limit: offline core, not full GSTR filing.

#OpenSource #BuildInPublic #GST #India #Compliance #DevTools`,
  },
  {
    id: "P17",
    slug: "appt-book-india",
    npm: "@bhaskarauthor/appt-book-india",
    redditTitle:
      "WhatsApp says “book 3pm.” The day has three busy blocks. Do you double-book or compute free slots?",
    redditBody: `Indian clinics live on WhatsApp + a paper grid.

**appt-book-india** computes free slots from busy intervals, then books preferred or first free.

\`\`\`
npx @bhaskarauthor/appt-book-india
\`\`\`

Honest limit: offline slot math — not a full PMS / WhatsApp bot.

Video attached.`,
    xPremium: `WhatsApp: “book 3pm.”
Calendar: three busy blocks.

Do you double-book…
or **compute free slots**?

**appt-book-india** — free, local, OSS alpha:

→ day window · duration · busy intervals  
→ open SLOT list  
→ book preferred start or first free  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
open slots         N
  SLOT  … → …
book attempt
  OK    …
signal  WhatsApp booking needs real availability
\`\`\`

Honest limit: offline slot core — not a full clinic PMS.

npx @bhaskarauthor/appt-book-india

Video below.

How many double-books would free-slot math have prevented last month?

#OpenSource #DevTools #BuildInPublic #HealthTech #IndiaStartups #WhatsApp #SMB #indiehacker`,
    xShort: `“Book 3pm” on WhatsApp.
Three busy blocks on the day.

appt-book-india — free local OSS alpha
slots · book

npx @bhaskarauthor/appt-book-india

#OpenSource #HealthTech #IndiaStartups`,
    linkedin: `WhatsApp says “book 3pm.” The day has three busy blocks.

Slots are math over busy intervals — not vibes over a spreadsheet.

I built appt-book-india: free, local, OSS alpha for free-slot computation and booking.

npx @bhaskarauthor/appt-book-india

Honest limit: offline core, not a full PMS.

#OpenSource #BuildInPublic #HealthTech #India #DevTools`,
  },
  {
    id: "P18",
    slug: "clinic-admin-lite",
    npm: "@bhaskarauthor/clinic-admin-lite",
    redditTitle:
      "Patients in one notebook, appointments in another, balances in the owner’s head.",
    redditBody: `Small clinics don’t need SAP. They need a ledger that doesn’t lie.

**clinic-admin-lite** — patients · appts · charges in one local model.

\`\`\`
npx @bhaskarauthor/clinic-admin-lite
\`\`\`

Demo: two patients, three appts, +₹500 consult → open balances visible.

Honest limit: offline ledger core — not a full hospital system.

Video attached.`,
    xPremium: `Patients in one notebook.
Appointments in another.
Balances in the owner’s head.

That’s not “simple ops.”
That’s **three sources of truth.**

**clinic-admin-lite** — free, local, OSS alpha:

→ patients with balance  
→ appointments linked by patientId  
→ charge updates balance  
→ zero deps · MIT · offline  

Investigation:

\`\`\`
patients / balance
  p-asha   Asha K    bal=₹500
  p-rahul  Rahul M   bal=₹1200
appointments
  a1  consult …
charge             +₹500 → p-asha
signal  N patient(s) with open balance
\`\`\`

Honest limit: offline ledger — not a full HMS / insurance stack.

npx @bhaskarauthor/clinic-admin-lite

Video below.

Would your front desk pass a “one ledger” test?

#OpenSource #DevTools #BuildInPublic #HealthTech #IndiaStartups #SMB #clinic #indiehacker`,
    xShort: `Notebook. Grid. Owner’s head.
Three truths for one clinic.

clinic-admin-lite — free local OSS alpha
patients · appts · charges

npx @bhaskarauthor/clinic-admin-lite

#OpenSource #HealthTech #IndiaStartups`,
    linkedin: `Patients in one notebook, appointments in another, balances in the owner’s head.

Small clinics need one local ledger — not enterprise bloat.

I built clinic-admin-lite: free, local, OSS alpha for patients, appointments, and charges.

npx @bhaskarauthor/clinic-admin-lite

Honest limit: offline core, not a full hospital system.

#OpenSource #BuildInPublic #HealthTech #India #SMB #DevTools`,
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

**Product:** \`${p.npm}\` · free OSS alpha  
**Video:** \`${p.slug}/demo/social/${p.slug}-social-1080p.mp4\`

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
