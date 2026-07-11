/** P18 clinic-admin-lite — offline MVP core (zero deps) */
export function main(input) {
  let L = createLedger();
  for (const p of input.patients || []) L = addPatient(L, p);
  for (const a of input.appts || []) L = addAppt(L, a);
  if (input.charge) charge(L, input.charge.patientId, input.charge.amount);
  return L;
}
export function createLedger() { return { patients: {}, appts: [] }; }
export function addPatient(ledger, p) {
  ledger.patients[p.id] = { ...p, balance: p.balance || 0 };
  return ledger;
}
export function addAppt(ledger, a) {
  if (!ledger.patients[a.patientId]) throw new Error("unknown patient");
  ledger.appts.push(a);
  return ledger;
}
export function charge(ledger, patientId, amount) {
  ledger.patients[patientId].balance += amount;
  return ledger.patients[patientId].balance;
}
