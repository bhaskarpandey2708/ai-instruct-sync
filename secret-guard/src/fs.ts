import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

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

export function listFilesRecursive(dir: string, max = 80): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    if (out.length >= max) return;
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const name of entries) {
      if (out.length >= max) break;
      if (
        name === "node_modules" ||
        name === ".git" ||
        name === "dist" ||
        name === "coverage" ||
        name === ".next" ||
        name === "vendor"
      ) {
        continue;
      }
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

export function isGitWorkTree(cwd: string): boolean {
  if (existsSync(join(cwd, ".git"))) return true;
  try {
    const out = execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 3000,
    }).trim();
    return out === "true";
  } catch {
    return false;
  }
}

export function gitTrackedFiles(cwd: string, globs: string[]): string[] {
  try {
    const args = ["ls-files", "-z", "--", ...globs];
    const out = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
      maxBuffer: 2_000_000,
    });
    return out.split("\0").filter(Boolean);
  } catch {
    return [];
  }
}

/** Strip line and block comments for JSONC MCP configs. */
export function stripJsonComments(raw: string): string {
  let out = "";
  let i = 0;
  let inStr = false;
  let quote = "";
  let escape = false;
  while (i < raw.length) {
    const c = raw[i]!;
    if (inStr) {
      out += c;
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === quote) inStr = false;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = true;
      quote = c;
      out += c;
      i++;
      continue;
    }
    if (c === "/" && raw[i + 1] === "/") {
      i += 2;
      while (i < raw.length && raw[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && raw[i + 1] === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

export function tryParseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(stripJsonComments(raw));
    } catch {
      return null;
    }
  }
}
