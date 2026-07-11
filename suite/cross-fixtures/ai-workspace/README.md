# Cross-functional litmus workspace

Shared dataset used by multiple suite tools:

| Tool | Expected signal |
|------|-----------------|
| secret-guard | finds keys in `.cursor/rules` + hardcoded MCP env |
| ai-setup-doctor | secrets + mcp categories warn/error |
| mcp-sync | detects clients when configs present |
| instruct-sync | sees CLAUDE.md / AGENTS.md |

Regenerate nothing — static fixtures for CI-style offline checks.
