#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main, DEFAULT_CHECKLIST } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);
const hire = input.hire || {};

console.log("=== dev-onboard-os · investigation ===");
console.log("hire               " + (hire.name || "new hire") + " · day " + (hire.day ?? "?"));
console.log("progress           " + r.done + "/" + r.total + "  (" + r.pct + "%)");
console.log("");
console.log("checklist");
for (const i of r.items) {
  const mark = i.done ? "DONE" : "TODO";
  console.log("  " + mark + "  " + i.id.padEnd(10) + "  " + i.title);
}
console.log("");
const blockers = r.items.filter((i) => !i.done).map((i) => i.id);
console.log("blockers           " + (blockers.join(", ") || "(none)"));
if (blockers.includes("secrets") || blockers.includes("agents")) {
  console.log("signal  AI/MCP setup is now part of day-one risk — not optional chrome");
}
console.log("discipline  onboard as a checklist OS — not a wiki scavenger hunt");
