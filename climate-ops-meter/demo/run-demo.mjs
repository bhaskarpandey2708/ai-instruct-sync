#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== climate-ops-meter · investigation ===");
console.log("activities         " + (r.lines?.length || 0));
console.log("total              " + r.totalKgCO2e + " kgCO2e  (" + r.totalTCO2e + " t)");
console.log("");
console.log("lines");
for (const L of r.lines || []) {
  console.log(
    "  " +
      String(L.type).padEnd(16) +
      "  amt=" +
      String(L.amount).padStart(6) +
      "  → " +
      L.kgCO2e +
      " kg",
  );
}
console.log("");
const top = [...(r.lines || [])].sort((a, b) => b.kgCO2e - a.kgCO2e)[0];
if (top) console.log("hotspot            " + top.type + " @ " + top.kgCO2e + " kg");
console.log("signal  you can’t cut what you never measured");
console.log("discipline  factor × amount → kgCO2e rollup");
