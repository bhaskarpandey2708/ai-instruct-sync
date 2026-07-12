# Demo — clinic-admin-lite

**Package:** `@bhaskarauthor/clinic-admin-lite`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P18 clinic-admin-lite ===
Clinic admin lite: appointments, patient ledger, Rx print, WhatsApp follow-ups for small practices
{
  "product": "clinic-admin-lite",
  "id": "P18",
  "result": {
    "patients": {
      "p1": {
        "id": "p1",
        "name": "Asha",
        "balance": 500
      }
    },
    "appts": [
      {
        "id": "a1",
        "patientId": "p1",
        "at": 1
      }
    ]
  }
}
```

## Try it

```bash
npx @bhaskarauthor/clinic-admin-lite@0.1.0-alpha.1 --help
# or from monorepo:
cd clinic-admin-lite && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
