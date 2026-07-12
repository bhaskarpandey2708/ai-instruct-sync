# Product cycle registry (closed)

**Closed at:** 2026-07-12T04:12:35.713Z  
**Policy:** Alpha/Beta cycles closed locally. **No npm publish. No git push** until owner approval.

## Tracks

| Track | Meaning | Versions |
|-------|---------|----------|
| **ship-beta** | Real CLIs, publish path known | keep published / `0.1.0-beta.x` |
| **alpha** | Offline MVP cores, private packages | `0.1.0-alpha.1` |

## Products

| Package | Track | Version |
|---------|-------|---------|
| `agent-skill-scan` | alpha | `0.1.0-alpha.1` |
| `ai-setup-doctor` | ship-beta | `0.1.0-beta.0` |
| `api-contract-sentinel` | alpha | `0.1.0-alpha.1` |
| `appt-book-india` | alpha | `0.1.0-alpha.1` |
| `auth-anomaly-radar` | alpha | `0.1.0-alpha.1` |
| `care-companion` | alpha | `0.1.0-alpha.1` |
| `climate-ops-meter` | alpha | `0.1.0-alpha.1` |
| `clinic-admin-lite` | alpha | `0.1.0-alpha.1` |
| `cloud-waste-radar` | alpha | `0.1.0-alpha.1` |
| `creator-ops` | alpha | `0.1.0-alpha.1` |
| `cyber-smb-shield` | alpha | `0.1.0-alpha.1` |
| `data-quality-guard` | alpha | `0.1.0-alpha.1` |
| `dev-onboard-os` | alpha | `0.1.0-alpha.1` |
| `eval-harness` | alpha | `0.1.0-alpha.1` |
| `focus-forge` | alpha | `0.1.0-alpha.1` |
| `fraud-signal-kit` | alpha | `0.1.0-alpha.1` |
| `grc-evidence-autopilot` | alpha | `0.1.0-alpha.1` |
| `gst-ops-copilot` | alpha | `0.1.0-alpha.1` |
| `instruct-sync` | ship-beta | `0.2.0-beta.0` |
| `learn-loop` | alpha | `0.1.0-alpha.1` |
| `llm-spend` | alpha | `0.1.0-alpha.1` |
| `mcp-sync` | ship-beta | `0.2.0` |
| `personal-crm` | alpha | `0.1.0-alpha.1` |
| `sbom-lite` | alpha | `0.1.0-alpha.1` |
| `sc-visibility-lite` | alpha | `0.1.0-alpha.1` |
| `secret-guard` | ship-beta | `0.1.0-beta.1` |
| `shadow-ai` | alpha | `0.1.0-alpha.1` |
| `skill-sync` | alpha | `0.1.0-alpha.1` |
| `wa-ops-desk` | alpha | `0.1.0-alpha.1` |

## Verify all

```bash
node scripts/suite-litmus.mjs
node scripts/close-product-cycle.mjs   # re-stamp docs only if needed
```

## Alpha → Beta promotion criteria (future)

1. ≥10 litmus/edge tests  
2. Fixture matrix for primary user flows  
3. Demo GIF or tape for README  
4. README install via npx  
5. Explicit owner decision to un-private + publish  
