---
name: cli-ship
description: >
  Senior release engineering for npm + GitHub CLIs (20+ years bar). Version
  bumps, publish, git push, package files hygiene. Use for npm publish, release,
  /cli-ship, "ship it", "update npm and github".
---

# CLI ship — release engineer / 20+ year bar

Releases are irreversible enough to treat with respect. **Test → version → tag/commit → publish → verify.**

## Standing monorepo rules

- Default: no push / no publish until owner asks
- When owner asks: do it carefully, report URLs/versions
- `mcp-sync` has its **own** remote — don’t assume monorepo publish covers it

## Pre-flight

1. `npm test` (and demo if user-facing)
2. Diff vs last published version — is bump needed?
3. `package.json` name, bin, files, license, engines
4. `.npmignore` / `files` exclude scratch, huge wav, node_modules
5. README try-command matches real bin

## Version policy

| Change | Bump (alpha) |
|--------|----------------|
| Code/behavior | patch/alpha.N+1 minimum |
| Docs/social only | no npm bump required |
| Breaking CLI flags | minor or clear notes |

npm **cannot** replace same version — always bump after publish.

## Publish

```bash
cd <product>
npm test
npm publish --access public
npm view <name> version
```

## GitHub

- Conventional commits; complete sentences in body
- Don’t force-push `main`
- Large demos OK if already repo convention; ignore render scratch

## Post-flight

- [ ] `npm view` shows new version
- [ ] `npx <pkg>@version --help` works (or documented offline path)
- [ ] Social pack version strings updated if they pin versions
