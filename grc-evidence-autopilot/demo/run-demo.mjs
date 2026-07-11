#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log("=== DEMO P14 grc-evidence-autopilot ===");
console.log("Auto-collect compliance evidence (access logs, policies, screenshots) for SOC2/ISO startups");
const r = spawnSync(process.execPath, [path.join(root, "src/cli.js"), "--json", path.join(root, "fixtures/sample.json")], {
  encoding: "utf8",
});
console.log(r.stdout || r.stderr);
process.exit(r.status ?? 0);
