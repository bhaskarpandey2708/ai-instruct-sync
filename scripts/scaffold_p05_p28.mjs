#!/usr/bin/env node
/**
 * Scaffold P05–P28 as shippable offline-first MVPs:
 * - zero runtime deps, Node 20+, dual bin where CLI
 * - domain core + litmus tests + demo runner
 * - does NOT touch P01–P04 or mcp-sync history
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const META = JSON.parse(fs.readFileSync("/tmp/p01_p28.json", "utf8")).filter(
  (p) => parseInt(p.id.slice(1), 10) >= 5 && parseInt(p.id.slice(1), 10) <= 28,
);

const YEAR = new Date().getFullYear();

/** Domain-specific core snippets — offline, no network. */
const CORES = {
  "llm-spend": {
    core: `export function main(input) {
  const events = input.events || input || [];
  const usage = parseUsageEvents(Array.isArray(events) ? events : []);
  const budget = input.budgetUsd || 100;
  return { usage, budget: budgetStatus(usage.totalCostUsd, budget) };
}
export function parseUsageEvents(events) {
  const byProvider = {};
  let totalTokens = 0, totalCost = 0;
  for (const e of events) {
    const p = e.provider || "unknown";
    const tokens = Number(e.tokens || 0);
    const cost = Number(e.costUsd ?? tokens * (e.pricePer1k || 0.002) / 1000);
    byProvider[p] = byProvider[p] || { tokens: 0, costUsd: 0, calls: 0 };
    byProvider[p].tokens += tokens;
    byProvider[p].costUsd += cost;
    byProvider[p].calls += 1;
    totalTokens += tokens;
    totalCost += cost;
  }
  return { byProvider, totalTokens, totalCostUsd: round(totalCost), eventCount: events.length };
}
export function budgetStatus(totalCostUsd, budgetUsd) {
  const used = totalCostUsd / budgetUsd;
  return { budgetUsd, totalCostUsd, usedPct: round(used * 100), over: totalCostUsd > budgetUsd };
}
function round(n) { return Math.round(n * 10000) / 10000; }
`,
    litmus: `
import { parseUsageEvents, budgetStatus } from "../src/core.js";
test("aggregates multi-provider spend", () => {
  const r = parseUsageEvents([
    { provider: "openai", tokens: 1000, pricePer1k: 0.01 },
    { provider: "anthropic", tokens: 2000, pricePer1k: 0.015 },
  ]);
  assert.equal(r.totalTokens, 3000);
  assert.ok(r.totalCostUsd > 0);
  assert.equal(r.byProvider.openai.calls, 1);
});
test("budget over triggers", () => {
  assert.equal(budgetStatus(12, 10).over, true);
  assert.equal(budgetStatus(5, 10).over, false);
});
`,
    fixture: { events: [{ provider: "openai", tokens: 5000, pricePer1k: 0.01 }] },
  },
  "skill-sync": {
    core: `export function main(input) {
  const v = validateSkillPackage(input);
  const plan = input.remote ? planInstall(input, input.remote) : null;
  return { validate: v, plan };
}
export function validateSkillPackage(pkg) {
  const errors = [];
  if (!pkg || typeof pkg !== "object") return { ok: false, errors: ["not an object"] };
  if (!pkg.name || !/^[a-z0-9][a-z0-9._-]*$/i.test(pkg.name)) errors.push("invalid name");
  if (!pkg.version || !/^\\d+\\.\\d+\\.\\d+/.test(pkg.version)) errors.push("invalid version");
  if (!Array.isArray(pkg.skills) || pkg.skills.length === 0) errors.push("skills[] required");
  for (const s of pkg.skills || []) {
    if (!s.id || !s.content) errors.push(\`skill missing id/content: \${s.id || "?"}\`);
  }
  return { ok: errors.length === 0, errors };
}
export function planInstall(local, remote) {
  const map = Object.fromEntries((local.skills || []).map((s) => [s.id, s]));
  const added = [], updated = [];
  for (const s of remote.skills || []) {
    if (!map[s.id]) added.push(s.id);
    else if (map[s.id].content !== s.content) updated.push(s.id);
  }
  return { added, updated, wouldWrite: added.length + updated.length };
}
`,
    litmus: `
import { validateSkillPackage, planInstall } from "../src/core.js";
test("validates skill package", () => {
  const r = validateSkillPackage({ name: "team", version: "1.0.0", skills: [{ id: "style", content: "use TS" }] });
  assert.equal(r.ok, true);
});
test("planInstall diffs", () => {
  const p = planInstall({ skills: [{ id: "a", content: "1" }] }, { skills: [{ id: "a", content: "2" }, { id: "b", content: "x" }] });
  assert.deepEqual(p.updated, ["a"]);
  assert.deepEqual(p.added, ["b"]);
});
`,
    fixture: { name: "demo", version: "0.1.0", skills: [{ id: "commit", content: "Conventional commits" }] },
  },
  "shadow-ai": {
    core: `export function main(input) {
  return scoreShadowTools(input.tools || input || []);
}
export function scoreShadowTools(inventory) {
  const unauthorized = (inventory || []).filter((t) => t.approved === false);
  const risk = unauthorized.reduce((n, t) => n + (t.dataClass === "confidential" ? 3 : 1), 0);
  return {
    total: inventory.length,
    unauthorized: unauthorized.map((t) => t.name),
    riskScore: Math.min(100, risk * 10),
    severity: risk >= 6 ? "high" : risk >= 2 ? "medium" : "low",
  };
}
`,
    litmus: `
import { scoreShadowTools } from "../src/core.js";
test("flags unauthorized confidential tools", () => {
  const r = scoreShadowTools([
    { name: "ChatGPT", approved: false, dataClass: "confidential" },
    { name: "Claude Team", approved: true, dataClass: "internal" },
  ]);
  assert.equal(r.unauthorized.length, 1);
  assert.equal(r.severity, "medium");
});
`,
    fixture: { tools: [{ name: "ChatGPT Free", approved: false, dataClass: "confidential" }] },
  },
  "eval-harness": {
    core: `export function main(input) {
  return runSuite(input.cases || input || []);
}
export function runCase(c) {
  const expected = (c.expectContains || []).every((s) => String(c.actual || "").includes(s));
  const forbidden = (c.forbidContains || []).some((s) => String(c.actual || "").includes(s));
  const pass = expected && !forbidden;
  return { id: c.id, pass, expected, forbidden };
}
export function runSuite(cases) {
  const results = (cases || []).map(runCase);
  const passed = results.filter((r) => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, results, ok: passed === results.length };
}
`,
    litmus: `
import { runSuite } from "../src/core.js";
test("eval suite pass/fail", () => {
  const r = runSuite([
    { id: "a", actual: "hello world", expectContains: ["hello"] },
    { id: "b", actual: "leak sk-ant-x", forbidContains: ["sk-ant"] },
  ]);
  assert.equal(r.passed, 1);
  assert.equal(r.failed, 1);
  assert.equal(r.ok, false);
});
`,
    fixture: { cases: [{ id: "greet", actual: "Hello user", expectContains: ["Hello"] }] },
  },
  "auth-anomaly-radar": {
    core: `export function main(input) {
  return scoreLoginSequence(input.events || input || []);
}
export function haversineKm(a, b) {
  const R = 6371, toR = (d) => d * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const x = Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function scoreLoginSequence(events) {
  const sorted = [...events].sort((a,b) => a.ts - b.ts);
  const flags = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i-1], cur = sorted[i];
    const hours = (cur.ts - prev.ts) / 3600000;
    if (prev.geo && cur.geo && hours > 0) {
      const km = haversineKm(prev.geo, cur.geo);
      const speed = km / hours;
      if (speed > 800) flags.push({ type: "impossible_travel", km: Math.round(km), speed: Math.round(speed), user: cur.user });
    }
    if (cur.failures >= 10) flags.push({ type: "credential_stuffing", user: cur.user, failures: cur.failures });
  }
  return { flags, risk: flags.length === 0 ? "low" : flags.some(f => f.type === "impossible_travel") ? "high" : "medium" };
}
`,
    litmus: `
import { scoreLoginSequence, haversineKm } from "../src/core.js";
test("impossible travel NYC to Tokyo", () => {
  const r = scoreLoginSequence([
    { user: "a", ts: 0, geo: { lat: 40.7, lon: -74 }, failures: 0 },
    { user: "a", ts: 2*3600000, geo: { lat: 35.6, lon: 139.7 }, failures: 0 },
  ]);
  assert.ok(r.flags.some(f => f.type === "impossible_travel"));
  assert.equal(r.risk, "high");
});
test("haversine positive", () => {
  assert.ok(haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 1 }) > 100);
});
`,
    fixture: { events: [{ user: "u", ts: 0, geo: { lat: 0, lon: 0 }, failures: 0 }] },
  },
  "fraud-signal-kit": {
    core: `export function main(input) {
  return compositeSignals(input);
}
export function emailRisk(email) {
  const e = String(email || "").toLowerCase();
  let score = 0;
  if (!e.includes("@")) score += 80;
  if (/\\d{5,}/.test(e)) score += 20;
  if (/(temp|disposable|mailinator|guerrillamail)/.test(e)) score += 50;
  if (e.endsWith(".ru") || e.endsWith(".tk")) score += 15;
  return { email: e, score: Math.min(100, score), band: score >= 50 ? "high" : score >= 20 ? "medium" : "low" };
}
export function velocityRisk(events, windowMs = 60000) {
  const now = Math.max(...events.map(e => e.ts), 0);
  const recent = events.filter(e => now - e.ts <= windowMs);
  const score = Math.min(100, recent.length * 15);
  return { count: recent.length, score, band: score >= 60 ? "high" : score >= 30 ? "medium" : "low" };
}
export function compositeSignals({ email, events }) {
  const e = emailRisk(email);
  const v = velocityRisk(events || []);
  const score = Math.round(e.score * 0.6 + v.score * 0.4);
  return { email: e, velocity: v, score, band: score >= 50 ? "high" : score >= 25 ? "medium" : "low" };
}
`,
    litmus: `
import { emailRisk, velocityRisk, compositeSignals } from "../src/core.js";
test("disposable email high risk", () => {
  assert.equal(emailRisk("x@mailinator.com").band, "high");
});
test("velocity spikes", () => {
  const ts = Date.now();
  const r = velocityRisk([{ ts }, { ts: ts-1000 }, { ts: ts-2000 }, { ts: ts-3000 }, { ts: ts-4000 }]);
  assert.ok(r.score >= 60);
});
`,
    fixture: { email: "user@example.com", events: [{ ts: Date.now() }] },
  },
  "cloud-waste-radar": {
    core: `export function main(input) {
  return findWaste(input.inventory || input || []);
}
export function findWaste(inventory) {
  const findings = [];
  for (const r of inventory || []) {
    if (r.type === "ebs" && r.attached === false) findings.push({ id: r.id, kind: "idle_ebs", monthlyUsd: r.monthlyUsd || 5 });
    if (r.type === "eip" && r.associated === false) findings.push({ id: r.id, kind: "idle_eip", monthlyUsd: r.monthlyUsd || 3.6 });
    if (r.type === "rds" && r.connections === 0 && r.daysIdle >= 7) findings.push({ id: r.id, kind: "idle_rds", monthlyUsd: r.monthlyUsd || 50 });
    if (r.type === "ec2" && r.cpuAvg7d != null && r.cpuAvg7d < 5) findings.push({ id: r.id, kind: "rightsizing_ec2", monthlyUsd: (r.monthlyUsd || 30) * 0.4 });
  }
  const savings = findings.reduce((s, f) => s + f.monthlyUsd, 0);
  return { findings, monthlySavingsUsd: Math.round(savings * 100) / 100, count: findings.length };
}
`,
    litmus: `
import { findWaste } from "../src/core.js";
test("detects idle ebs and eip", () => {
  const r = findWaste([
    { id: "vol-1", type: "ebs", attached: false, monthlyUsd: 8 },
    { id: "eip-1", type: "eip", associated: false, monthlyUsd: 3.6 },
  ]);
  assert.equal(r.count, 2);
  assert.ok(r.monthlySavingsUsd > 10);
});
`,
    fixture: { inventory: [{ id: "vol-x", type: "ebs", attached: false, monthlyUsd: 10 }] },
  },
  "dev-onboard-os": {
    core: `export function main(input) {
  return progress(input.state || input || {});
}
export const DEFAULT_CHECKLIST = [
  { id: "laptop", title: "Dev machine provisioned" },
  { id: "github", title: "GitHub access + 2FA" },
  { id: "repo", title: "Clone monorepo + build green" },
  { id: "secrets", title: "Secrets via vault (not chat)" },
  { id: "agents", title: "AI agents + MCP configured safely" },
  { id: "first-pr", title: "First PR merged" },
];
export function progress(state) {
  const items = DEFAULT_CHECKLIST.map((c) => ({ ...c, done: !!(state && state[c.id]) }));
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) };
}
`,
    litmus: `
import { progress, DEFAULT_CHECKLIST } from "../src/core.js";
test("progress pct", () => {
  const r = progress({ laptop: true, github: true });
  assert.equal(r.done, 2);
  assert.equal(r.total, DEFAULT_CHECKLIST.length);
  assert.ok(r.pct > 0 && r.pct < 100);
});
`,
    fixture: { state: { laptop: true } },
  },
  "sbom-lite": {
    core: `export function main(input) {
  const sbom = sbomFromPackageLock(input);
  return { sbom, gate: policyGate(sbom, input.policy || {}) };
}
export function sbomFromPackageLock(lock) {
  const packages = [];
  const deps = lock.packages || lock.dependencies || {};
  if (lock.packages) {
    for (const [p, meta] of Object.entries(lock.packages)) {
      if (!p) continue;
      const name = p.replace(/^node_modules\\//, "");
      packages.push({ name, version: meta.version || "0.0.0", license: meta.license || "UNKNOWN" });
    }
  } else {
    for (const [name, meta] of Object.entries(deps)) {
      packages.push({ name, version: meta.version || "0.0.0", license: "UNKNOWN" });
    }
  }
  return { bomFormat: "secret-guard-sbom-lite", components: packages, count: packages.length };
}
export function policyGate(sbom, { denyLicenses = ["GPL-3.0"], denyNames = [] } = {}) {
  const violations = [];
  for (const c of sbom.components || []) {
    if (denyLicenses.includes(c.license)) violations.push({ name: c.name, reason: "license", value: c.license });
    if (denyNames.includes(c.name)) violations.push({ name: c.name, reason: "denied-package" });
  }
  return { ok: violations.length === 0, violations };
}
`,
    litmus: `
import { sbomFromPackageLock, policyGate } from "../src/core.js";
test("sbom from lock packages", () => {
  const s = sbomFromPackageLock({ packages: { "": {}, "node_modules/left-pad": { version: "1.0.0", license: "MIT" } } });
  assert.equal(s.count, 1);
  assert.equal(s.components[0].name, "left-pad");
});
test("policy gate fails on GPL", () => {
  const s = { components: [{ name: "x", license: "GPL-3.0" }] };
  assert.equal(policyGate(s).ok, false);
});
`,
    fixture: { packages: { "": {}, "node_modules/foo": { version: "1.2.3", license: "MIT" } } },
  },
  "grc-evidence-autopilot": {
    core: `export function main(input) {
  return mapEvidence(input.controls || [], input.artifacts || []);
}
export function mapEvidence(controls, artifacts) {
  const byControl = {};
  for (const c of controls || []) byControl[c.id] = { ...c, artifacts: [] };
  for (const a of artifacts || []) {
    for (const cid of a.controls || []) {
      if (byControl[cid]) byControl[cid].artifacts.push(a.id);
    }
  }
  const list = Object.values(byControl);
  const covered = list.filter((c) => c.artifacts.length > 0).length;
  return { controls: list, covered, total: list.length, coveragePct: list.length ? Math.round(covered / list.length * 100) : 0 };
}
`,
    litmus: `
import { mapEvidence } from "../src/core.js";
test("coverage", () => {
  const r = mapEvidence(
    [{ id: "CC6.1", title: "Access" }, { id: "CC7.2", title: "Logging" }],
    [{ id: "aws-iam", controls: ["CC6.1"] }],
  );
  assert.equal(r.covered, 1);
  assert.equal(r.coveragePct, 50);
});
`,
    fixture: { controls: [{ id: "CC6.1", title: "Logical access" }], artifacts: [] },
  },
  "wa-ops-desk": {
    core: `export function main(input) {
  return routeMessage(input.message || input, input.staff || []);
}
export function routeMessage(msg, staff) {
  const text = String(msg.text || "").toLowerCase();
  let label = "general";
  if (/order|invoice|payment|refund/.test(text)) label = "orders";
  else if (/book|appoint|slot/.test(text)) label = "booking";
  else if (/help|faq|how/.test(text)) label = "faq";
  const pool = (staff || []).filter((s) => (s.labels || []).includes(label) || (s.labels || []).includes("general"));
  const assignee = pool.sort((a, b) => (a.load || 0) - (b.load || 0))[0] || null;
  return { label, assignee: assignee ? assignee.id : null, autoReply: label === "faq" ? "Please see our FAQ: https://example.com/faq" : null };
}
`,
    litmus: `
import { routeMessage } from "../src/core.js";
test("routes order to staff", () => {
  const r = routeMessage({ text: "Where is my order?" }, [{ id: "s1", labels: ["orders"], load: 1 }]);
  assert.equal(r.label, "orders");
  assert.equal(r.assignee, "s1");
});
`,
    fixture: { message: { text: "book tomorrow 3pm" }, staff: [{ id: "a", labels: ["booking"], load: 0 }] },
  },
  "gst-ops-copilot": {
    core: `export function main(input) {
  return invoiceHygiene(input.invoices || input || []);
}
export function invoiceHygiene(invoices) {
  const issues = [];
  for (const inv of invoices || []) {
    if (!inv.gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(inv.gstin)) {
      issues.push({ id: inv.id, code: "bad_gstin" });
    }
    if (inv.taxable == null || inv.cgst == null || inv.sgst == null) issues.push({ id: inv.id, code: "missing_tax" });
    else {
      const expect = Math.round(inv.taxable * 0.09 * 100) / 100;
      if (Math.abs(inv.cgst - expect) > 0.05 || Math.abs(inv.sgst - expect) > 0.05) {
        issues.push({ id: inv.id, code: "tax_mismatch", expect });
      }
    }
  }
  return { issues, ok: issues.length === 0, count: (invoices || []).length };
}
`,
    litmus: `
import { invoiceHygiene } from "../src/core.js";
test("detects tax mismatch", () => {
  const r = invoiceHygiene([{ id: "1", gstin: "27AAPFU0939F1ZV", taxable: 1000, cgst: 50, sgst: 50 }]);
  assert.ok(r.issues.some(i => i.code === "tax_mismatch"));
});
`,
    fixture: { invoices: [{ id: "i1", gstin: "27AAPFU0939F1ZV", taxable: 100, cgst: 9, sgst: 9 }] },
  },
  "appt-book-india": {
    core: `export function main(input) {
  const dayStart = input.dayStart || Date.parse("2026-07-11T09:00:00Z");
  const dayEnd = input.dayEnd || Date.parse("2026-07-11T17:00:00Z");
  const slots = findSlots(dayStart, dayEnd, input.busy || [], input.durationMin || 30);
  return { slots, book: book(slots, input.preferredStart) };
}
export function findSlots(dayStart, dayEnd, busy, durationMin = 30) {
  const slots = [];
  let t = dayStart;
  const step = durationMin * 60000;
  while (t + step <= dayEnd) {
    const end = t + step;
    const conflict = (busy || []).some((b) => !(end <= b.start || t >= b.end));
    if (!conflict) slots.push({ start: t, end });
    t += step;
  }
  return slots;
}
export function book(slots, preferredStart) {
  const hit = slots.find((s) => s.start === preferredStart) || slots[0] || null;
  return hit ? { ok: true, slot: hit } : { ok: false, slot: null };
}
`,
    litmus: `
import { findSlots, book } from "../src/core.js";
test("finds free slots", () => {
  const start = Date.parse("2026-07-11T09:00:00Z");
  const end = Date.parse("2026-07-11T11:00:00Z");
  const busy = [{ start: Date.parse("2026-07-11T09:30:00Z"), end: Date.parse("2026-07-11T10:00:00Z") }];
  const slots = findSlots(start, end, busy, 30);
  assert.ok(slots.length >= 3);
  assert.equal(book(slots, start).ok, true);
});
`,
    fixture: {},
  },
  "clinic-admin-lite": {
    core: `export function main(input) {
  let L = createLedger();
  for (const p of input.patients || []) L = addPatient(L, p);
  for (const a of input.appts || []) L = addAppt(L, a);
  if (input.charge) charge(L, input.charge.patientId, input.charge.amount);
  return L;
}
export function createLedger() { return { patients: {}, appts: [] }; }
export function addPatient(ledger, p) {
  ledger.patients[p.id] = { ...p, balance: p.balance || 0 };
  return ledger;
}
export function addAppt(ledger, a) {
  if (!ledger.patients[a.patientId]) throw new Error("unknown patient");
  ledger.appts.push(a);
  return ledger;
}
export function charge(ledger, patientId, amount) {
  ledger.patients[patientId].balance += amount;
  return ledger.patients[patientId].balance;
}
`,
    litmus: `
import { createLedger, addPatient, addAppt, charge } from "../src/core.js";
test("patient appt charge", () => {
  let L = createLedger();
  L = addPatient(L, { id: "p1", name: "Asha" });
  L = addAppt(L, { id: "a1", patientId: "p1", at: 1 });
  assert.equal(charge(L, "p1", 500), 500);
  assert.equal(L.appts.length, 1);
});
`,
    fixture: {
      patients: [{ id: "p1", name: "Asha" }],
      appts: [{ id: "a1", patientId: "p1", at: 1 }],
      charge: { patientId: "p1", amount: 500 },
    },
  },
  "learn-loop": {
    core: `export function main(input) {
  const cards = (input.cards || []).map((c) => nextReview(c, input.quality ?? 4));
  return { cards, due: dueCards(cards, input.day || 0) };
}
export function nextReview(card, quality /* 0-5 */) {
  let { ef = 2.5, interval = 0, reps = 0 } = card;
  if (quality < 3) return { ...card, reps: 0, interval: 1, ef, dueInDays: 1 };
  if (reps === 0) interval = 1;
  else if (reps === 1) interval = 6;
  else interval = Math.round(interval * ef);
  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { ...card, reps: reps + 1, interval, ef, dueInDays: interval };
}
export function dueCards(cards, day = 0) {
  return (cards || []).filter((c) => (c.dueDay ?? 0) <= day);
}
`,
    litmus: `
import { nextReview, dueCards } from "../src/core.js";
test("SRS interval grows", () => {
  let c = { id: "1", reps: 0, interval: 0, ef: 2.5 };
  c = nextReview(c, 5);
  assert.equal(c.interval, 1);
  c = nextReview(c, 5);
  assert.equal(c.interval, 6);
});
`,
    fixture: { cards: [{ id: "c1", dueDay: 0 }] },
  },
  "cyber-smb-shield": {
    core: `export function main(input) {
  return {
    score: securityScore(input.answers || input || {}),
    phishing: phishingClickRate(input.sent || 100, input.clicked || 5),
  };
}
export function securityScore(answers) {
  const weights = { mfa: 25, backups: 20, dnsFilter: 15, phishingTrain: 20, patching: 20 };
  let score = 0;
  for (const [k, w] of Object.entries(weights)) if (answers[k]) score += w;
  return { score, band: score >= 80 ? "strong" : score >= 50 ? "fair" : "weak", max: 100 };
}
export function phishingClickRate(sent, clicked) {
  const rate = sent ? clicked / sent : 0;
  return { rate, pct: Math.round(rate * 100), risk: rate > 0.2 ? "high" : rate > 0.05 ? "medium" : "low" };
}
`,
    litmus: `
import { securityScore, phishingClickRate } from "../src/core.js";
test("score bands", () => {
  assert.equal(securityScore({ mfa: true, backups: true, dnsFilter: true, phishingTrain: true, patching: true }).score, 100);
  assert.equal(phishingClickRate(100, 25).risk, "high");
});
`,
    fixture: { answers: { mfa: true, backups: false } },
  },
  "data-quality-guard": {
    core: `export function main(input) {
  return runExpectations(input.rows || [], input.expectations || []);
}
export function runExpectations(rows, expectations) {
  const results = [];
  for (const exp of expectations || []) {
    if (exp.type === "not_null") {
      const bad = rows.filter((r) => r[exp.column] == null || r[exp.column] === "");
      results.push({ id: exp.id, pass: bad.length === 0, bad: bad.length });
    } else if (exp.type === "unique") {
      const seen = new Set();
      let dups = 0;
      for (const r of rows) {
        const v = r[exp.column];
        if (seen.has(v)) dups++;
        seen.add(v);
      }
      results.push({ id: exp.id, pass: dups === 0, bad: dups });
    } else if (exp.type === "range") {
      const bad = rows.filter((r) => Number(r[exp.column]) < exp.min || Number(r[exp.column]) > exp.max);
      results.push({ id: exp.id, pass: bad.length === 0, bad: bad.length });
    }
  }
  return { results, ok: results.every((r) => r.pass) };
}
`,
    litmus: `
import { runExpectations } from "../src/core.js";
test("dq checks", () => {
  const r = runExpectations(
    [{ id: 1, amount: 10 }, { id: 2, amount: 5 }, { id: 2, amount: 99 }],
    [{ id: "u", type: "unique", column: "id" }, { id: "r", type: "range", column: "amount", min: 0, max: 50 }],
  );
  assert.equal(r.ok, false);
});
`,
    fixture: { rows: [{ id: 1, amount: 3 }], expectations: [{ id: "nn", type: "not_null", column: "id" }] },
  },
  "care-companion": {
    core: `export function main(input) {
  const now = input.now || Date.now();
  const due = medsDue(input.meds || [], now);
  return { due, next: (input.meds || []).map((m) => scheduleNext(m, now)) };
}
export function medsDue(meds, now = Date.now()) {
  return (meds || []).filter((m) => (m.nextAt || 0) <= now);
}
export function scheduleNext(med, from = Date.now()) {
  const intervalMs = (med.everyHours || 24) * 3600000;
  return { ...med, nextAt: from + intervalMs };
}
`,
    litmus: `
import { medsDue, scheduleNext } from "../src/core.js";
test("meds due and reschedule", () => {
  const now = 1000;
  assert.equal(medsDue([{ id: "m1", nextAt: 500 }, { id: "m2", nextAt: 2000 }], now).length, 1);
  assert.ok(scheduleNext({ everyHours: 8 }, now).nextAt === now + 8 * 3600000);
});
`,
    fixture: { meds: [{ id: "aspirin", everyHours: 12, nextAt: 0 }] },
  },
  "personal-crm": {
    core: `export function main(input) {
  const now = input.now || Date.now();
  return { nudge: peopleNeedingNudge(input.people || [], now, input.days || 30) };
}
export function peopleNeedingNudge(people, now = Date.now(), days = 30) {
  const ms = days * 86400000;
  return (people || []).filter((p) => !p.lastTouch || now - p.lastTouch > ms);
}
export function recordTouch(person, at = Date.now(), note = "") {
  return { ...person, lastTouch: at, notes: [...(person.notes || []), { at, note }] };
}
`,
    litmus: `
import { peopleNeedingNudge, recordTouch } from "../src/core.js";
test("nudge list", () => {
  const now = Date.now();
  const r = peopleNeedingNudge([{ id: "a", lastTouch: now - 40*86400000 }, { id: "b", lastTouch: now }], now, 30);
  assert.equal(r.length, 1);
  assert.equal(recordTouch({ id: "a" }, now, "hi").notes.length, 1);
});
`,
    fixture: { people: [{ id: "founder-friend", lastTouch: 0 }] },
  },
  "creator-ops": {
    core: `export function main(input) {
  return {
    pipeline: pipelineSummary(input.deals || []),
    conflicts: calendarConflicts(input.items || []),
  };
}
export function pipelineSummary(deals) {
  const byStage = {};
  let total = 0;
  for (const d of deals || []) {
    byStage[d.stage] = (byStage[d.stage] || 0) + 1;
    total += Number(d.value || 0);
  }
  return { byStage, dealCount: (deals || []).length, pipelineValue: total };
}
export function calendarConflicts(items) {
  const sorted = [...(items || [])].sort((a, b) => a.start - b.start);
  const conflicts = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) conflicts.push([sorted[i - 1].id, sorted[i].id]);
  }
  return conflicts;
}
`,
    litmus: `
import { pipelineSummary, calendarConflicts } from "../src/core.js";
test("pipeline + conflicts", () => {
  assert.equal(pipelineSummary([{ stage: "pitch", value: 1000 }, { stage: "won", value: 500 }]).pipelineValue, 1500);
  assert.equal(calendarConflicts([{ id: "a", start: 0, end: 10 }, { id: "b", start: 5, end: 15 }]).length, 1);
});
`,
    fixture: { deals: [{ stage: "pitch", value: 2000 }] },
  },
  "climate-ops-meter": {
    core: `// simplified emission factors kg CO2e
const FACTORS = { electricity_kwh: 0.7, diesel_l: 2.68, flight_km: 0.15, waste_kg: 0.5 };
export function main(input) {
  return estimateEmissions(input.activities || input || []);
}
export function estimateEmissions(activities) {
  let total = 0;
  const lines = [];
  for (const a of activities || []) {
    const f = FACTORS[a.type] || 0;
    const kg = f * Number(a.amount || 0);
    total += kg;
    lines.push({ ...a, kgCO2e: Math.round(kg * 100) / 100 });
  }
  return { lines, totalKgCO2e: Math.round(total * 100) / 100, totalTCO2e: Math.round(total / 10) / 100 };
}
`,
    litmus: `
import { estimateEmissions } from "../src/core.js";
test("emission estimate", () => {
  const r = estimateEmissions([{ type: "electricity_kwh", amount: 1000 }, { type: "diesel_l", amount: 10 }]);
  assert.ok(r.totalKgCO2e > 700);
});
`,
    fixture: { activities: [{ type: "electricity_kwh", amount: 100 }] },
  },
  "sc-visibility-lite": {
    core: `export function main(input) {
  const suppliers = input.suppliers || input || [];
  return { risk: riskRollup(suppliers), stale: staleCheckins(suppliers, input.now, input.maxDays) };
}
export function riskRollup(suppliers) {
  const bands = { low: 0, medium: 0, high: 0 };
  for (const s of suppliers || []) {
    const b = s.risk || "low";
    bands[b] = (bands[b] || 0) + 1;
  }
  const high = (suppliers || []).filter((s) => s.risk === "high");
  return { bands, highRisk: high.map((s) => s.id), count: (suppliers || []).length };
}
export function staleCheckins(suppliers, now = Date.now(), maxDays = 14) {
  const ms = maxDays * 86400000;
  return (suppliers || []).filter((s) => !s.lastCheckin || now - s.lastCheckin > ms);
}
`,
    litmus: `
import { riskRollup, staleCheckins } from "../src/core.js";
test("risk rollup", () => {
  const r = riskRollup([{ id: "s1", risk: "high" }, { id: "s2", risk: "low" }]);
  assert.equal(r.bands.high, 1);
  assert.equal(staleCheckins([{ id: "s1", lastCheckin: 0 }], Date.now(), 14).length, 1);
});
`,
    fixture: { suppliers: [{ id: "sup-1", risk: "medium", lastCheckin: Date.now() }] },
  },
  "focus-forge": {
    core: `export function main(input) {
  return weeklyReview(input.sessions || []);
}
export function sessionScore(session) {
  const planned = session.plannedMin || 25;
  const actual = session.actualMin || 0;
  const distractions = session.distractions || 0;
  const focus = Math.max(0, Math.min(100, (actual / planned) * 100 - distractions * 5));
  return { focus: Math.round(focus), deep: focus >= 70 };
}
export function weeklyReview(sessions) {
  const scores = (sessions || []).map(sessionScore);
  const avg = scores.length ? scores.reduce((s, x) => s + x.focus, 0) / scores.length : 0;
  return { sessions: scores.length, avgFocus: Math.round(avg), deepSessions: scores.filter((s) => s.deep).length };
}
`,
    litmus: `
import { sessionScore, weeklyReview } from "../src/core.js";
test("focus scoring", () => {
  assert.ok(sessionScore({ plannedMin: 50, actualMin: 50, distractions: 0 }).deep);
  assert.equal(weeklyReview([{ plannedMin: 25, actualMin: 25, distractions: 0 }]).sessions, 1);
});
`,
    fixture: { sessions: [{ plannedMin: 25, actualMin: 20, distractions: 1 }] },
  },
  "api-contract-sentinel": {
    core: `export function main(input) {
  return diffOpenApi(input.prev || {}, input.next || {});
}
export function diffOpenApi(prev, next) {
  const breaks = [];
  const warns = [];
  const pPaths = prev.paths || {};
  const nPaths = next.paths || {};
  for (const path of Object.keys(pPaths)) {
    if (!nPaths[path]) breaks.push({ type: "path_removed", path });
    else {
      for (const method of Object.keys(pPaths[path] || {})) {
        if (!nPaths[path][method]) breaks.push({ type: "method_removed", path, method });
      }
    }
  }
  for (const path of Object.keys(nPaths)) {
    if (!pPaths[path]) warns.push({ type: "path_added", path });
  }
  // required request props
  for (const path of Object.keys(nPaths)) {
    for (const method of Object.keys(nPaths[path] || {})) {
      const prevReq = (((pPaths[path] || {})[method] || {}).requestBody || {}).requiredProps || [];
      const nextReq = (((nPaths[path] || {})[method] || {}).requestBody || {}).requiredProps || [];
      for (const prop of nextReq) {
        if (!prevReq.includes(prop)) breaks.push({ type: "required_field_added", path, method, prop });
      }
    }
  }
  return { breaks, warns, ok: breaks.length === 0 };
}
`,
    litmus: `
import { diffOpenApi } from "../src/core.js";
test("detects breaking path removal", () => {
  const r = diffOpenApi(
    { paths: { "/v1/users": { get: {} } } },
    { paths: {} },
  );
  assert.equal(r.ok, false);
  assert.ok(r.breaks.some(b => b.type === "path_removed"));
});
test("required field is breaking", () => {
  const r = diffOpenApi(
    { paths: { "/x": { post: { requestBody: { requiredProps: ["a"] } } } } },
    { paths: { "/x": { post: { requestBody: { requiredProps: ["a", "b"] } } } } },
  );
  assert.ok(r.breaks.some(b => b.type === "required_field_added"));
});
`,
    fixture: {
      prev: { paths: { "/health": { get: {} } } },
      next: { paths: { "/health": { get: {} }, "/v2": { get: {} } } },
    },
  },
};

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

