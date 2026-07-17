#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== sbom-lite · investigation ===");
console.log("components         " + r.sbom.count);
console.log("policy gate        " + (r.gate.ok ? "PASS" : "FAIL"));
console.log("violations         " + r.gate.violations.length);
console.log("");
console.log("components (sample)");
for (const c of (r.sbom.components || []).slice(0, 8)) {
  console.log("  " + String(c.name).padEnd(22) + " " + String(c.version).padEnd(10) + " " + c.license);
}
console.log("");
console.log("violations");
if (!r.gate.violations.length) console.log("  (none)");
for (const v of r.gate.violations) {
  console.log("  BLOCK  " + v.name + "  ·  " + v.reason + (v.value ? "=" + v.value : ""));
}
console.log("");
console.log("signal  license/package policy should fail CI — not a spreadsheet review");
console.log("discipline  generate SBOM · gate · block the merge");
