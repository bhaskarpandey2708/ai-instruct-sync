#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== auth-anomaly-radar · investigation ===");
console.log("events scored   " + (input.events?.length || 0));
console.log("risk            " + String(r.risk).toUpperCase());
console.log("flags           " + r.flags.length);
console.log("");
console.log("timeline");
for (const e of input.events || []) {
  const label = e.geo?.label || "unknown";
  const fail = e.failures ? " · failures=" + e.failures : "";
  console.log("  " + e.user + "  @" + label + fail);
}
console.log("");
console.log("flags");
if (!r.flags.length) console.log("  (none)");
for (const f of r.flags) {
  if (f.type === "impossible_travel") {
    console.log("  CRITICAL  impossible_travel  " + f.user);
    console.log("            ~" + f.km + " km  ·  ~" + f.speed + " km/h");
  } else if (f.type === "credential_stuffing") {
    console.log("  HIGH      credential_stuffing  " + f.user);
    console.log("            failures=" + f.failures + " in window");
  } else {
    console.log("  FLAG      " + f.type + "  " + (f.user || ""));
  }
}
console.log("");
console.log("signal  velocity + geography beats raw login volume");
console.log("discipline  score sequences — not single events in isolation");
