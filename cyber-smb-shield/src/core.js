/** P20 cyber-smb-shield — offline MVP core (zero deps) */
export function main(input) {
  return {
    score: securityScore(input.answers || input || {}),
    phishing: phishingClickRate(input.sent || 100, input.clicked || 5),
  };
}
export function securityScore(answers) {
  const weights = { mfa: 25, backups: 20, dnsFilter: 15, phishingTrain: 20, patching: 20 };
  let score = 0;
  for (const [k, w] of Object.entries(weights)) if (answers[k]) score += w;
  return { score, band: score >= 80 ? "strong" : score >= 50 ? "fair" : "weak", max: 100 };
}
export function phishingClickRate(sent, clicked) {
  const rate = sent ? clicked / sent : 0;
  return { rate, pct: Math.round(rate * 100), risk: rate > 0.2 ? "high" : rate > 0.05 ? "medium" : "low" };
}
