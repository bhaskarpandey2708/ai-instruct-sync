#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== grc-evidence-autopilot · investigation ===");
console.log("controls           " + r.total);
console.log("covered            " + r.covered);
console.log("coverage           " + r.coveragePct + "%");
console.log("");
console.log("control map");
for (const c of r.controls) {
  const n = (c.artifacts || []).length;
  const mark = n > 0 ? "OK  " : "GAP ";
  console.log("  " + mark + " " + c.id.padEnd(8) + "  arts=" + n + "  " + (c.title || ""));
  if (n) console.log("           ← " + c.artifacts.join(", "));
}
console.log("");
const gaps = r.controls.filter((c) => !(c.artifacts || []).length).map((c) => c.id);
console.log("gaps               " + (gaps.join(", ") || "(none)"));
if (gaps.length) console.log("signal  auditor will ask for " + gaps.join(", ") + " — empty folder is a finding");
console.log("discipline  map artifacts to controls continuously — not week-of-audit panic");
