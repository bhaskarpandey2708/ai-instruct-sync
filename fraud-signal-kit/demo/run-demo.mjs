#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== fraud-signal-kit · investigation ===");
console.log("email           " + r.email.email);
console.log("email band      " + String(r.email.band).toUpperCase() + "  (" + r.email.score + ")");
console.log("velocity band   " + String(r.velocity.band).toUpperCase() + "  (" + r.velocity.score + ")");
console.log("events/window   " + r.velocity.count);
console.log("composite       " + String(r.band).toUpperCase() + "  score=" + r.score);
console.log("");
console.log("signals");
console.log("  email     disposable/pattern risk → " + r.email.score);
console.log("  velocity  burst actions in 60s     → " + r.velocity.score);
console.log("  blend     0.6·email + 0.4·velocity → " + r.score);
console.log("");
if (r.band === "high") {
  console.log("signal  step-up auth / hold payout — composite HIGH");
} else if (r.band === "medium") {
  console.log("signal  review queue — composite MEDIUM");
} else {
  console.log("signal  allow with monitoring");
}
console.log("discipline  compose cheap signals before heavy ML");
