#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);
const now = input.now || Date.now();
const days = input.days || 30;

console.log("=== personal-crm · investigation ===");
console.log("people             " + (input.people?.length || 0));
console.log("nudge window       " + days + " days");
console.log("need touch         " + (r.nudge?.length || 0));
console.log("");
console.log("nudge list");
if (!(r.nudge || []).length) console.log("  (none)");
for (const p of r.nudge || []) {
  const age = p.lastTouch ? Math.round((now - p.lastTouch) / 86400000) + "d silent" : "never";
  console.log("  NUDGE  " + String(p.name || p.id).padEnd(22) + "  " + age);
}
console.log("");
console.log("ok (recent)");
for (const p of (input.people || []).filter((x) => !(r.nudge || []).find((n) => n.id === x.id))) {
  console.log("  OK     " + (p.name || p.id));
}
console.log("signal  relationships decay on a timer — not a vibe");
console.log("discipline  lastTouch + window → nudge list");
