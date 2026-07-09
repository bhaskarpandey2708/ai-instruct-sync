# Contributing to instruct-sync

Thanks for helping improve **instruct-sync** — the CLI that keeps AI coding rules in sync across agents.

## Development

```bash
git clone https://github.com/bhaskarpandey2708/ai-instruct-sync.git
cd ai-instruct-sync/instruct-sync
npm install
npm run build
npm test
```

## Adding a new agent

Edit `instruct-sync/src/clients.ts`:

1. Add an entry in `getAgents()`
2. Ensure parse/render works for that format (dir vs flat)
3. Add a test if you can

Keep **zero runtime dependencies**.

## Code style

- Strict TypeScript  
- Small, testable functions  
- Safety first (dry-run default, backups on write)

## Releasing

From `instruct-sync/`:

```bash
npm run build && npm test
npm version prerelease --preid beta   # or patch/minor
npm publish --access public --tag beta
```

## Other packages in this repo

Secondary tools (e.g. `ai-setup-doctor/`) follow the same contribute-via-PR flow. The flagship product is **instruct-sync**.
