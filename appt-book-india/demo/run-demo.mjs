#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(readFileSync(path.join(root, "fixtures/sample.json"), "utf8"));
const r = main(input);

function hh(ts) {
  try {
    return new Date(ts).toISOString().slice(11, 16) + "Z";
  } catch {
    return String(ts);
  }
}

console.log("=== appt-book-india · investigation ===");
console.log("clinic             " + (input.clinic || "clinic"));
console.log("slot length        " + (input.durationMin || 30) + " min");
console.log("busy blocks        " + (input.busy?.length || 0));
console.log("open slots         " + r.slots.length);
console.log("");
console.log("open (first 6)");
for (const s of r.slots.slice(0, 6)) {
  console.log("  SLOT  " + hh(s.start) + " → " + hh(s.end));
}
if (r.slots.length > 6) console.log("  … +" + (r.slots.length - 6) + " more");
console.log("");
console.log("book attempt");
if (r.book?.ok) {
  console.log("  OK    " + hh(r.book.slot.start) + " → " + hh(r.book.slot.end));
} else {
  console.log("  FAIL  no slot");
}
console.log("signal  WhatsApp 'book 3pm' needs free slots — not a spreadsheet");
console.log("discipline  compute free slots from busy · then book");
