#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== eval-harness · investigation ===");
console.log("suite cases     " + r.total);
console.log("passed          " + r.passed);
console.log("failed          " + r.failed);
console.log("verdict         " + (r.ok ? "GREEN" : "RED — gate should fail CI"));
console.log("");
console.log("case                  result");
for (const c of r.results) {
  const mark = c.pass ? "PASS" : "FAIL";
  console.log("  " + String(c.id).padEnd(20) + " " + mark);
  if (!c.pass) {
    if (!c.expected) console.log("        missing required phrase");
    if (c.forbidden) console.log("        hit forbidden content");
  }
}
console.log("");
if (!r.ok) {
  console.log("signal  prompt/agent regression caught before ship");
} else {
  console.log("signal  all golden cases held");
}
console.log("discipline  change the prompt → re-run the suite · exit non-zero on fail");
