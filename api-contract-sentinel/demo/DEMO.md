# api-contract-sentinel (P28) — Demo

Detect breaking API contract changes in PRs with consumer impact maps

## Run

```bash
cd api-contract-sentinel
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

OpenAPI diff in GitHub Action + break level + owners notify

## Platforms

CLI,API,Extension

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
