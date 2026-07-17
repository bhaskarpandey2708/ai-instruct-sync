#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);
const a = input.answers || {};

console.log("=== cyber-smb-shield · investigation ===");
console.log("org                " + (input.org || "SMB"));
console.log("security score     " + r.score.score + "/" + r.score.max + "  band=" + String(r.score.band).toUpperCase());
console.log(
  "phishing           " +
    (input.clicked ?? "?") +
    "/" +
    (input.sent || "?") +
    " clicked  (" +
    r.phishing.pct +
    "%)  risk=" +
    String(r.phishing.risk).toUpperCase(),
);
console.log("");
console.log("controls");
const labels = {
  mfa: "MFA on email/admin",
  backups: "tested backups",
  dnsFilter: "DNS filtering",
  phishingTrain: "phishing training",
  patching: "patch cadence",
};
for (const [k, title] of Object.entries(labels)) {
  console.log("  " + (a[k] ? "OK  " : "GAP ") + " " + title);
}
console.log("");
console.log("signal  weak band + high click rate = train before the real phish");
console.log("discipline  score baseline controls — not hope");
