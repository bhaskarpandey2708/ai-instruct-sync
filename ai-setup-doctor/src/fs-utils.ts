import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  accessSync,
  constants,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { join, isAbsolute, dirname } from "node:path";
import { delimiter } from "node:path";

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

export function dirHasFiles(path: string): boolean {
  try {
    if (!existsSync(path) || !statSync(path).isDirectory()) return false;
    return readdirSync(path).length > 0;
  } catch {
    return false;
  }
}

export function listFilesRecursive(dir: string, max = 40): string[] {
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
      if (name === "node_modules" || name === ".git" || name === "dist") continue;
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

/** True if path is inside a git work tree (including monorepo subdirs). */
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

/** Files tracked by git matching patterns (best-effort; empty if no git). */
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

/** Normalize text for instruction drift comparison. */
export function normalizeInstructionText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .toLowerCase();
}

export function simpleHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Resolve an executable on PATH (no shell). Returns absolute path or null. */
export function whichCommand(cmd: string): string | null {
  if (!cmd || cmd.includes("/") || cmd.includes("\\")) {
    // Absolute or relative path — not a PATH lookup
    return null;
  }
  const pathEnv = process.env.PATH || process.env.Path || "";
  const exts =
    process.platform === "win32"
      ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";").filter(Boolean)
      : [""];
  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, cmd + ext);
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        try {
          if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
        } catch {
          /* continue */
        }
      }
    }
  }
  return null;
}

/** Whether a command string is likely invokable (PATH or absolute/relative file). */
export function commandLooksRunnable(command: string, baseDir?: string): boolean {
  const cmd = command.trim();
  if (!cmd) return false;
  if (cmd.includes("/") || cmd.includes("\\")) {
    const full = isAbsolute(cmd) ? cmd : join(baseDir || process.cwd(), cmd);
    return existsSync(full);
  }
  return whichCommand(cmd) !== null;
}

/** True if raw text has // or /* comments that break strict JSON. */
export function looksLikeJsonWithComments(raw: string): boolean {
  // Strip strings roughly then look for // or /* outside — lightweight heuristic
  const stripped = raw
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
  return /\/\//.test(stripped) || /\/\*[\s\S]*?\*\//.test(stripped);
}

export function dirOf(filePath: string): string {
  return dirname(filePath);
}
