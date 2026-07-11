#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as core from "./core.js";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`gst-ops-copilot (P16) — GST filing prep copilot: invoice hygiene, GSTR mismatch alerts, CA handoff packs

Usage:
  gst-ops-copilot [--json] [fixture.json]
  gst-ops-copilot --help

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
if (json) console.log(JSON.stringify({ product: "gst-ops-copilot", id: "P16", result }, null, 2));
else {
  console.log("gst-ops-copilot · P16");
  console.log(JSON.stringify(result, null, 2));
}
