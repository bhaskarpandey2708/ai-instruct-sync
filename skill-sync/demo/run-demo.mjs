#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = path.join(root, "fixtures/sample.json");
const input = JSON.parse(readFileSync(fixture, "utf8"));
const result = main(input);

console.log("=== skill-sync · investigation ===");
console.log("local package   " + input.name + "@" + input.version);
console.log("remote package  " + input.remote.name + "@" + input.remote.version);
console.log("");
console.log("validate        " + (result.validate.ok ? "OK" : "FAIL"));
if (!result.validate.ok) {
  for (const e of result.validate.errors) console.log("  · " + e);
}
console.log("");
if (result.plan) {
  console.log("install plan");
  console.log(
    "  added    " + (result.plan.added.length ? result.plan.added.join(", ") : "(none)"),
  );
  console.log(
    "  updated  " + (result.plan.updated.length ? result.plan.updated.join(", ") : "(none)"),
  );
  console.log("  wouldWrite  " + result.plan.wouldWrite);
  console.log("");
  if (result.plan.updated.includes("code-review")) {
    console.log("signal  code-review is STALE on this machine");
  }
  if (result.plan.added.includes("agent-safety")) {
    console.log("signal  agent-safety missing here — present on remote");
  }
}
console.log("");
console.log("discipline  treat skills like packages — not final_v3.md");
