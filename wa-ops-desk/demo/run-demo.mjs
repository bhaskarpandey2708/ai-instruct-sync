#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main, routeMessage } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const staff = input.staff || [];

console.log("=== wa-ops-desk · investigation ===");
console.log("inbox messages     " + (input.inbox?.length || 1));
console.log("staff on desk      " + staff.length);
console.log("");
console.log("routing");
const rows = input.inbox || [{ text: input.message?.text, id: "m0", from: "?" }];
for (const m of rows) {
  const r = routeMessage(m, staff);
  const who = r.assignee || "(unassigned)";
  const auto = r.autoReply ? " · auto-FAQ" : "";
  console.log("  " + String(m.id || "?").padEnd(4) + " → " + r.label.padEnd(8) + "  @" + who + auto);
  console.log("       \"" + String(m.text || "").slice(0, 48) + "\"");
}
console.log("");
const sample = main(input);
console.log("focus message      label=" + sample.label + "  assignee=" + sample.assignee);
console.log("signal  WhatsApp chaos is a routing problem — not more headcount first");
console.log("discipline  label · least-load staff · FAQ auto when safe");
