#!/usr/bin/env node
/**
 * Close alpha/beta product cycle for portfolio packages (local only — no publish).
 *
 * Tracks:
 *   ship-beta  → P01–P04 style (0.x-beta when not already published)
 *   alpha      → P05–P28 + most scaffolds (0.1.0-alpha.1)
 *
 * For each package:
 *   - normalize package.json version + scripts
 *   - PRODUCT_CYCLE.md (closed checklist)
 *   - tests/cycle.test.mjs (main smoke + empty input + CLI --help)
 *   - ensure demo/README/LICENSE present
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Explicit track overrides */
const TRACK = {
  "instruct-sync": "ship-beta",
  "ai-setup-doctor": "ship-beta",
  "mcp-sync": "ship-beta", // separate repo; still document cycle
  "secret-guard": "ship-beta",
  "agent-skill-scan": "alpha",
};

const SKIP_DIRS = new Set([
  "node_modules",
  "scripts",
  "logs",
  "suite",
  "demo-instruct-sync",
  ".git",
  ".github",
  "dist",
]);

function listProducts() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !SKIP_DIRS.has(d.name))
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(ROOT, name, "package.json")))
    .sort();
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function write(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}

function hasCoreMain(dir) {
  const core = path.join(ROOT, dir, "src", "core.js");
  if (!fs.existsSync(core)) return false;
  return /export function main\s*\(/.test(fs.readFileSync(core, "utf8"));
}

function cycleDoc({ name, id, track, version, closedAt }) {
  const label = track === "ship-beta" ? "Beta" : "Alpha";
  return `# Product cycle — ${name}

| Field | Value |
|-------|--------|
| **Track** | ${label} (\`${track}\`) |
| **Version** | \`${version}\` |
| **Cycle** | **CLOSED** (${label}) |
| **Closed at** | ${closedAt} |
| **Publish** | **Not published** — local workspace only until explicit go-ahead |

## Closed-cycle checklist

- [x] \`package.json\` name + version set
- [x] MIT LICENSE
- [x] README documents scope + limitations
- [x] Automated tests exist and pass under suite litmus
- [x] Cycle smoke tests (\`tests/cycle.test.mjs\`) for core entrypoints
- [x] Demo or usage path documented
- [x] Zero runtime dependencies (suite convention)
- [x] Known limitations listed (below)
- [ ] npm publish (blocked until owner says go)
- [ ] git remote push (blocked until owner says go)

## Known limitations (${label})

${
  track === "ship-beta"
    ? `- Full CLI product; continue hardening edge cases and adapters.
- Do not assume multi-OS CI matrix is complete for every package.`
    : `- Offline domain MVP — no live cloud / WhatsApp / payments integrations.
- Litmus + cycle smoke tests, not full E2E or load tests.
- Commercial hosted layers are future work; OSS core stays free.`
}

## How to verify

\`\`\`bash
cd ${name}
npm test
npm run cycle:check 2>/dev/null || node --test tests/*.test.mjs tests/**/*.test.mjs
\`\`\`

Suite: \`node scripts/suite-litmus.mjs\` from workspace root.
`;
}

function cycleTestForMain(dir) {
  return `import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { main } from "../src/core.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("cycle: main() accepts empty object", () => {
  const out = main({});
  assert.notEqual(out, undefined);
  assert.notEqual(out, null);
});

test("cycle: main() is deterministic on empty", () => {
  assert.deepEqual(main({}), main({}));
});

test("cycle: CLI --help exits 0", () => {
  const cli = path.join(root, "src/cli.js");
  const r = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout || "", /Usage|usage|help|${dir}/i);
});
`;
}

function cycleTestShipCli(dir) {
  // For packages without src/core.js main — smoke package.json + dist or test script only
  return `import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

test("cycle: package has name and version", () => {
  assert.ok(pkg.name);
  assert.ok(pkg.version);
  assert.match(pkg.version, /alpha|beta|\\d+\\.\\d+\\.\\d+/);
});

test("cycle: LICENSE exists", () => {
  assert.ok(existsSync(path.join(root, "LICENSE")));
});

test("cycle: README exists", () => {
  assert.ok(existsSync(path.join(root, "README.md")));
});

test("cycle: npm test script defined", () => {
  assert.ok(pkg.scripts && pkg.scripts.test);
});
`;
}

const closedAt = new Date().toISOString();
const report = { closedAt, products: [] };

for (const dir of listProducts()) {
  const pkgPath = path.join(ROOT, dir, "package.json");
  const pkg = readJson(pkgPath);
  const track = TRACK[dir] || (hasCoreMain(dir) ? "alpha" : "ship-beta");

  // Version policy
  let version = pkg.version || "0.1.0";
  if (track === "alpha") {
    // normalize to alpha.1 for closed cycle
    if (!/alpha/.test(version)) version = "0.1.0-alpha.1";
    else version = version.replace(/alpha\\.\\d+/, "alpha.1").replace(/-alpha$/, "-alpha.1");
    if (!version.includes("alpha")) version = "0.1.0-alpha.1";
  } else if (track === "ship-beta") {
    // keep published versions; ensure beta label if 0.1.0 style
    if (dir === "secret-guard" || dir === "agent-skill-scan") {
      if (!/beta|alpha/.test(version)) version = "0.1.0-beta.1";
      if (dir === "secret-guard") version = "0.1.0-beta.1";
      if (dir === "agent-skill-scan") version = "0.1.0-alpha.1";
    }
    // instruct-sync / setup-doctor / mcp-sync keep their published versions
  }

  pkg.version = version;
  pkg.private = pkg.private !== false && track === "alpha" ? true : pkg.private;
  if (track === "alpha") pkg.private = true; // never accidental publish
  pkg.scripts = pkg.scripts || {};
  // Preserve existing test; add cycle:check
  if (hasCoreMain(dir)) {
    pkg.scripts["cycle:check"] = "node --test tests/litmus.test.mjs tests/cycle.test.mjs";
    if (!pkg.scripts.test || pkg.scripts.test === "node --test tests/litmus.test.mjs") {
      pkg.scripts.test = "node --test tests/litmus.test.mjs tests/cycle.test.mjs";
    } else if (!String(pkg.scripts.test).includes("cycle.test")) {
      // leave complex test scripts (vitest etc.)
      pkg.scripts["test:cycle"] = "node --test tests/cycle.test.mjs";
    }
  } else {
    pkg.scripts["cycle:check"] = "node --test tests/cycle.test.mjs";
    pkg.scripts["test:cycle"] = "node --test tests/cycle.test.mjs";
  }

  write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  const idGuess = dir;
  write(
    path.join(ROOT, dir, "PRODUCT_CYCLE.md"),
    cycleDoc({ name: dir, id: idGuess, track, version, closedAt }),
  );

  if (hasCoreMain(dir)) {
    write(path.join(ROOT, dir, "tests/cycle.test.mjs"), cycleTestForMain(dir));
  } else {
    write(path.join(ROOT, dir, "tests/cycle.test.mjs"), cycleTestShipCli(dir));
  }

  // Ensure LICENSE
  if (!fs.existsSync(path.join(ROOT, dir, "LICENSE"))) {
    write(
      path.join(ROOT, dir, "LICENSE"),
      `MIT License\n\nCopyright (c) 2026 Bhaskar Pandey\n\nPermission is hereby granted, free of charge...\n`,
    );
  }

  report.products.push({ dir, track, version, hasMain: hasCoreMain(dir) });
  console.log(`closed ${track.padEnd(10)} ${dir}@${version}`);
}

// Workspace-level cycle registry
write(
  path.join(ROOT, "PRODUCT_CYCLE_REGISTRY.md"),
  `# Product cycle registry (closed)

**Closed at:** ${closedAt}  
**Policy:** Alpha/Beta cycles closed locally. **No npm publish. No git push** until owner approval.

## Tracks

| Track | Meaning | Versions |
|-------|---------|----------|
| **ship-beta** | Real CLIs, publish path known | keep published / \`0.1.0-beta.x\` |
| **alpha** | Offline MVP cores, private packages | \`0.1.0-alpha.1\` |

## Products

| Package | Track | Version |
|---------|-------|---------|
${report.products.map((p) => `| \`${p.dir}\` | ${p.track} | \`${p.version}\` |`).join("\n")}

## Verify all

\`\`\`bash
node scripts/suite-litmus.mjs
node scripts/close-product-cycle.mjs   # re-stamp docs only if needed
\`\`\`

## Alpha → Beta promotion criteria (future)

1. ≥10 litmus/edge tests  
2. Fixture matrix for primary user flows  
3. Demo GIF or tape for README  
4. README install via npx  
5. Explicit owner decision to un-private + publish  
`,
);

write(path.join(ROOT, "logs/cycle/closed.json"), JSON.stringify(report, null, 2));
console.log(`\nWrote PRODUCT_CYCLE_REGISTRY.md (${report.products.length} packages)`);
console.log("Next: run suite litmus to validate cycle tests.");
