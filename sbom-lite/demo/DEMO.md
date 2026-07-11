# sbom-lite (P13) — Demo

Zero-friction SBOM generate, diff, and policy gate for npm/PyPI/Go in CI

## Run

```bash
cd sbom-lite
node demo/run-demo.mjs
node src/cli.js --json fixtures/sample.json
npm test
```

## MVP

One-command SBOM + PR comment + fail on license/CVE policy

## Platforms

CLI,API

## Commercial path (later)

OSS core stays free; paid layer = team dashboard / hosted / compliance export.
