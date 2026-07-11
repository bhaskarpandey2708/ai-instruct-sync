#!/usr/bin/env node
/**
 * Local scheduler: re-run suite litmus on an interval.
 * Usage: node scripts/suite-watch.mjs --interval 300
 * Default interval: 600s. Ctrl+C to stop. Never pushes remotes.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
let intervalSec = 600;
const i = args.indexOf("--interval");
if (i >= 0) intervalSec = Math.max(60, Number(args[i + 1]) || 600);
const once = args.includes("--once");

const logPath = path.join(ROOT, "logs", "litmus", "watch.log");
fs.mkdirSync(path.dirname(logPath), { recursive: true });

function log(line) {
  const row = `[${new Date().toISOString()}] ${line}`;
  console.log(row);
  fs.appendFileSync(logPath, row + "\n");
}

function run() {
  return new Promise((resolve) => {
    log("litmus start");
    const child = spawn(process.execPath, [path.join(ROOT, "scripts/suite-litmus.mjs")], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      log(`litmus exit ${code}`);
      resolve(code ?? 1);
    });
  });
}

async function loop() {
  log(`suite-watch interval=${intervalSec}s once=${once}`);
  for (;;) {
    await run();
    if (once) break;
    log(`sleep ${intervalSec}s`);
    await new Promise((r) => setTimeout(r, intervalSec * 1000));
  }
}

loop();
