#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== api-contract-sentinel · investigation ===");
console.log("breaking changes   " + r.breaks.length);
console.log("additive warns     " + r.warns.length);
console.log("contract gate      " + (r.ok ? "PASS" : "FAIL"));
console.log("");
console.log("breaks");
if (!r.breaks.length) console.log("  (none)");
for (const b of r.breaks) {
  const detail = [b.method, b.prop].filter(Boolean).join(" ");
  console.log("  BREAK  " + b.type.padEnd(22) + "  " + (b.path || "") + (detail ? "  " + detail : ""));
}
console.log("");
console.log("warns");
if (!r.warns.length) console.log("  (none)");
for (const w of r.warns) {
  console.log("  WARN   " + w.type.padEnd(22) + "  " + (w.path || ""));
}
console.log("");
console.log("signal  consumers break on required fields and removed methods");
console.log("discipline  diff OpenAPI-ish contracts in CI — before the mobile app pages");
