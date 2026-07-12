# Demo — cyber-smb-shield

**Package:** `@bhaskarauthor/cyber-smb-shield`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P20 cyber-smb-shield ===
Managed cybersecurity starter pack for SMBs: DNS filter, phishing drills, backup check, score
{
  "product": "cyber-smb-shield",
  "id": "P20",
  "result": {
    "score": {
      "score": 25,
      "band": "weak",
      "max": 100
    },
    "phishing": {
      "rate": 0.05,
      "pct": 5,
      "risk": "low"
    }
  }
}
```

## Try it

```bash
npx @bhaskarauthor/cyber-smb-shield@0.1.0-alpha.1 --help
# or from monorepo:
cd cyber-smb-shield && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
