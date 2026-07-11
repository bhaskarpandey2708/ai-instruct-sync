#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log("=== DEMO P18 clinic-admin-lite ===");
console.log("Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for small practices");
const r = spawnSync(process.execPath, [path.join(root, "src/cli.js"), "--json", path.join(root, "fixtures/sample.json")], {
  encoding: "utf8",
});
console.log(r.stdout || r.stderr);
process.exit(r.status ?? 0);
