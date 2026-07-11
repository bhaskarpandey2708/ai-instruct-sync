import { test } from "node:test";
import assert from "node:assert/strict";

import { findSlots, book } from "../src/core.js";
test("finds free slots", () => {
  const start = Date.parse("2026-07-11T09:00:00Z");
  const end = Date.parse("2026-07-11T11:00:00Z");
  const busy = [{ start: Date.parse("2026-07-11T09:30:00Z"), end: Date.parse("2026-07-11T10:00:00Z") }];
  const slots = findSlots(start, end, busy, 30);
  assert.ok(slots.length >= 3);
  assert.equal(book(slots, start).ok, true);
});

