#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== gst-ops-copilot · investigation ===");
console.log("invoices scanned   " + r.count);
console.log("hygiene            " + (r.ok ? "CLEAN" : "ISSUES"));
console.log("issue count        " + r.issues.length);
console.log("");
console.log("issues");
if (!r.issues.length) console.log("  (none)");
for (const i of r.issues) {
  const extra = i.expect != null ? "  expect~" + i.expect : "";
  console.log("  FAIL  " + String(i.id).padEnd(10) + "  " + i.code + extra);
}
console.log("");
const by = {};
for (const i of r.issues) by[i.code] = (by[i.code] || 0) + 1;
console.log("by code            " + Object.entries(by).map(([k, v]) => k + "=" + v).join(" · "));
console.log("signal  bad GSTIN / tax math is cheaper to catch before filing week");
console.log("discipline  invoice hygiene offline — before the CA fire drill");
