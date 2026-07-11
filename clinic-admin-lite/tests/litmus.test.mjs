import { test } from "node:test";
import assert from "node:assert/strict";

import { createLedger, addPatient, addAppt, charge } from "../src/core.js";
test("patient appt charge", () => {
  let L = createLedger();
  L = addPatient(L, { id: "p1", name: "Asha" });
  L = addAppt(L, { id: "a1", patientId: "p1", at: 1 });
  assert.equal(charge(L, "p1", 500), 500);
  assert.equal(L.appts.length, 1);
});

