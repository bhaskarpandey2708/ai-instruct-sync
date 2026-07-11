#!/usr/bin/env node
/**
 * Cross-product litmus runner for P01–P28 suite.
 * Retries once on failure. Writes logs/litmus/latest.json + markdown report.
 * Does NOT push remotes.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG_DIR = path.join(ROOT, "logs", "litmus");
fs.mkdirSync(LOG_DIR, { recursive: true });

const PRODUCTS = [
  { id: "P01", dir: "instruct-sync", test: ["npm", "test"] },
  { id: "P02", dir: "ai-setup-doctor", test: ["npm", "test"] },
  { id: "P03", dir: "mcp-sync", test: ["npm", "test"] },
  { id: "P04", dir: "secret-guard", test: ["npm", "test"] },
  // P05–P28 filled dynamically
];

function discoverP05toP28() {
  const skip = new Set(["instruct-sync", "ai-setup-doctor", "mcp-sync", "secret-guard", "agent-skill-scan", "demo-instruct-sync", "scripts", "logs", "node_modules"]);
  const out = [];
  for (const name of fs.readdirSync(ROOT)) {
    if (skip.has(name) || name.startsWith(".") || name.startsWith("Software") || name.endsWith(".md") || name.endsWith(".csv") || name.endsWith(".xlsx")) continue;
    const pkg = path.join(ROOT, name, "package.json");
    const litmus = path.join(ROOT, name, "tests", "litmus.test.mjs");
    if (fs.existsSync(pkg) && fs.existsSync(litmus)) {
      out.push({ id: name, dir: name, test: ["npm", "test"] });
    }
  }
  return out.sort((a, b) => a.dir.localeCompare(b.dir));
}

function runOne(p, attempt = 1) {
  const cwd = path.join(ROOT, p.dir);
  if (!fs.existsSync(cwd)) {
    return { id: p.id, dir: p.dir, ok: false, error: "missing dir", attempt };
  }
  const started = Date.now();
  const r = spawnSync(p.test[0], p.test.slice(1), {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
    timeout: 180_000,
  });
  const ok = r.status === 0;
  const result = {
    id: p.id,
    dir: p.dir,
    ok,
    status: r.status,
    attempt,
    ms: Date.now() - started,
    tail: ((r.stdout || "") + (r.stderr || "")).split("\n").slice(-20).join("\n"),
  };
  if (!ok && attempt < 2) {
    console.log(`  retry ${p.dir}…`);
    return runOne(p, attempt + 1);
  }
  return result;
}

const all = [...PRODUCTS, ...discoverP05toP28()];
// de-dupe by dir
const seen = new Set();
const list = all.filter((p) => (seen.has(p.dir) ? false : (seen.add(p.dir), true)));

console.log(`Suite litmus — ${list.length} products\n`);
const results = [];
for (const p of list) {
  process.stdout.write(`→ ${p.dir} … `);
  const r = runOne(p);
  results.push(r);
  console.log(r.ok ? `OK (${r.ms}ms)` : `FAIL (exit ${r.status})`);
}

// Cross-functional dataset: secret-guard + setup-doctor on shared fixture shapes
console.log("\n→ cross: secret patterns vs doctor fixtures …");
const cross = { ok: true, checks: [] };
try {
  const { findSecretHits } = await import(path.join(ROOT, "secret-guard/dist/patterns.js"));
  const hits = findSecretHits("token sk-ant-api03-THIS_IS_A_REAL_LOOKING_KEY_ABC123XYZ789");
  cross.checks.push({ name: "secret-guard detects anthropic-like key", ok: hits.length > 0 });
  const allow = findSecretHits("sk-ant-api03-example");
  cross.checks.push({ name: "allowlist example key", ok: allow.length === 0 });
  cross.ok = cross.checks.every((c) => c.ok);
} catch (e) {
  cross.ok = false;
  cross.error = String(e);
}
console.log(cross.ok ? "OK" : "FAIL");

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
const report = {
  ranAt: new Date().toISOString(),
  summary: {
    products: results.length,
    passed,
    failed: failed.length,
    crossOk: cross.ok,
    allGreen: failed.length === 0 && cross.ok,
  },
  results,
  cross,
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
fs.writeFileSync(path.join(LOG_DIR, "latest.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(LOG_DIR, `${stamp}.json`), JSON.stringify(report, null, 2));

const md = `# Suite litmus report

- **When:** ${report.ranAt}
- **Products:** ${passed}/${results.length} passed
- **Cross checks:** ${cross.ok ? "OK" : "FAIL"}
- **All green:** ${report.summary.allGreen ? "YES" : "NO"}

| Product | Status | ms | attempts |
|---------|--------|-----|----------|
${results.map((r) => `| ${r.dir} | ${r.ok ? "✅" : "❌"} | ${r.ms} | ${r.attempt} |`).join("\n")}

${failed.length ? `## Failures\n\n${failed.map((r) => `### ${r.dir}\n\n\`\`\`\n${r.tail}\n\`\`\`\n`).join("\n")}` : ""}
`;
fs.writeFileSync(path.join(LOG_DIR, "latest.md"), md);
fs.writeFileSync(path.join(ROOT, "SUITE_STATUS.md"), md);

console.log(`\n${passed}/${results.length} products green · cross=${cross.ok}`);
console.log(`Wrote logs/litmus/latest.json + SUITE_STATUS.md`);
process.exit(report.summary.allGreen ? 0 : 1);
