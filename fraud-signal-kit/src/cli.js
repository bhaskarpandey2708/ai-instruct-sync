#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as core from "./core.js";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`fraud-signal-kit (P10) — Composable fraud signal APIs (device, velocity, email risk) for Indian fintech and marketplaces

Usage:
  fraud-signal-kit [--json] [fixture.json]
  fraud-signal-kit --help

Offline MVP core for OSS shipping; commercial layers later.
`);
  process.exit(0);
}
const json = args.includes("--json");
const file = args.find((a) => !a.startsWith("-"));
let input = {};
if (file && existsSync(file)) input = JSON.parse(readFileSync(resolve(file), "utf8"));
else if (existsSync(new URL("../fixtures/sample.json", import.meta.url))) {
  input = JSON.parse(readFileSync(new URL("../fixtures/sample.json", import.meta.url), "utf8"));
}
const result = typeof core.main === "function" ? core.main(input) : { ok: true };
if (json) console.log(JSON.stringify({ product: "fraud-signal-kit", id: "P10", result }, null, 2));
else {
  console.log("fraud-signal-kit · P10");
  console.log(JSON.stringify(result, null, 2));
}
