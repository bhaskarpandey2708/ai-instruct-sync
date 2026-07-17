#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== care-companion · investigation ===");
console.log("patient            " + (input.patient || "patient"));
console.log("meds tracked       " + (input.meds?.length || 0));
console.log("due now            " + (r.due?.length || 0));
console.log("");
console.log("due now");
if (!(r.due || []).length) console.log("  (none)");
for (const m of r.due || []) {
  console.log("  DUE   " + (m.label || m.id) + "  every=" + m.everyHours + "h");
}
console.log("");
console.log("next schedule");
for (const m of r.next || []) {
  console.log("  NEXT  " + String(m.label || m.id).padEnd(16) + "  nextAt=" + m.nextAt);
}
console.log("signal  missed dose risk is a schedule problem — not more reminders noise");
console.log("discipline  due list · reschedule nextAt by interval");
