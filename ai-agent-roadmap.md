# AI Agent Tooling — Research & Idea Based 90-Day Plan

**Goal:** Build high-signal, low-risk OSS tools for the *broad AI agent and coding ecosystem* (not Claude-only). Use this to gain real usage, contributors, and industry recognition. Optionally use metrics for programs like Claude for OSS as a side benefit.

This folder is based on research into general AI pains (MCP config drift, rules/instructions fragmentation across Cursor, Windsurf, Copilot, Aider, Gemini, etc.).

**Primary Project here:** instruct-sync — the AI-broad rules and instructions sync tool.

**Why this wins:** Extremely high signal. Every AI coding user (regardless of model) feels the pain of maintaining separate rule files. Low risk (small CLI). Strong flywheel via npx.

## Key Research Insights (non-Claude)

- MCP is multi-vendor (used in Cursor, Windsurf, VS Code, etc.).
- The bigger daily pain for many is **rules/instructions/context drift** across tools, not just MCP servers.
- Existing solutions are fragmented (rulesync, converters, personal scripts). Room for a safe, status/diff/sync UX like mcp-sync but for instructions.
- Opportunity for tools that work for *any* AI coding agent.

## 90-Day Plan (Broad AI track)

### Weeks 1-3: Ship instruct-sync v0.1
- Core: detect, normalize, sync rules across major agents (Cursor, Windsurf, Copilot, Aider, Gemini, etc.).
- Safety features (backups to ~/.instruct-sync/backups/, dry-run, merge by default).
- High-level design mirroring proven patterns: canonical Rule model, agent adapters, planSync/diffAll/apply.
- npm publish.
- Demo GIF.

Commands (modeled on successful patterns):
- instruct-sync status
- instruct-sync diff
- instruct-sync sync --from cursor [--dry-run] [--replace] [--prune]
- instruct-sync validate
- instruct-sync list
- instruct-sync clients

### Weeks 3-8: Launch & Traction
- Posts in r/cursor, r/AI_Agents, r/LocalLLaMA, Hacker News (Show HN), X, dev.to.
- Target general AI dev audience.
- Add requested agents from feedback.
- Submit to directories.

### Weeks 8-12: Depth + Visibility
- Add features like validation/linting for rules (token bloat, quality).
- Excellent support for directory-based + frontmatter rules.
- Focus on reliability and team use cases.
- Build name recognition in AI tooling.

Differentiation:
- Safe sync + visibility + merge (not just generate from master).
- Preserves unrelated content.
- npx cold start, zero/low deps.

## Success Metrics

- Real npm downloads from diverse AI users (Cursor, Windsurf, etc.).
- Stars and contributors.
- Mentions in general AI communities.

Build this into real, usable tooling for the AI community.

The direction is solid — high signal, focused, low risk, AI-broad. Let's build it.
