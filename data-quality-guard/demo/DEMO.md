# data-quality-guard (P21) — Demo

Pipeline data quality checks as code with anomaly alerts for analytics teams

## Run

```bash
cd data-quality-guard
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

SQL expectation YAML + dbt/Airflow hooks + Slack

## Platforms

CLI,API,Web

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
