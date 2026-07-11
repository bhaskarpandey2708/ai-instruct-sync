import { test } from "node:test";
import assert from "node:assert/strict";

import { scoreLoginSequence, haversineKm } from "../src/core.js";
test("impossible travel NYC to Tokyo", () => {
  const r = scoreLoginSequence([
    { user: "a", ts: 0, geo: { lat: 40.7, lon: -74 }, failures: 0 },
    { user: "a", ts: 2*3600000, geo: { lat: 35.6, lon: 139.7 }, failures: 0 },
  ]);
  assert.ok(r.flags.some(f => f.type === "impossible_travel"));
  assert.equal(r.risk, "high");
});
test("haversine positive", () => {
  assert.ok(haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 1 }) > 100);
});

