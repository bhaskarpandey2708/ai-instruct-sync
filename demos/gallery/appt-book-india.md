# Demo — appt-book-india

**Package:** `@bhaskarauthor/appt-book-india`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P17 appt-book-india ===
Lightweight appointment booking with WhatsApp reminders for salons, tutors, clinics lite
{
  "product": "appt-book-india",
  "id": "P17",
  "result": {
    "slots": [
      {
        "start": 1783760400000,
        "end": 1783762200000
      },
      {
        "start": 1783762200000,
        "end": 1783764000000
      },
      {
        "start": 1783764000000,
        "end": 1783765800000
      },
      {
        "start": 1783765800000,
        "end": 1783767600000
      },
      {
        "start": 1783767600000,
        "end": 1783769400000
      },
      {
        "start": 1783769400000,
        "end": 1783771200000
      },
      {
        "start": 1783771200000,
        "end": 1783773000000
      },
      {
        "start": 1783773000000,
        "end": 1783774800000
      },
      {
        "start": 1783774800000,
        "end": 1783776600000
      },
      {
        "start": 1783776600000,
        "end": 1783778400000
      },
      {
        "start": 1783778400000,
        "end": 1783780200000
      },
      {
        "start": 1783780200000,
        "end": 1783782000000
      },
      {
        "start": 1783782000000,
        "end": 1783783800000
      },
      {
        "start": 1783783800000,
        "end": 1783785600000
      },
      {
        "start": 1783785600000,
        "end": 1783787400000
      },
      {
        "start": 1783787400000,
        "end": 1783789200000
      }
    ],
    "book": {
      "ok": true,
      "slot": {
        "start": 1783760400000,
        "end": 1783762200000
      }
    }
  }
}
```

## Try it

```bash
npx @bhaskarauthor/appt-book-india@0.1.0-alpha.1 --help
# or from monorepo:
cd appt-book-india && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
