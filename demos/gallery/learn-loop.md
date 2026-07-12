# Demo — learn-loop

**Package:** `@bhaskarauthor/learn-loop`  
**Version:** `0.1.0-alpha.1`  
**Command:** `node demo/run-demo.mjs`  
**Exit:** 0

## Output

```text
=== DEMO P19 learn-loop ===
Spaced-repetition + cohort homework OS for coaching institutes and online tutors
{
  "product": "learn-loop",
  "id": "P19",
  "result": {
    "cards": [
      {
        "id": "c1",
        "dueDay": 0,
        "reps": 1,
        "interval": 1,
        "ef": 2.5,
        "dueInDays": 1
      }
    ],
    "due": [
      {
        "id": "c1",
        "dueDay": 0,
        "reps": 1,
        "interval": 1,
        "ef": 2.5,
        "dueInDays": 1
      }
    ]
  }
}
```

## Try it

```bash
npx @bhaskarauthor/learn-loop@0.1.0-alpha.1 --help
# or from monorepo:
cd learn-loop && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
