#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== sc-visibility-lite · investigation ===");
console.log("suppliers          " + r.risk.count);
console.log("risk bands         low=" + r.risk.bands.low + " med=" + r.risk.bands.medium + " high=" + r.risk.bands.high);
console.log("high risk ids      " + (r.risk.highRisk.join(", ") || "(none)"));
console.log("stale check-ins    " + r.stale.length + "  (>" + (input.maxDays || 14) + "d)");
console.log("");
console.log("high risk");
for (const id of r.risk.highRisk) {
  const s = (input.suppliers || []).find((x) => x.id === id);
  console.log("  HIGH  " + id + "  " + (s?.name || "") + "  @" + (s?.region || "?"));
}
console.log("");
console.log("stale");
for (const s of r.stale) {
  console.log("  STALE " + s.id + "  " + (s.name || "") + "  last=" + (s.lastCheckin || 0));
}
console.log("signal  blind suppliers become recall headlines");
console.log("discipline  risk band + stale check-in window");
