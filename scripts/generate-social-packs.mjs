#!/usr/bin/env node
/**
 * Generate posting packs for portfolio CLIs (P06–P28 by default).
 * Free OSS framing only — no seats / SaaS / paid-layer pitch.
 *
 *   node scripts/generate-social-packs.mjs
 *   node scripts/generate-social-packs.mjs --from 6 --to 28
 *   node scripts/generate-social-packs.mjs --only skill-sync,eval-harness
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const out = { from: 6, to: 28, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") out.from = Number(argv[++i]);
    else if (a === "--to") out.to = Number(argv[++i]);
    else if (a === "--only") out.only = new Set(argv[++i].split(",").map((s) => s.trim()));
  }
  return out;
}

function loadCsv() {
  const text = fs.readFileSync(path.join(ROOT, "Software_Opportunity_Master_Portfolio.csv"), "utf8");
  const lines = text.trim().split("\n");
  const headers = splitCsv(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsv(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

/** Minimal CSV split (handles quoted commas). */
function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (c === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function loadPkg(repo) {
  const p = path.join(ROOT, repo, "package.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function absVideo(repo) {
  const social = path.join(ROOT, repo, "demo", "social", `${repo}-social-1080p.mp4`);
  const demo = path.join(ROOT, repo, "demo", `${repo}-demo-1080p.mp4`);
  if (fs.existsSync(social)) return social;
  if (fs.existsSync(demo)) return demo;
  return social;
}

function npmName(pkg, repo) {
  return pkg?.name || `@bhaskarauthor/${repo}`;
}

function tryCmd(pkg, repo) {
  const name = npmName(pkg, repo);
  const bins = pkg?.bin ? Object.keys(pkg.bin) : [repo];
  const short = bins.find((b) => !b.startsWith("ai-")) || bins[0] || repo;
  return {
    npx: `npx ${name}`,
    short,
    local: `node ${repo}/src/cli.js fixtures/sample.json`,
  };
}

function packMarkdown(row, pkg) {
  const id = row.id;
  const repo = row.repo;
  const name = npmName(pkg, repo);
  const ver = pkg?.version || "0.1.0-alpha.1";
  const one = row.one_liner || pkg?.description || row.name;
  const problem = row.problem || "Teams need a focused tool for this workflow.";
  const video = absVideo(repo);
  const { npx, short, local } = tryCmd(pkg, repo);
  const category = row.category || "Tooling";

  return `# Publish pack — Reddit · X · LinkedIn

**Product:** ${id} ${row.name} (\`${name}@${ver}\`)  
**Category:** ${category}  
**Framing:** **Free open-source alpha CLI** — local offline core. No seats, SaaS, or paid tiers in post copy.

**Video (attach everywhere):**  
\`${video}\`

Also: \`${repo}/demo/${repo}-demo-1080p.mp4\` (if present)

**Try after npm publish:**
\`\`\`bash
${npx}
${npx} --json fixtures/sample.json
\`\`\`

**Until published / offline:**
\`\`\`bash
cd ${repo} && npm test && npm run demo
${local}
\`\`\`

**Post order:** Reddit → X → LinkedIn. Stay for comments after Reddit (~1h).

---

## 1) Reddit

**Title**
\`\`\`
${titleReddit(row, one)}
\`\`\`

**Body**
\`\`\`
${problem}

I shipped a free open-source alpha CLI for this: **${short}**

\`\`\`
${npx}
${npx} --json
\`\`\`

What it is:
- ${one}
- Offline / local-first MVP core
- Zero runtime dependencies
- \`--json\` for CI / scripts
- MIT

Honest: this is an alpha domain core (fixtures + litmus), not a full SaaS product.

[video attached]

Feedback welcome on false positives / formats to support.
\`\`\`

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

\`\`\`
${tweet(row, short, npx, one)}
\`\`\`

---

## 3) LinkedIn

\`\`\`
${linkedin(row, short, npx, one, problem)}
\`\`\`

**Tip:** First line is the hook. Upload video natively.

---

## Checklist

- [ ] Preview video with sound
- [ ] Free OSS framing only (no $ / seats / “buy”)
- [ ] npm live **or** clear “local alpha / clone” CTA
- [ ] Reddit: Image & Video type
- [ ] Reply to comments 1h

## Open video

\`\`\`bash
open -R "${video}"
\`\`\`
`;
}

function titleReddit(row, one) {
  const short = one.length > 90 ? one.slice(0, 87) + "…" : one;
  return `${short} — free OSS alpha CLI (${row.id})`;
}

function tweet(row, short, npx, one) {
  return `${one}

Shipped **${short}** as a free local OSS alpha:

${npx}

Zero deps · --json · MIT

#OpenSource #devtools`;
}

function linkedin(row, short, npx, one, problem) {
  return `${problem}

I built **${short}** — a free, local, open-source alpha CLI:

→ ${one}
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

${npx}

Honest limit: alpha MVP core, not a full hosted product. Built to ship learnings in public.

Feedback welcome.

#OpenSource #BuildInPublic #DevTools #AI`;
}

function postFiles(row, pkg) {
  const name = npmName(pkg, row.repo);
  const { npx, short } = tryCmd(pkg, row.repo);
  const one = row.one_liner || pkg?.description || row.name;
  const problem = row.problem || "";

  const reddit = `=== PRIMARY ===
TITLE:
${titleReddit(row, one)}

BODY:
${problem}

I shipped a free open-source alpha CLI for this: **${short}**

\`\`\`
${npx}
${npx} --json
\`\`\`

What it is:
- ${one}
- Offline / local-first MVP core
- Zero runtime dependencies
- --json for CI / scripts
- MIT

Honest: alpha domain core (fixtures + litmus), not a full SaaS product.

[video attached]

Feedback welcome.
`;

  const x = `${one}

Shipped **${short}** as a free local OSS alpha:

${npx}

Zero deps · --json · MIT
`;

  const li = `${problem}

I built **${short}** — a free, local, open-source alpha CLI:

→ ${one}
→ Offline-first core (fixtures + litmus tests)
→ Zero runtime dependencies
→ JSON output for scripts / CI

Try:

${npx}

Honest limit: alpha MVP core, not a full hosted product.

#OpenSource #BuildInPublic #DevTools #AI
`;

  return { reddit, x, li };
}

/** 7-day calendar P06–P28 (23 products ≈ 3–4/day). */
function weekCalendar(rows) {
  const days = [
    { day: 1, label: "Mon — AI tooling", ids: ["P06", "P07", "P08", "P13"] },
    { day: 2, label: "Tue — Security signals", ids: ["P09", "P10", "P20", "P28"] },
    { day: 3, label: "Wed — Cloud & data", ids: ["P11", "P12", "P21", "P14"] },
    { day: 4, label: "Thu — India ops", ids: ["P15", "P16", "P17", "P18"] },
    { day: 5, label: "Fri — Life / learning", ids: ["P19", "P22", "P23", "P27"] },
    { day: 6, label: "Sat — Creator & climate & SC", ids: ["P24", "P25", "P26"] },
    { day: 7, label: "Sun — buffer / repost best + engagement", ids: [] },
  ];
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  let md = `# 1-week social calendar — P06 → P28

**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Rule:** Free OSS alpha CLI only. No paid product / seats / SaaS pricing in posts.  
**Cadence:** 3–4 products/day max. Reddit → X → LinkedIn. One primary sub per product.  
**Order within day:** post morning product first; space 2–3h; engage comments before next.

**Not in this week:** P01–P05 (already shipped/social track), P29–P30 (suite secure/spend — separate cadence).

---

`;

  for (const d of days) {
    md += `## Day ${d.day} — ${d.label}\n\n`;
    if (!d.ids.length) {
      md += `Engagement day: reply to comments, repost best-performing clip, pin one thread.\n\n`;
      continue;
    }
    md += `| ID | Product | Video | Pack |\n|----|---------|-------|------|\n`;
    for (const id of d.ids) {
      const r = byId[id];
      if (!r) continue;
      const repo = r.repo;
      md += `| ${id} | ${r.name} | \`${repo}/demo/social/${repo}-social-1080p.mp4\` | \`${repo}/docs/launch/SOCIAL-PUBLISH-PACK.md\` |\n`;
    }
    md += `\n**Copy-paste posts:** each product’s \`demo/social/POST_*.txt\`\n\n`;
  }

  md += `## Daily checklist

1. \`open -R "<video path>"\` — watch once with sound  
2. Paste Reddit body + attach MP4  
3. X single post + MP4  
4. LinkedIn + MP4  
5. Drop three URLs in chat / \`demos/WEEK_POSTING_LOG.md\`  

## Honest product stance

These are **offline MVP cores** (litmus-tested, demo fixtures). Post as **alpha tools**, not finished enterprise SaaS. Invite format feedback.

## Regenerate packs

\`\`\`bash
node scripts/generate-social-packs.mjs --from 6 --to 28
\`\`\`
`;
  return md;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const all = loadCsv().filter((r) => {
    const n = parseInt(String(r.id).slice(1), 10);
    return Number.isFinite(n) && n >= args.from && n <= args.to;
  });
  const rows = args.only
    ? all.filter((r) => args.only.has(r.repo) || args.only.has(r.id) || args.only.has(r.name))
    : all;

  let wrote = 0;
  for (const row of rows) {
    const repo = row.repo;
    const dir = path.join(ROOT, repo);
    if (!fs.existsSync(dir)) {
      console.warn(`skip missing dir ${repo}`);
      continue;
    }
    const pkg = loadPkg(repo);
    const launch = path.join(dir, "docs", "launch");
    const social = path.join(dir, "demo", "social");
    fs.mkdirSync(launch, { recursive: true });
    fs.mkdirSync(social, { recursive: true });

    fs.writeFileSync(path.join(launch, "SOCIAL-PUBLISH-PACK.md"), packMarkdown(row, pkg));
    const posts = postFiles(row, pkg);
    fs.writeFileSync(path.join(social, "POST_REDDIT.txt"), posts.reddit);
    fs.writeFileSync(path.join(social, "POST_X.txt"), posts.x);
    fs.writeFileSync(path.join(social, "POST_LINKEDIN.txt"), posts.li);

    // Ensure social video path exists (copy from demo if needed)
    const socialVid = path.join(social, `${repo}-social-1080p.mp4`);
    const demoVid = path.join(dir, "demo", `${repo}-demo-1080p.mp4`);
    if (!fs.existsSync(socialVid) && fs.existsSync(demoVid)) {
      fs.copyFileSync(demoVid, socialVid);
      console.log(`  copied demo→social video for ${repo}`);
    }

    wrote++;
    console.log(`OK ${row.id} ${repo}`);
  }

  // Week calendar for full P06–P28 range
  if (args.from <= 6 && args.to >= 28 && !args.only) {
    const calRows = loadCsv().filter((r) => {
      const n = parseInt(String(r.id).slice(1), 10);
      return n >= 6 && n <= 28;
    });
    const calPath = path.join(ROOT, "demos", "WEEK_P06_P28_CALENDAR.md");
    fs.mkdirSync(path.dirname(calPath), { recursive: true });
    fs.writeFileSync(calPath, weekCalendar(calRows));
    console.log(`calendar → ${calPath}`);

    const logPath = path.join(ROOT, "demos", "WEEK_POSTING_LOG.md");
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(
        logPath,
        `# Week posting log — P06–P28\n\n| Date | ID | Reddit | X | LinkedIn | Notes |\n|------|----|--------|---|----------|-------|\n`,
      );
    }
  }

  console.log(`\nWrote packs for ${wrote} products`);
}

main();
