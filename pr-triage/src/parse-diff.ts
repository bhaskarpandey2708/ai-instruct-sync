import type { FileDiff, Hunk } from "./types.js";

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

function cleanPath(p: string): string {
  return p.replace(/^[ab]\//, "");
}

/**
 * Parse unified diff text (git diff / format-patch) into FileDiff[] with
 * hunks. Tolerant: unknown lines are skipped, never throws.
 */
export function parseUnifiedDiff(text: string): FileDiff[] {
  const files: FileDiff[] = [];
  let current: FileDiff | null = null;
  let hunk: Hunk | null = null;
  let oldPath = "";

  for (const line of text.split("\n")) {
    if (line.startsWith("diff --git ")) {
      current = null;
      hunk = null;
      oldPath = "";
      continue;
    }
    if (line.startsWith("Binary files ")) {
      if (current) current.binary = true;
      continue;
    }
    if (line.startsWith("--- ")) {
      oldPath = cleanPath(line.slice(4).trim());
      continue;
    }
    if (line.startsWith("+++ ")) {
      const newPath = cleanPath(line.slice(4).trim());
      const file = newPath === "/dev/null" ? oldPath : newPath;
      const status: FileDiff["status"] =
        oldPath === "/dev/null" ? "added" : newPath === "/dev/null" ? "deleted" : "modified";
      current = { file, oldFile: oldPath, status, hunks: [], binary: false };
      files.push(current);
      hunk = null;
      continue;
    }
    const m = HUNK_HEADER.exec(line);
    if (m && current) {
      hunk = {
        file: current.file,
        oldStart: Number(m[1]),
        oldLines: Number(m[2] ?? 1),
        newStart: Number(m[3]),
        newLines: Number(m[4] ?? 1),
        lines: [],
        added: 0,
        removed: 0,
      };
      current.hunks.push(hunk);
      continue;
    }
    if (hunk && (line.startsWith("+") || line.startsWith("-") || line.startsWith(" ") || line === "")) {
      hunk.lines.push(line);
      if (line.startsWith("+")) hunk.added++;
      else if (line.startsWith("-")) hunk.removed++;
    }
  }
  return files;
}
