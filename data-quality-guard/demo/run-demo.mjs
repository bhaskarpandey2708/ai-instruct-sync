#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

console.log("=== data-quality-guard · investigation ===");
console.log("rows               " + (input.rows?.length || 0));
console.log("expectations       " + (input.expectations?.length || 0));
console.log("suite              " + (r.ok ? "GREEN" : "RED"));
console.log("");
console.log("results");
for (const x of r.results || []) {
  const mark = x.pass ? "PASS" : "FAIL";
  console.log("  " + mark + "  " + String(x.id).padEnd(16) + "  bad=" + x.bad);
}
console.log("");
if (!r.ok) console.log("signal  bad rows should fail the pipeline — not a Friday dashboard");
else console.log("signal  expectations held");
console.log("discipline  not_null · unique · range — gate before load");
