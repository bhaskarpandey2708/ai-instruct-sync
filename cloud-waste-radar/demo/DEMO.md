# cloud-waste-radar (P11) — Demo

Find idle cloud resources and rightsizing opportunities for AWS/GCP/Azure startups

## Run

```bash
cd cloud-waste-radar
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

AWS read-only connector + idle resource report + Slack digest

## Platforms

Web,CLI,API

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
