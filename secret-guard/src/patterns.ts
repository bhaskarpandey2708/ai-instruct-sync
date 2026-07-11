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
  { id: "openai", re: /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/ },
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

export const PLACEHOLDER_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "change-me", re: /\bCHANGE_ME\b/i },
  { id: "your-api-key", re: /your[_-]?api[_-]?key/i },
  { id: "replace-me", re: /\bREPLACE_ME\b/i },
  {
    id: "xxx-key",
    re: /(?:api[_-]?key|token|secret)\s*[:=]\s*['"]?(?:xxx+|TODO|FIXME|placeholder)['"]?/i,
  },
  { id: "example-com", re: /api[_-]?key\s*[:=]\s*['"][^'"]*example\.com/i },
  { id: "insert-here", re: /<(?:YOUR|INSERT)_[A-Z0-9_]+>/ },
  { id: "angle-placeholder", re: /\bAPI_KEY\s*=\s*<[^>]+>/i },
];

export function isAllowlistedSecretText(snippet: string): boolean {
  const s = snippet.trim();
  if (!s) return true;
  if (SECRET_ALLOWLIST.some((re) => re.test(s))) return true;
  if (PLACEHOLDER_PATTERNS.some((p) => p.re.test(s))) return true;
  if (/^(.)\1{15,}$/.test(s)) return true;
  // Only apply loose "example" words to the match itself (not huge context windows)
  if (s.length < 120 && /\b(example|sample|dummy|fake|placeholder|redacted|not[_-]?a[_-]?secret)\b/i.test(s)) {
    return true;
  }
  return false;
}

/** Context allowlist: explicit sample patterns only (avoid comment words like "example"). */
function isAllowlistedContext(ctx: string): boolean {
  if (SECRET_ALLOWLIST.some((re) => re.test(ctx))) return true;
  if (PLACEHOLDER_PATTERNS.some((p) => p.re.test(ctx))) return true;
  return false;
}

export interface SecretHit {
  id: string;
  match: string;
  index: number;
}

/** Find non-allowlisted secret hits in text. */
export function findSecretHits(text: string, max = 20): SecretHit[] {
  const hits: SecretHit[] = [];
  for (const p of SECRET_PATTERNS) {
    const re = new RegExp(p.re.source, p.re.flags.includes("g") ? p.re.flags : `${p.re.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const match = m[0];
      // Tight context: same line only (avoids "example" in nearby comments)
      const lineStart = text.lastIndexOf("\n", m.index) + 1;
      const lineEnd = text.indexOf("\n", m.index);
      const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
      if (isAllowlistedSecretText(match) || isAllowlistedContext(line)) continue;
      hits.push({ id: p.id, match: match.slice(0, 64), index: m.index });
      if (hits.length >= max) return hits;
      break; // one per pattern family per file is enough for reporting
    }
  }
  return hits;
}

/** Values in MCP env that look like live credentials (not ${ENV} refs). */
export function looksLikeHardcodedSecret(value: string): boolean {
  const v = value.trim();
  if (!v || v.length < 8) return false;
  if (/^\$\{?[A-Z0-9_]+\}?$/i.test(v)) return false;
  if (/^\$[A-Z0-9_]+$/i.test(v)) return false;
  if (/^(true|false|null|undefined|\d+)$/i.test(v)) return false;
  if (isAllowlistedSecretText(v)) return false;
  if (PLACEHOLDER_PATTERNS.some((p) => p.re.test(v))) return false;
  if (findSecretHits(v, 1).length > 0) return true;
  if (/^[A-Za-z0-9_\-+/=]{32,}$/.test(v) && /[A-Za-z]/.test(v) && /\d/.test(v)) {
    return !isAllowlistedSecretText(v);
  }
  return false;
}

/** Redact middle of a match for safe display. */
export function redact(match: string): string {
  if (match.length <= 8) return "****";
  if (match.length <= 16) return `${match.slice(0, 3)}…${match.slice(-2)}`;
  return `${match.slice(0, 6)}…${match.slice(-4)}`;
}

export function lineColAt(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, column: col };
}
