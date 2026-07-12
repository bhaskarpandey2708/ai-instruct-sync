# Demo — mcp-sync

**Package:** `mcp-config-sync`  
**Version:** `0.2.0`  
**Command:** `node dist/cli.js --help`  
**Exit:** 0

## Output

```text
mcp-sync — keep MCP server configs in sync across your AI tools

Usage
  mcp-sync <command> [options]

Commands
  status                     Show detected clients and sync state (default)
  list                       List every MCP server across all clients
  diff                       Show servers that differ between clients
  sync --from <client>       Copy servers from one client to the others
  validate                   Check configs for errors and warnings
  backups                    List timestamped backups
  restore --stamp <id>       Restore configs from a backup
  clients                    List supported clients and config paths

Sync options
  --from <client>            Source of truth (required)
  --to <a,b,...>             Only sync to these clients (default: all detected)
  --dry-run                  Preview changes without writing
  --replace                  Make targets exactly match the source (needs --yes)
  --prune                    Also delete target servers missing from source (needs --yes)
  --yes, -y                  Confirm destructive --replace / --prune

Restore options
  --stamp <id>               Backup stamp to restore
  --latest                   Restore the most recent backup
  --to <a,b,...>             Only restore these clients (needs manifest)
  --dry-run                  Preview restore without writing

Global
  --json                     Machine-readable JSON output (for scripts/CI)
  --help, -h                 Show this help
  --version, -v              Print version

Examples
  npx mcp-config-sync status
  npx mcp-config-sync validate
  npx mcp-config-sync sync --from claude-desktop --dry-run
  npx mcp-config-sync sync --from cursor --to vscode,claude-code
  npx mcp-config-sync sync --from cursor --replace --yes
  npx mcp-config-sync backups
  npx mcp-config-sync restore --latest --dry-run
  npx mcp-config-sync status --json

Safety: every write is atomic, locked, and backed up under ~/.mcp-sync/backups/
```

## Try it

```bash
npx mcp-config-sync@0.2.0 --help
# or from monorepo:
cd mcp-sync && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
```
