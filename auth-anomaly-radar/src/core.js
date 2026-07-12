/** P09 auth-anomaly-radar — offline MVP core (zero deps) */
export function main(input) {
  return scoreLoginSequence((Array.isArray(input.events) ? input.events : Array.isArray(input) ? input : []));
}
export function haversineKm(a, b) {
  const R = 6371, toR = (d) => d * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const x = Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function scoreLoginSequence(events) {
  const sorted = [...(Array.isArray(events) ? events : [])].sort((a,b) => a.ts - b.ts);
  const flags = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i-1], cur = sorted[i];
    const hours = (cur.ts - prev.ts) / 3600000;
    if (prev.geo && cur.geo && hours > 0) {
      const km = haversineKm(prev.geo, cur.geo);
      const speed = km / hours;
      if (speed > 800) flags.push({ type: "impossible_travel", km: Math.round(km), speed: Math.round(speed), user: cur.user });
    }
    if (cur.failures >= 10) flags.push({ type: "credential_stuffing", user: cur.user, failures: cur.failures });
  }
  return { flags, risk: flags.length === 0 ? "low" : flags.some(f => f.type === "impossible_travel") ? "high" : "medium" };
}
