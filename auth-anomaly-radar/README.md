# auth-anomaly-radar

> P09 · Security / Identity / Fraud

**Lightweight auth anomaly detection for SaaS (impossible travel, credential stuffing signals)**

## Status

Offline **MVP core** (v0.1.0-beta.0) — zero runtime dependencies, litmus-tested, demo-ready.
Part of the Bhaskar Pandey product portfolio under `Documents/development`.

## Quick start

```bash
cd auth-anomaly-radar
npm test
npm run demo
node src/cli.js --help
```

## MVP scope

Ingest login events → risk score → Slack/webhook

## Open source → commercial

| Layer | Now | Later |
|-------|-----|-------|
| Core algorithms / CLI | OSS MIT | remains OSS |
| Hosted / team / SSO | — | commercial |
| Support / SLAs | community | paid |

## License

MIT
