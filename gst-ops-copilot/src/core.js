/** P16 gst-ops-copilot — offline MVP core (zero deps) */
export function main(input) {
  return invoiceHygiene(input.invoices || input || []);
}
export function invoiceHygiene(invoices) {
  const issues = [];
  for (const inv of invoices || []) {
    if (!inv.gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(inv.gstin)) {
      issues.push({ id: inv.id, code: "bad_gstin" });
    }
    if (inv.taxable == null || inv.cgst == null || inv.sgst == null) issues.push({ id: inv.id, code: "missing_tax" });
    else {
      const expect = Math.round(inv.taxable * 0.09 * 100) / 100;
      if (Math.abs(inv.cgst - expect) > 0.05 || Math.abs(inv.sgst - expect) > 0.05) {
        issues.push({ id: inv.id, code: "tax_mismatch", expect });
      }
    }
  }
  return { issues, ok: issues.length === 0, count: (invoices || []).length };
}
