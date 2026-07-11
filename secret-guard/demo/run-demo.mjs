#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "dist/cli.js");

console.log("=== DEMO P04 secret-guard ===");
console.log("Stop secrets leaking into AI rules / MCP env\n");

for (const fx of ["clean", "leaky-rules", "mcp-hardcoded", "env-example"]) {
  console.log(`--- fixture: ${fx} ---`);
  const r = spawnSync(process.execPath, [cli, "--cwd", path.join(root, "fixtures", fx), "--quiet"], {
    encoding: "utf8",
  });
  console.log(r.stdout || r.stderr);
  console.log(`exit ${r.status}\n`);
}
