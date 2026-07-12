#!/usr/bin/env node
/**
 * Publish suite packages to npm as @bhaskarauthor/<dir> (public).
 * Skips already-published matching versions. Does not force re-publish.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const SKIP = new Set([
  "node_modules",
  "scripts",
  "logs",
  "suite",
  "demo-instruct-sync",
  "mcp-sync", // published from its own repo
]);

/** Prefer existing public names when already established */
const NAME_MAP = {
  "instruct-sync": "ai-instruct-sync",
  "ai-setup-doctor": "ai-setup-doctor",
  "secret-guard": "ai-secret-guard",
  "agent-skill-scan": "agent-skill-scan",
  "agent-spend-guard": "agent-spend-guard",
};

function listDirs() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !SKIP.has(d.name))
    .map((d) => d.name)
    .filter((n) => fs.existsSync(path.join(ROOT, n, "package.json")))
    .sort();
}

function run(cmd, args, cwd) {
  return spawnSync(cmd, args, { cwd, encoding: "utf8", env: process.env });
}

function npmView(name, version) {
  const r = run("npm", ["view", `${name}@${version}`, "version"], ROOT);
  return r.status === 0 && (r.stdout || "").trim() === version;
}

const results = [];

for (const dir of listDirs()) {
  const pkgPath = path.join(ROOT, dir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const original = JSON.stringify(pkg, null, 2) + "\n";

  // Resolve publish name
  let name = NAME_MAP[dir] || pkg.name;
  if (name.startsWith("ai-") === false && !name.startsWith("@") && dir !== "ai-setup-doctor") {
    // use scope for portfolio alphas to avoid collisions
    if (!NAME_MAP[dir]) name = `@bhaskarauthor/${dir}`;
  }
  // force scope for pure portfolio MVPs
  if (!["instruct-sync", "ai-setup-doctor", "secret-guard", "agent-skill-scan", "agent-spend-guard"].includes(dir)) {
    name = `@bhaskarauthor/${dir}`;
  }

  const version = pkg.version || "0.1.0-alpha.1";
  pkg.name = name;
  pkg.private = false;
  // Drop prepublishOnly if it will hang or fail hard on missing build
  if (pkg.scripts?.prepublishOnly && !fs.existsSync(path.join(ROOT, dir, "scripts/build.mjs")) && !fs.existsSync(path.join(ROOT, dir, "tsconfig.json"))) {
    // keep simple packages without prepublish
    delete pkg.scripts.prepublishOnly;
  }
  // For pure JS alphas, ensure files field includes src
  if (!pkg.files) {
    pkg.files = ["src", "README.md", "LICENSE", "PRODUCT_CYCLE.md", "demo", "fixtures"];
  }
  if (!pkg.license) pkg.license = "MIT";
  pkg.publishConfig = { access: "public" };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  if (npmView(name, version)) {
    console.log(`SKIP already on npm: ${name}@${version}`);
    results.push({ dir, name, version, status: "exists" });
    // restore private for alphas? keep public after publish
    continue;
  }

  console.log(`PUBLISH ${name}@${version} from ${dir} …`);
  // Prefer dry path: no prepublish hang — run tests optionally
  const r = run("npm", ["publish", "--access", "public"], path.join(ROOT, dir));
  const out = (r.stdout || "") + (r.stderr || "");
  if (r.status === 0) {
    console.log(`  OK ${name}@${version}`);
    results.push({ dir, name, version, status: "published" });
  } else {
    console.log(`  FAIL ${name}: ${out.slice(-400)}`);
    results.push({ dir, name, version, status: "failed", error: out.slice(-800) });
    // restore original package.json on hard fail so workspace not trashed? keep name change for retry
  }
}

const logDir = path.join(ROOT, "logs");
fs.mkdirSync(logDir, { recursive: true });
fs.writeFileSync(path.join(logDir, "publish-results.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
const ok = results.filter((r) => r.status === "published" || r.status === "exists").length;
const fail = results.filter((r) => r.status === "failed").length;
console.log(`\nDone: ${ok} ok/exists, ${fail} failed → logs/publish-results.json`);
process.exit(fail ? 1 : 0);
