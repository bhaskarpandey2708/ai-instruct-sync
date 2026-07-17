#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== shadow-ai · investigation ===");
console.log("inventory tools   " + r.total);
console.log("severity         " + String(r.severity).toUpperCase());
console.log("riskScore         " + r.riskScore + "/100");
console.log("");
console.log("unauthorized (" + r.unauthorized.length + ")");
for (const t of input.tools.filter((x) => x.approved === false)) {
  const tag = t.dataClass === "confidential" ? "CONF" : "data";
  console.log("  HIGH  " + t.name);
  console.log("        " + tag + " · " + (t.path || "unknown path"));
}
console.log("");
console.log("approved");
for (const t of input.tools.filter((x) => x.approved === true)) {
  console.log("  OK    " + t.name);
}
console.log("");
console.log("signal  company context is leaving the approved surface");
console.log("discipline  inventory AI tools like assets — not browser tabs");
