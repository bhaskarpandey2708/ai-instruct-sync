#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== learn-loop · investigation ===");
console.log("day                " + (input.day ?? 0));
console.log("review quality     " + (input.quality ?? 4) + "/5");
console.log("cards total        " + (r.cards?.length || 0));
console.log("due today          " + (r.due?.length || 0));
console.log("");
console.log("due queue");
for (const c of r.due || []) {
  console.log("  DUE   " + String(c.id).padEnd(12) + "  ef=" + (c.ef?.toFixed?.(2) ?? c.ef) + "  nextIn=" + c.dueInDays + "d");
}
console.log("");
console.log("after review (SM-2-ish)");
for (const c of r.cards || []) {
  console.log(
    "  " +
      String(c.id).padEnd(12) +
      "  reps=" +
      c.reps +
      "  interval=" +
      c.interval +
      "d  ef=" +
      (typeof c.ef === "number" ? c.ef.toFixed(2) : c.ef),
  );
}
console.log("signal  spaced repetition beats binge re-reading");
console.log("discipline  schedule the next review — don’t hoard cards");
