#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const L = main(input);

console.log("=== clinic-admin-lite · investigation ===");
const patients = Object.values(L.patients || {});
console.log("patients           " + patients.length);
console.log("appointments       " + (L.appts?.length || 0));
console.log("");
console.log("patients / balance");
for (const p of patients) {
  console.log("  " + String(p.id).padEnd(10) + "  " + String(p.name || "").padEnd(12) + "  bal=₹" + (p.balance ?? 0));
}
console.log("");
console.log("appointments");
for (const a of L.appts || []) {
  console.log("  " + a.id + "  patient=" + a.patientId + "  " + (a.service || "") + "  @" + a.at);
}
console.log("");
const charged = input.charge;
if (charged) {
  console.log("charge             +₹" + charged.amount + " → " + charged.patientId + "  (" + (charged.note || "fee") + ")");
}
const arrears = patients.filter((p) => (p.balance || 0) > 0);
console.log("signal  " + arrears.length + " patient(s) with open balance");
console.log("discipline  patients · appts · charges in one local ledger");
