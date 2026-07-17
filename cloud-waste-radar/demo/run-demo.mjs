#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== cloud-waste-radar · investigation ===");
console.log("resources scanned  " + (input.inventory?.length || 0));
console.log("waste findings     " + r.count);
console.log("monthly savings    $" + r.monthlySavingsUsd);
console.log("");
console.log("findings");
for (const f of r.findings) {
  console.log("  $" + String(f.monthlyUsd).padStart(6) + "/mo  " + f.kind.padEnd(16) + "  " + f.id);
}
console.log("");
const kinds = [...new Set(r.findings.map((f) => f.kind))];
console.log("classes            " + kinds.join(" · "));
console.log("signal  idle bill is a product of unowned resources");
console.log("discipline  score inventory for waste before the CFOspreadsheet");
