import type {
  FileDiff,
  Hunk,
  RiskSignal,
  ScoredHunk,
  TriageOptions,
  TriageReport,
} from "./types.js";

/** File-path risk classes — where a wrong line hurts most. */
const PATH_SIGNALS: { id: string; label: string; weight: number; re: RegExp }[] = [
  { id: "path/security", label: "auth/crypto/payment path", weight: 25, re: /(auth|login|session|token|crypt|secur|payment|billing|checkout)/i },
  { id: "path/migration", label: "schema/migration", weight: 20, re: /(migration|schema|\.sql$)/i },
  { id: "path/config", label: "config/infra file", weight: 12, re: /(\.env|config|settings|docker|k8s|terraform|\.ya?ml$|\.toml$)/i },
  { id: "path/deps", label: "dependency manifest", weight: 12, re: /(package\.json|package-lock|pnpm-lock|yarn\.lock|requirements\.txt|go\.mod|Cargo\.toml)$/i },
  { id: "path/api", label: "public API surface", weight: 10, re: /(routes?|controller|handler|endpoint|api\/)/i },
];

const TEST_PATH = /(^|\/)(tests?|__tests__|spec)\/|\.(test|spec)\.[cm]?[jt]sx?$|_test\.(go|py|rb)$/i;
const DOC_PATH = /\.(md|markdown|txt|rst)$|(^|\/)docs?\//i;

/** Content signals evaluated per hunk. */
const CONTENT_SIGNALS: { id: string; label: string; weight: number; test: (added: string, removed: string) => boolean }[] = [
  {
    id: "content/error-handling-removed",
    label: "error handling removed",
    weight: 18,
    test: (_a, r) => /\b(try|catch|except|rescue|if\s*\(?err|throw|raise)\b/.test(r),
  },
  {
    id: "content/validation-removed",
    label: "validation/guard removed",
    weight: 14,
    test: (_a, r) => /\b(validate|sanitize|escape|assert|require\()/i.test(r),
  },
  {
    id: "content/branchy",
    label: "dense new branching",
    weight: 10,
    test: (a) => (a.match(/\b(if|else|case|catch|\?\.|&&|\|\|)\b|\?[^.]/g) ?? []).length >= 8,
  },
  {
    id: "content/regex-change",
    label: "regex changed",
    weight: 8,
    test: (a, r) => /new RegExp|\/[^/\n]{6,}\/[gimsuy]*[,;)\s]/.test(a + r),
  },
  {
    id: "content/concurrency",
    label: "async/concurrency touched",
    weight: 8,
    test: (a) => /\b(await|Promise\.(all|race)|setTimeout|setInterval|mutex|lock|thread)\b/i.test(a),
  },
  {
    id: "content/ai-placeholder",
    label: "placeholder/TODO left behind",
    weight: 12,
    test: (a) => /\b(TODO|FIXME|XXX|placeholder|implement (?:this|me)|your[_ -]?(?:code|logic) here)\b/i.test(a),
  },
  {
    id: "content/console-debug",
    label: "debug output added",
    weight: 5,
    test: (a) => /\b(console\.(log|debug)|print\(|dbg!|debugger)\b/.test(a),
  },
  {
    id: "content/secret-shaped",
    label: "credential-shaped string",
    weight: 20,
    // Assembled at runtime so this source never contains matchable literals
    test: (a) => new RegExp(["sk-", "[A-Za-z0-9_-]{20,}", "|AK", "IA[0-9A-Z]{16}", "|gh", "[pousr]_[A-Za-z0-9_]{20,}"].join("")).test(a),
  },
];

function hunkText(h: Hunk): { added: string; removed: string } {
  const added: string[] = [];
  const removed: string[] = [];
  for (const l of h.lines) {
    if (l.startsWith("+")) added.push(l.slice(1));
    else if (l.startsWith("-")) removed.push(l.slice(1));
  }
  return { added: added.join("\n"), removed: removed.join("\n") };
}

function sizeSignal(h: Hunk): RiskSignal | null {
  const churn = h.added + h.removed;
  if (churn >= 120) return { id: "size/huge", label: `huge hunk (${churn} lines)`, weight: 15 };
  if (churn >= 50) return { id: "size/large", label: `large hunk (${churn} lines)`, weight: 8 };
  return null;
}

export function scoreHunk(h: Hunk, opts: { untested: boolean; isDoc: boolean }): ScoredHunk {
  const signals: RiskSignal[] = [];
  const { added, removed } = hunkText(h);

  for (const p of PATH_SIGNALS) {
    if (p.re.test(h.file)) signals.push({ id: p.id, label: p.label, weight: p.weight });
  }
  for (const c of CONTENT_SIGNALS) {
    if (c.test(added, removed)) signals.push({ id: c.id, label: c.label, weight: c.weight });
  }
  const size = sizeSignal(h);
  if (size) signals.push(size);
  if (opts.untested && !opts.isDoc) {
    signals.push({ id: "coverage/untested", label: "no test change for this file", weight: 15 });
  }
  if (opts.isDoc) {
    // Docs-only content can't break runtime behavior — damp everything.
    return {
      file: h.file,
      newStart: h.newStart,
      score: Math.min(5, signals.reduce((s, x) => s + x.weight, 0) / 10),
      signals: [{ id: "path/docs", label: "documentation", weight: 0 }],
      preview: previewOf(h),
    };
  }

  return {
    file: h.file,
    newStart: h.newStart,
    score: signals.reduce((s, x) => s + x.weight, 0),
    signals,
    preview: previewOf(h),
  };
}

function previewOf(h: Hunk): string {
  const first = h.lines.find((l) => l.startsWith("+") || l.startsWith("-"));
  const s = (first ?? h.lines[0] ?? "").trim();
  return s.length > 100 ? s.slice(0, 97) + "…" : s;
}

/** Which changed files have a sibling test change in the same diff? */
export function untestedChangedFiles(files: FileDiff[]): string[] {
  const changedTests = files.filter((f) => TEST_PATH.test(f.file));
  const testBlob = changedTests.map((f) => f.file).join("\n");
  const out: string[] = [];
  for (const f of files) {
    if (TEST_PATH.test(f.file) || DOC_PATH.test(f.file) || f.binary) continue;
    const base = f.file.split("/").pop()?.replace(/\.[cm]?[jt]sx?$|\.(py|go|rb|java)$/i, "") ?? "";
    const covered =
      changedTests.length > 0 &&
      base.length >= 3 &&
      new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(testBlob);
    if (!covered) out.push(f.file);
  }
  return out;
}

export function triage(files: FileDiff[], options: TriageOptions = {}): TriageReport {
  const top = options.top ?? 20;
  const untested = new Set(untestedChangedFiles(files));

  const ranked: ScoredHunk[] = [];
  let hunks = 0;
  let totalAdded = 0;
  let totalRemoved = 0;

  for (const f of files) {
    for (const h of f.hunks) {
      hunks++;
      totalAdded += h.added;
      totalRemoved += h.removed;
      ranked.push(scoreHunk(h, { untested: untested.has(f.file), isDoc: DOC_PATH.test(f.file) }));
    }
  }

  ranked.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.newStart - b.newStart);

  return {
    checkedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    files: files.length,
    hunks,
    totalAdded,
    totalRemoved,
    ranked: ranked.slice(0, top),
    untestedFiles: [...untested],
  };
}
