#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "src/cli.js");
const sample = path.join(root, "fixtures/sample.json");

console.log("=== DEMO P05 llm-spend ===");
console.log("Multi-provider LLM cost · tokens · budget (free OSS CLI)");
console.log("");

const r = spawnSync(process.execPath, [cli, sample], {
  encoding: "utf8",
  env: { ...process.env, NO_COLOR: "1" },
});
process.stdout.write(r.stdout || "");
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status ?? 0);
