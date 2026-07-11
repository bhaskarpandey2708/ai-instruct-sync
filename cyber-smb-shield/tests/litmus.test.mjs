import { test } from "node:test";
import assert from "node:assert/strict";

import { securityScore, phishingClickRate } from "../src/core.js";
test("score bands", () => {
  assert.equal(securityScore({ mfa: true, backups: true, dnsFilter: true, phishingTrain: true, patching: true }).score, 100);
  assert.equal(phishingClickRate(100, 25).risk, "high");
});

