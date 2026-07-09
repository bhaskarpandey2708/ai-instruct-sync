# Internal / multi-project notes

This file is for **maintainers**. Public visitors should use the root [README](./README.md) (instruct-sync product page).

## Local workspace

```
~/Documents/development/     # local folder name
  instruct-sync/             # flagship product (npm: ai-instruct-sync)
  ai-setup-doctor/           # secondary tool
  ai-agent-roadmap.md        # strategy notes
```

GitHub repo name: **`ai-instruct-sync`** (product-facing).

## Adding project 3+

1. `mkdir <name>` next to `instruct-sync/`
2. Own `package.json` + README
3. Mention briefly under “Repo layout” in root README (do not demote instruct-sync)
4. Add CI job if it should ship
