/** P15 wa-ops-desk — offline MVP core (zero deps) */
export function main(input) {
  return routeMessage(input.message || input, (Array.isArray(input.staff) ? input.staff : []));
}
export function routeMessage(msg, staff) {
  const text = String(msg.text || "").toLowerCase();
  let label = "general";
  if (/order|invoice|payment|refund/.test(text)) label = "orders";
  else if (/book|appoint|slot/.test(text)) label = "booking";
  else if (/help|faq|how/.test(text)) label = "faq";
  const pool = (staff || []).filter((s) => (s.labels || []).includes(label) || (s.labels || []).includes("general"));
  const assignee = pool.sort((a, b) => (a.load || 0) - (b.load || 0))[0] || null;
  return { label, assignee: assignee ? assignee.id : null, autoReply: label === "faq" ? "Please see our FAQ: https://example.com/faq" : null };
}