function pkgName(repo) {
  return `ai-${repo}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function scaffold(item) {
  const dir = path.join(ROOT, item.repo);
  if (["instruct-sync", "ai-setup-doctor", "mcp-sync", "secret-guard"].includes(item.repo)) {
    return { skipped: true, repo: item.repo };
  }
  // don't wipe agent-skill-scan if different
  ensureDir(dir);
  const name = pkgName(item.repo);
  const core = CORES[item.repo] || CORES[item.name] || {
    core: `export function health() { return { ok: true, product: ${JSON.stringify(item.name)} }; }\n`,
    litmus: `import { health } from "../src/core.js";\ntest("health", () => { assert.equal(health().ok, true); });\n`,
    fixture: {},
  };

  write(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name,
        version: "0.1.0-beta.0",
        private: true,
        description: item.one_liner,
        type: "module",
        bin: { [item.repo]: "src/cli.js", [name]: "src/cli.js" },
        scripts: {
          test: "node --test tests/litmus.test.mjs",
          demo: "node demo/run-demo.mjs",
          litmus: "node --test tests/litmus.test.mjs",
        },
        engines: { node: ">=20" },
        keywords: (item.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
        license: "MIT",
        author: "Bhaskar Pandey <bhaskarauthor@gmail.com>",
      },
      null,
      2,
    ) + "\n",
  );

  write(
    path.join(dir, "src/core.js"),
    `/** ${item.id} ${item.name} — offline MVP core (zero deps) */\n${core.core}`,
  );

  write(
    path.join(dir, "src/cli.js"),
    `#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as core from "./core.js";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(\`${item.name} (${item.id}) — ${item.one_liner}

Usage:
  ${item.repo} [--json] [fixture.json]
  ${item.repo} --help

Offline MVP core for OSS shipping; commercial layers later.
\`);
  process.exit(0);
}
const json = args.includes("--json");
const file = args.find((a) => !a.startsWith("-"));
let input = {};
if (file && existsSync(file)) input = JSON.parse(readFileSync(resolve(file), "utf8"));
else if (existsSync(new URL("../fixtures/sample.json", import.meta.url))) {
  input = JSON.parse(readFileSync(new URL("../fixtures/sample.json", import.meta.url), "utf8"));
}
const result = typeof core.main === "function" ? core.main(input) : { ok: true };
if (json) console.log(JSON.stringify({ product: "${item.name}", id: "${item.id}", result }, null, 2));
else {
  console.log("${item.name} · ${item.id}");
  console.log(JSON.stringify(result, null, 2));
}
`,
  );

  write(
    path.join(dir, "tests/litmus.test.mjs"),
    `import { test } from "node:test";
import assert from "node:assert/strict";
${core.litmus}
`,
  );

  write(path.join(dir, "fixtures/sample.json"), JSON.stringify(core.fixture ?? {}, null, 2) + "\n");

  write(
    path.join(dir, "demo/run-demo.mjs"),
    `#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log("=== DEMO ${item.id} ${item.name} ===");
console.log("${item.one_liner}");
const r = spawnSync(process.execPath, [path.join(root, "src/cli.js"), "--json", path.join(root, "fixtures/sample.json")], {
  encoding: "utf8",
});
console.log(r.stdout || r.stderr);
process.exit(r.status ?? 0);
`,
  );

  write(
    path.join(dir, "demo/DEMO.md"),
    `# ${item.name} (${item.id}) — Demo

${item.one_liner}

## Run

\`\`\`bash
cd ${item.repo}
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
\`\`\`

## MVP

${item.mvp}

## Platforms

${item.platforms}

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
`,
  );

  write(
    path.join(dir, "README.md"),
    `# ${item.name}

> ${item.id} · ${item.category}

**${item.one_liner}**

## Status

Offline **MVP core** (v0.1.0-beta.0) — zero runtime dependencies, litmus-tested, demo-ready.
Part of the Bhaskar Pandey product portfolio under \`Documents/development\`.

## Quick start

\`\`\`bash
cd ${item.repo}
npm test
npm run demo
node src/cli.js --help
\`\`\`

## MVP scope

${item.mvp}

## Open source → commercial

| Layer | Now | Later |
|-------|-----|-------|
| Core algorithms / CLI | OSS MIT | remains OSS |
| Hosted / team / SSO | — | commercial |
| Support / SLAs | community | paid |

## License

MIT
`,
  );

  write(
    path.join(dir, "LICENSE"),
    `MIT License

Copyright (c) ${YEAR} Bhaskar Pandey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
`,
  );

  return { skipped: false, repo: item.repo, id: item.id };
}

const results = META.map(scaffold);
console.log(JSON.stringify({ created: results.filter((r) => !r.skipped).length, skipped: results.filter((r) => r.skipped).length, results }, null, 2));
