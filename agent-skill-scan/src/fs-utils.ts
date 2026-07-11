import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, isAbsolute } from "node:path";

export function safeRead(path: string, max = 200_000): string | null {
  try {
    if (!existsSync(path) || !statSync(path).isFile()) return null;
    const size = statSync(path).size;
    if (size > max) return readFileSync(path, "utf8").slice(0, max);
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

const TEXT_EXTS = new Set([
  ".md", ".markdown", ".txt",
  ".sh", ".bash", ".zsh",
  ".js", ".mjs", ".cjs", ".ts", ".mts", ".cts",
  ".py", ".rb", ".pl",
  ".json", ".jsonc", ".yaml", ".yml", ".toml",
]);

/** Extensionless files that are usually executable scripts. */
const TEXT_BASENAMES = new Set(["skill", "makefile", "dockerfile", "justfile"]);

export function isScannableFile(path: string): boolean {
  const ext = extname(path).toLowerCase();
  if (TEXT_EXTS.has(ext)) return true;
  if (!ext) {
    const base = path.split("/").pop()?.toLowerCase() ?? "";
    return TEXT_BASENAMES.has(base);
  }
  return false;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage", "__pycache__", ".venv"]);

export function walkFiles(dir: string, maxFiles = 400): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    if (out.length >= maxFiles) return;
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const name of entries) {
      if (out.length >= maxFiles) break;
      if (SKIP_DIRS.has(name)) continue;
      const p = join(d, name);
      try {
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else if (st.isFile()) out.push(p);
      } catch {
        /* skip */
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/** Display path: relative to cwd when inside it, absolute otherwise. */
export function displayPath(cwd: string, path: string): string {
  if (!isAbsolute(path)) return path;
  const rel = relative(cwd, path);
  return rel && !rel.startsWith("..") ? rel : path;
}
