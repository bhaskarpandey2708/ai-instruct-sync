#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main, sessionScore } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== focus-forge · investigation ===");
console.log("sessions           " + r.sessions);
console.log("avg focus          " + r.avgFocus + "/100");
console.log("deep sessions      " + r.deepSessions + "  (≥70)");
console.log("");
console.log("session scores");
for (const s of input.sessions || []) {
  const sc = sessionScore(s);
  const mark = sc.deep ? "DEEP" : "WEAK";
  console.log(
    "  " +
      mark +
      "  " +
      String(s.id || "").padEnd(4) +
      "  focus=" +
      String(sc.focus).padStart(3) +
      "  plan=" +
      s.plannedMin +
      "m act=" +
      s.actualMin +
      "m dist=" +
      (s.distractions || 0) +
      "  " +
      (s.label || ""),
  );
}
console.log("");
console.log("signal  activity without a score is just storytelling");
console.log("discipline  planned vs actual − distraction tax → weekly focus");
