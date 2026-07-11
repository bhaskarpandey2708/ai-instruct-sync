# eval-harness (P08) — Demo

Lightweight eval harness for prompt/agent regression tests in CI for product teams

## Run

```bash
cd eval-harness
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

YAML cases, multi-provider run, score thresholds, GitHub Action

## Platforms

CLI,API,Web

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
