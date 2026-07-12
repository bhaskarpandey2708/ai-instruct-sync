#!/usr/bin/env node
/**
 * Build demo artifacts for every product package:
 *  - runs demo/run-demo.mjs or CLI --json on fixtures
 *  - writes demos/gallery/<pkg>.md and demos/gallery/INDEX.md
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "demos", "gallery");
fs.mkdirSync(OUT, { recursive: true });

const SKIP = new Set(["node_modules", "scripts", "logs", "suite", "demo-instruct-sync", "demos"]);

function listPackages() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !SKIP.has(d.name))
    .map((d) => d.name)
    .filter((n) => fs.existsSync(path.join(ROOT, n, "package.json")))
    .sort();
}

function runDemo(dir) {
  const cwd = path.join(ROOT, dir);
  const runDemo = path.join(cwd, "demo", "run-demo.mjs");
  if (fs.existsSync(runDemo)) {
    const r = spawnSync(process.execPath, [runDemo], { cwd, encoding: "utf8", timeout: 60_000 });
    return { cmd: "node demo/run-demo.mjs", status: r.status, out: (r.stdout || "") + (r.stderr || "") };
  }
  // secret-guard / setup-doctor style
  const distCli = path.join(cwd, "dist", "cli.js");
  const srcCli = path.join(cwd, "src", "cli.js");
  const cli = fs.existsSync(distCli) ? distCli : fs.existsSync(srcCli) ? srcCli : null;
  if (cli) {
    const fixture =
      fs.existsSync(path.join(cwd, "fixtures", "sample.json"))
        ? ["--json", "fixtures/sample.json"]
        : fs.existsSync(path.join(cwd, "fixtures", "leaky-rules"))
          ? ["--cwd", "fixtures/leaky-rules", "--quiet"]
          : ["--help"];
    const r = spawnSync(process.execPath, [cli, ...fixture], {
      cwd,
      encoding: "utf8",
      timeout: 60_000,
    });
    return {
      cmd: `node ${path.relative(cwd, cli)} ${fixture.join(" ")}`,
      status: r.status,
      out: (r.stdout || "") + (r.stderr || ""),
    };
  }
  // TypeScript package with only package test
  const r = spawnSync("npm", ["test"], { cwd, encoding: "utf8", timeout: 120_000 });
  return { cmd: "npm test", status: r.status, out: ((r.stdout || "") + (r.stderr || "")).slice(-2000) };
}

const index = [];
for (const dir of listPackages()) {
  process.stdout.write(`demo ${dir} … `);
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(ROOT, dir, "package.json"), "utf8"));
  } catch {
    /* */
  }
  const result = runDemo(dir);
  const ok = result.status === 0 || (result.out && result.out.length > 0);
  // secret-guard demo may exit 1 on findings — still a valid demo
  const success = result.out.length > 20;
  const body = `# Demo — ${dir}

**Package:** \`${pkg.name || dir}\`  
**Version:** \`${pkg.version || "?"}\`  
**Command:** \`${result.cmd}\`  
**Exit:** ${result.status}

## Output

\`\`\`text
${result.out.slice(0, 8000).trim() || "(no output)"}
\`\`\`

## Try it

\`\`\`bash
npx ${pkg.name || dir}@${pkg.version || "latest"} --help
# or from monorepo:
cd ${dir} && npm run demo 2>/dev/null || node demo/run-demo.mjs 2>/dev/null || npm test
\`\`\`
`;
  fs.writeFileSync(path.join(OUT, `${dir}.md`), body);
  index.push({ dir, name: pkg.name, version: pkg.version, ok: success, status: result.status });
  console.log(success ? "OK" : "WEAK");
}

const idxMd = `# Demo gallery

Generated: ${new Date().toISOString()}

| Package | npm | Demo |
|---------|-----|------|
${index
  .map(
    (i) =>
      `| **${i.dir}** | \`${i.name}@${i.version}\` | [${i.ok ? "view" : "weak"}](./${i.dir}.md) · exit ${i.status} |`,
  )
  .join("\n")}

## Rebuild

\`\`\`bash
node scripts/build-all-demos.mjs
\`\`\`
`;
fs.writeFileSync(path.join(OUT, "INDEX.md"), idxMd);
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ at: new Date().toISOString(), index }, null, 2));
console.log(`\nWrote ${index.length} demos → demos/gallery/INDEX.md`);
