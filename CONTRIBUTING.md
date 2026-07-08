# Contributing to ai-agent-tools

Thanks for helping build practical AI agent tooling!

## Development

1. Clone the repo
2. cd instruct-sync
3. npm install
4. npm run build
5. npm test

## Adding a new agent

Edit `src/clients.ts`:
- Add to getAgents()
- Update parseRules and render if needed for the format
- Add test case

Keep zero runtime dependencies.

## Code style

- Strict TS
- Clear, testable functions
- Safety first (backups for writes)

## Releasing

- Bump version
- npm publish from instruct-sync
