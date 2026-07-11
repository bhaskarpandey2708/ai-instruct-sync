# auth-anomaly-radar (P09) — Demo

Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)

## Run

```bash
cd auth-anomaly-radar
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

Ingest login events → risk score → Slack/webhook

## Platforms

API,Web

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
