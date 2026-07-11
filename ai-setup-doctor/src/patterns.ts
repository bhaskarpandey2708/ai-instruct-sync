/** High-signal secret patterns. Order: more specific first. */
export const SECRET_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "aws-key", re: /AKIA[0-9A-Z]{16}/ },
  { id: "github-pat", re: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { id: "github-fine", re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { id: "slack-token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { id: "stripe-live", re: /sk_live_[A-Za-z0-9]{16,}/ },
  { id: "stripe-test", re: /sk_test_[A-Za-z0-9]{16,}/ },
  { id: "npm-token", re: /npm_[A-Za-z0-9]{20,}/ },
  { id: "vercel", re: /vercel_[A-Za-z0-9_]{20,}/i },
  { id: "huggingface", re: /hf_[A-Za-z0-9]{20,}/ },
  { id: "anthropic", re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  // OpenAI-style: sk-... and sk-proj-... (hyphens allowed after prefix)
  { id: "openai", re: /sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}/ },
  { id: "jwt", re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  {
    id: "private-key",
    re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  },
  {
    id: "generic-key",
    re: /(?:api[_-]?key|secret|token|password|auth)\s*[:=]\s*['"][^'"]{12,}['"]/i,
  },
];

/** Docs / sample material that must not raise secret alarms. */
const SECRET_ALLOWLIST: RegExp[] = [
  /AKIAIOSFODNN7EXAMPLE/i,
  /wJalrXUtnFEMI\/K7MDENG/i,
  /EXAMPLEKEY/i,
  /sk-ant-api03-example/i,
  /sk-(?:proj-)?(?:x{8,}|your[_-]?key|example|test[_-]?key|fake|dummy)/i,
  /ghp_example/i,
  /github_pat_example/i,
  /xoxb-example/i,
  /sk_test_51Example/i,
  /npm_example/i,
  /hf_example/i,
  /password\s*[:=]\s*['"]?(?:password|secret|changeme|admin|1234)/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]*(?:example\.com|localhost|placeholder|xxx+)/i,
];

/** Placeholders that look like unfinished setup (not real secrets). */
export const PLACEHOLDER_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "change-me", re: /\bCHANGE_ME\b/i },
  { id: "your-api-key", re: /your[_-]?api[_-]?key/i },
  { id: "replace-me", re: /\bREPLACE_ME\b/i },
  { id: "xxx-key", re: /(?:api[_-]?key|token|secret)\s*[:=]\s*['"]?(?:xxx+|TODO|FIXME|placeholder)['"]?/i },
  { id: "example-com", re: /api[_-]?key\s*[:=]\s*['"][^'"]*example\.com/i },
  { id: "insert-here", re: /<(?:YOUR|INSERT)_[A-Z0-9_]+>/ },
  { id: "angle-placeholder", re: /\bAPI_KEY\s*=\s*<[^>]+>/i },
];

export function isAllowlistedSecretText(snippet: string): boolean {
  const s = snippet.trim();
  if (!s) return true;
  if (SECRET_ALLOWLIST.some((re) => re.test(s))) return true;
  if (PLACEHOLDER_PATTERNS.some((p) => p.re.test(s))) return true;
  // Pure repeated chars / obvious fake
  if (/^(.)\1{15,}$/.test(s)) return true;
  if (/\b(example|sample|dummy|fake|placeholder|redacted|not[_-]?a[_-]?secret)\b/i.test(s)) {
    return true;
  }
  return false;
}

export interface SecretHit {
  id: string;
  match: string;
}

/** Find first non-allowlisted secret hit in text. */
export function findSecretHits(text: string, max = 5): SecretHit[] {
  const hits: SecretHit[] = [];
  for (const p of SECRET_PATTERNS) {
    const re = new RegExp(p.re.source, p.re.flags.includes("g") ? p.re.flags : p.re.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const match = m[0];
      // Context window around match for allowlist phrases
      const start = Math.max(0, m.index - 40);
      const end = Math.min(text.length, m.index + match.length + 40);
      const ctx = text.slice(start, end);
      if (isAllowlistedSecretText(match) || isAllowlistedSecretText(ctx)) continue;
      hits.push({ id: p.id, match: match.slice(0, 48) });
      if (hits.length >= max) return hits;
      break; // one hit per pattern family is enough for reporting
    }
  }
  return hits;
}

/** Values in MCP env that look like live credentials (not ${ENV} refs). */
export function looksLikeHardcodedSecret(value: string): boolean {
  const v = value.trim();
  if (!v || v.length < 8) return false;
  if (/^\$\{?[A-Z0-9_]+\}?$/i.test(v)) return false; // env var ref
  if (/^\$[A-Z0-9_]+$/i.test(v)) return false;
  if (/^(true|false|null|undefined|\d+)$/i.test(v)) return false;
  if (isAllowlistedSecretText(v)) return false;
  if (PLACEHOLDER_PATTERNS.some((p) => p.re.test(v))) return false;
  if (findSecretHits(v, 1).length > 0) return true;
  // Long high-entropy-ish tokens assigned as bare strings
  if (/^[A-Za-z0-9_\-+/=]{32,}$/.test(v) && /[A-Za-z]/.test(v) && /\d/.test(v)) {
    if (isAllowlistedSecretText(v)) return false;
    return true;
  }
  return false;
}

export function isEnvIgnoredByGitignore(gi: string): boolean {
  const lines = gi
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const patterns = new Set([
    ".env",
    ".env*",
    "*.env",
    "**/.env",
    ".env.*",
    ".env.local",
    ".env.*.local",
  ]);
  for (const l of lines) {
    if (patterns.has(l)) return true;
    if (l === ".env" || l === ".env*" || l === "*.env") return true;
    // .env with optional trailing slash / wildcard
    if (/^\*?\.env(\*|(\.[A-Za-z0-9_*]+)?)$/.test(l)) return true;
  }
  // Multiline loose match for ".env" alone
  if (/(^|[\n/])\.env(\n|$)/.test(gi)) return true;
  return false;
}

/** Detect always/never instruction contradictions in rule text. */
export function findInstructionContradictions(text: string): string[] {
  const lower = text.toLowerCase();
  const always: string[] = [];
  const never: string[] = [];
  const alwaysRe = /\balways\s+(?:use|prefer|run|install)\s+([a-z0-9._@/-]+)/gi;
  const neverRe = /\bnever\s+(?:use|prefer|run|install)\s+([a-z0-9._@/-]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = alwaysRe.exec(lower)) !== null) always.push(m[1]!);
  while ((m = neverRe.exec(lower)) !== null) never.push(m[1]!);
  const conflicts: string[] = [];
  for (const a of always) {
    for (const n of never) {
      if (a === n || a.includes(n) || n.includes(a)) {
        conflicts.push(`always use ${a} vs never use ${n}`);
      }
    }
  }
  // Direct opposite pairs common in package managers
  const pairs: [string, string][] = [
    ["npm", "yarn"],
    ["npm", "pnpm"],
    ["yarn", "pnpm"],
    ["npm", "bun"],
  ];
  for (const [x, y] of pairs) {
    const ax = always.some((t) => t === x || t.includes(x));
    const ay = always.some((t) => t === y || t.includes(y));
    if (ax && ay) conflicts.push(`always use both ${x} and ${y}`);
  }
  return [...new Set(conflicts)];
}

/** npx/yarn dlx package arg without a version pin. */
export function isUnpinnedPackageArg(arg: string): boolean {
  if (!arg || arg.startsWith("-")) return false;
  // scoped or unscoped package names without @version
  // @scope/pkg  or  pkg  — not @scope/pkg@1.2.3
  if (arg.startsWith("@")) {
    // @scope/name@version
    const rest = arg.slice(1);
    const at = rest.lastIndexOf("@");
    // first @ is scope; version is second @
    const slash = rest.indexOf("/");
    if (slash < 0) return false;
    const afterName = rest.slice(slash + 1);
    return !afterName.includes("@");
  }
  // unscoped: name@version
  if (arg.includes("/") && !arg.startsWith(".")) return false; // paths
  if (/^[a-z0-9][a-z0-9._-]*$/i.test(arg)) return true; // bare package name
  return false;
}
