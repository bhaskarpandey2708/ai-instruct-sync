#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== creator-ops · investigation ===");
console.log("deals              " + r.pipeline.dealCount);
console.log("pipeline value     $" + r.pipeline.pipelineValue);
console.log("calendar conflicts " + r.conflicts.length);
console.log("");
console.log("by stage");
for (const [stage, n] of Object.entries(r.pipeline.byStage || {})) {
  console.log("  " + stage.padEnd(12) + "  " + n);
}
console.log("");
console.log("conflicts");
if (!r.conflicts.length) console.log("  (none)");
for (const pair of r.conflicts) {
  console.log("  CLASH  " + pair[0] + " ↔ " + pair[1]);
}
console.log("signal  double-booked shoots kill brand trust and cash");
console.log("discipline  pipeline value + calendar conflicts in one pass");
