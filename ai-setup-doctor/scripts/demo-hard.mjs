#!/usr/bin/env node
/**
 * Dogfood demos: run doctor against adversarial fixtures + optional real paths.
 * Usage: node scripts/demo-hard.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "dist", "cli.js");
const fixturesRoot = join(root, "fixtures");

const fixtures = readdirSync(fixturesRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

function run(label, args) {
  console.log("\n" + "═".repeat(72));
  console.log(`▶ ${label}`);
  console.log(`  node dist/cli.js ${args.join(" ")}`);
  console.log("─".repeat(72));
  const r = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  console.log(dimExit(r.status));
  return r.status ?? 1;
}

function dimExit(code) {
  return `  ↳ exit ${code}`;
}

console.log("ai-setup-doctor — hard demo battery");
console.log(`fixtures: ${fixtures.length}`);

let failures = 0;

// Every fixture, project-only, verbose-ish
for (const name of fixtures) {
  const code = run(`fixture:${name}`, [
    "check",
    "--cwd",
    join(fixturesRoot, name),
    "--no-user",
  ]);
  // We don't assert exit codes here — demos show reality
  if (code > 1) failures++;
}

// Category slices on the worst fixture
run("only secrets (leaky-secrets)", [
  "check",
  "--cwd",
  join(fixturesRoot, "leaky-secrets"),
  "--no-user",
  "--only",
  "secrets",
  "--verbose",
]);

run("only mcp (mcp-hardcoded-env)", [
  "check",
  "--cwd",
  join(fixturesRoot, "mcp-hardcoded-env"),
  "--no-user",
  "--only",
  "mcp",
  "--json",
]);

// JSON strict on broken
const strict = run("strict mode on broken-mcp", [
  "check",
  "--cwd",
  join(fixturesRoot, "broken-mcp"),
  "--no-user",
  "--strict",
]);
if (strict === 0) {
  console.error("EXPECTED non-zero exit for broken-mcp --strict");
  failures++;
}

// Self-check on this package
run("self (ai-setup-doctor package)", ["check", "--cwd", root, "--no-user"]);

// Real sibling projects if present
const realTargets = [
  join(root, "..", "instruct-sync"),
  join(root, ".."),
];
for (const p of realTargets) {
  if (existsSync(join(p, "package.json")) || existsSync(join(p, "README.md"))) {
    run(`real:${p}`, ["check", "--cwd", p, "--no-user"]);
  }
}

console.log("\n" + "═".repeat(72));
console.log(failures ? `Demo battery done with ${failures} unexpected failures` : "Demo battery complete");
process.exit(failures ? 1 : 0);
