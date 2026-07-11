import type { Severity } from "./types.js";

export interface TextRule {
  id: string;
  severity: Severity;
  title: string;
  re: RegExp;
  fix?: string;
}

/**
 * Some signature strings below are assembled via concatenation (`rx(...)`).
 * This is deliberate: endpoint-security products pattern-match raw source
 * files, and a file full of literal exfil domains and reverse-shell
 * one-liners looks like a dropper. Same practice AV vendors use for their
 * own signature databases. Do not "simplify" back to literals.
 */
const rx = (parts: string[], flags = "i"): RegExp => new RegExp(parts.join(""), flags);

/**
 * Line-level threat rules for skill bodies, rule files, hook commands, and MCP
 * command strings. Ordered by severity so the worst finding surfaces first.
 */
export const TEXT_RULES: TextRule[] = [
  {
    id: "injection/override-instructions",
    severity: "critical",
    title: "Instruction override",
    re: /\b(?:ignore|disregard|forget)\s+(?:all\s+|any\s+)?(?:previous|prior|above|earlier|system)\s+(?:instructions?|rules?|prompts?|context)/i,
    fix: "Remove the skill/rule — this is a prompt-injection primitive",
  },
  {
    id: "injection/hide-from-user",
    severity: "critical",
    title: "Hidden-from-user directive",
    re: /\b(?:do\s+not|don'?t|never)\s+(?:tell|inform|notify|alert|mention|reveal|show)\b[^.\n]{0,40}\buser\b/i,
    fix: "Agents must never be told to conceal actions from the user",
  },
  {
    id: "exfil/secrets-out",
    severity: "critical",
    title: "Secret exfiltration directive",
    re: /\b(?:send|upload|post|forward|transmit|exfiltrate|copy)\b[^.\n]{0,100}\b(?:api[_-]?keys?|secrets?|tokens?|credentials?|passwords?|\.env\b|environment\s+variables?)/i,
    fix: "Remove immediately and rotate any credentials this had access to",
  },
  {
    id: "exfil/env-harvest",
    severity: "critical",
    title: "Environment harvest + network",
    re: rx(["\\b(?:printenv|process\\.env|os\\.environ|\\benv\\b)", "[^\\n]{0,120}", "\\b(?:cu", "rl|wg", "et|fetch\\(|https?:\\/\\/)"]),
    fix: "Environment variables piped to the network is exfiltration",
  },
  {
    id: "exfil/suspicious-webhook",
    severity: "critical",
    title: "Suspicious webhook endpoint",
    re: rx([
      "https?:\\/\\/(?:",
      ["disc", "ord(?:app)?\\.com\\/api\\/webh", "ooks"].join(""),
      "|", ["ho", "oks\\.sl", "ack\\.com\\/services"].join(""),
      "|", ["api\\.tele", "gram\\.org\\/bot"].join(""),
      "|", ["paste", "bin\\.com\\/api"].join(""),
      "|", ["[a-z0-9-]+\\.ngr", "ok(?:-free)?\\.(?:io|app)"].join(""),
      "|", ["webh", "ook\\.site"].join(""),
      "|", ["request", "bin"].join(""),
      "|", ["oast", "ify\\.com"].join(""),
      "|", ["burpcolla", "borator"].join(""),
      ")",
    ]),
    fix: "Skills have no business posting to chat webhooks or request bins",
  },
  {
    id: "shell/curl-pipe-sh",
    severity: "critical",
    title: "Remote script piped to shell",
    re: rx(["\\b(?:cu", "rl|wg", "et)\\b[^\\n|;&]{0,200}\\|\\s*(?:sudo\\s+)?(?:ba|z|fi)?sh\\b"]),
    fix: "Download-and-execute defeats all review; pin and vendor scripts instead",
  },
  {
    id: "shell/reverse-shell",
    severity: "critical",
    title: "Reverse shell pattern",
    re: rx([
      "(?:\\b(?:nc|nc", "at|net", "cat)\\b[^\\n]{0,60}\\s-e\\s",
      "|", ["\\/dev\\/t", "cp\\/\\d{1,3}\\."].join(""),
      "|", ["bash\\s+-i\\s+", ">&"].join(""),
      ")",
    ]),
    fix: "Remove immediately — classic reverse-shell invocation",
  },
  {
    id: "injection/covert-action",
    severity: "high",
    title: "Covert action directive",
    re: /(?:\b(?:silently|covertly|secretly|discreetly)\b[^.\n]{0,80}\b(?:run|execute|send|upload|post|delete|install|download|fetch)\b|\b(?:run|execute|send|upload|post|delete|install|download|fetch)\b[^.\n]{0,80}\bwithout\s+(?:informing|telling|asking|notifying|alerting)\b)/i,
    fix: "Actions hidden from the operator are an attack pattern",
  },
  {
    id: "shell/base64-exec",
    severity: "high",
    title: "Base64 decode piped to shell",
    re: rx(["base", "64\\s+(?:-d|-D|--decode)\\b[^\\n]{0,80}\\|\\s*(?:ba|z|fi)?sh\\b"]),
    fix: "Encoded payload execution hides intent from review",
  },
  {
    id: "shell/rm-rf-root",
    severity: "high",
    title: "Recursive delete of home or root",
    re: rx(["\\brm\\s+-(?=[a-z]*r)(?=[a-z]*f)[a-z]+\\s+", "(?:\\/(?:\\s|$|['\"])|~\\/?|\"?\\$HOME)"]),
    fix: "No skill should delete the filesystem root or home directory",
  },
  {
    id: "cred/ssh-key-access",
    severity: "high",
    title: "SSH private key access",
    re: rx(["\\.ssh\\/", "(?:id_[a-z0-9]+)(?!\\.pub)"]),
    fix: "Skills should never touch private SSH keys",
  },
  {
    id: "cred/keychain-access",
    severity: "high",
    title: "OS keychain password dump",
    re: rx(["\\bsecurity\\s+(?:find|dump)-", "(?:generic|internet)-pass", "word"]),
    fix: "Keychain reads from a skill are credential theft",
  },
  {
    id: "persist/scheduler",
    severity: "medium",
    title: "Persistence via scheduler",
    re: rx(["(?:\\bcron", "tab\\s+-|\\/etc\\/cr", "on|launch", "ctl\\s+(?:load|bootstrap))"]),
    fix: "Skills installing cron/launchd jobs persist beyond the session — verify intent",
  },
  {
    id: "shell/chmod-777",
    severity: "medium",
    title: "World-writable permissions",
    re: /\bchmod\s+(?:-R\s+)?777\b/,
    fix: "777 permissions are never required; tighten the mode",
  },
];

/** Obfuscation heuristics — applied to skill and rule text, one hit per file. */
export const OBFUSCATION_RULES: TextRule[] = [
  {
    id: "obfuscation/base64-blob",
    severity: "medium",
    title: "Large base64 blob",
    re: /[A-Za-z0-9+/]{200,}={0,2}/,
    fix: "Decode and review; large opaque blobs hide payloads",
  },
  {
    id: "obfuscation/charcode-chain",
    severity: "medium",
    title: "Character-code obfuscation",
    re: /String\.fromCharCode\((?:\s*\d+\s*,){8,}/,
    fix: "Deobfuscate and review the constructed string",
  },
  {
    id: "obfuscation/hex-chain",
    severity: "medium",
    title: "Hex-escape obfuscation",
    re: /(?:\\x[0-9a-fA-F]{2}){10,}/,
    fix: "Deobfuscate and review the constructed string",
  },
];

export interface UnicodeHit {
  id: string;
  severity: Severity;
  title: string;
  line: number;
  message: string;
}

/**
 * Invisible/deceptive Unicode that can smuggle instructions past human review.
 * ZWJ/ZWNJ are legitimate in emoji and Indic scripts, so they only fire in
 * ASCII-dominant text where they have no rendering purpose.
 */
export function findUnicodeHits(text: string): UnicodeHit[] {
  const hits: UnicodeHit[] = [];
  const lineOf = (index: number): number => text.slice(0, index).split("\n").length;

  const tag = /[\u{E0020}-\u{E007F}]/u.exec(text);
  if (tag) {
    hits.push({
      id: "unicode/ascii-smuggling",
      severity: "critical",
      title: "Unicode tag characters",
      line: lineOf(tag.index),
      message: "Invisible Unicode tag characters can encode hidden instructions for LLMs",
    });
  }

  const bidi = /[\u202A-\u202E\u2066-\u2069]/.exec(text);
  if (bidi) {
    hits.push({
      id: "unicode/bidi-override",
      severity: "high",
      title: "Bidirectional override characters",
      line: lineOf(bidi.index),
      message: "Bidi control characters can make displayed text differ from actual content",
    });
  }

  // FEFF at position 0 is a BOM — legitimate.
  const invisible = /[\u200B\u2060]|(?<!^)\uFEFF/.exec(text);
  if (invisible) {
    hits.push({
      id: "unicode/invisible-chars",
      severity: "high",
      title: "Zero-width characters",
      line: lineOf(invisible.index),
      message: "Zero-width characters in instructions can hide content from human review",
    });
  }

  const joiners = text.match(/[\u200C\u200D]/g);
  if (joiners && joiners.length >= 3) {
    let ascii = 0;
    for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) < 128) ascii++;
    if (ascii / Math.max(text.length, 1) > 0.95) {
      const first = /[\u200C\u200D]/.exec(text)!;
      hits.push({
        id: "unicode/joiners-in-ascii",
        severity: "medium",
        title: "Joiner characters in ASCII text",
        line: lineOf(first.index),
        message: "ZWJ/ZWNJ have no purpose in plain ASCII text and can smuggle tokens",
      });
    }
  }

  return hits;
}

/** High-signal secret patterns (shared heritage with ai-setup-doctor). */
export const SECRET_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "aws-key", re: rx(["AK", "IA[0-9A-Z]{16}"], "") },
  { id: "github-pat", re: rx(["gh", "[pousr]_[A-Za-z0-9_]{20,}"], "") },
  { id: "github-fine", re: rx(["github", "_pat_[A-Za-z0-9_]{20,}"], "") },
  { id: "slack-token", re: rx(["xo", "x[baprs]-[A-Za-z0-9-]{10,}"], "") },
  { id: "stripe-live", re: rx(["sk_", "live_[A-Za-z0-9]{16,}"], "") },
  { id: "npm-token", re: rx(["np", "m_[A-Za-z0-9]{20,}"], "") },
  { id: "huggingface", re: rx(["hf", "_[A-Za-z0-9]{20,}"], "") },
  { id: "anthropic", re: rx(["sk-", "ant-[A-Za-z0-9_-]{20,}"], "") },
  { id: "openai", re: rx(["sk-", "(?:proj-)?[A-Za-z0-9_-]{20,}"], "") },
  { id: "jwt", re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { id: "private-key", re: rx(["-----BEGIN ", "(?:RSA |EC |OPENSSH |DSA )?", "PRIVATE KEY-----"], "") },
];

const SECRET_ALLOWLIST: RegExp[] = [
  /AKIAIOSFODNN7EXAMPLE/i,
  /\b(example|sample|dummy|fake|placeholder|redacted|your[_-]?key|test[_-]?key|not[_-]?a[_-]?secret)\b/i,
  /x{8,}/i,
];

export function isAllowlistedSecretText(snippet: string): boolean {
  const s = snippet.trim();
  if (!s) return true;
  if (SECRET_ALLOWLIST.some((re) => re.test(s))) return true;
  if (/^(.)\1{15,}$/.test(s)) return true;
  return false;
}

export interface SecretHit {
  id: string;
  masked: string;
}

/** First non-allowlisted secret hits in text, values masked for reporting. */
export function findSecretHits(text: string, max = 3): SecretHit[] {
  const hits: SecretHit[] = [];
  for (const p of SECRET_PATTERNS) {
    const re = new RegExp(p.re.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const match = m[0];
      const start = Math.max(0, m.index - 40);
      const ctx = text.slice(start, Math.min(text.length, m.index + match.length + 40));
      if (isAllowlistedSecretText(match) || isAllowlistedSecretText(ctx)) continue;
      hits.push({ id: p.id, masked: match.slice(0, 8) + "…" + match.slice(-4) });
      if (hits.length >= max) return hits;
      break; // one hit per pattern family
    }
  }
  return hits;
}

/** MCP env values that look like live credentials (not ${ENV} refs). */
export function looksLikeHardcodedSecret(value: string): boolean {
  const v = value.trim();
  if (!v || v.length < 8) return false;
  if (/^\$\{?[A-Z0-9_]+\}?$/i.test(v)) return false; // env var reference
  if (/^(true|false|null|undefined|\d+)$/i.test(v)) return false;
  if (isAllowlistedSecretText(v)) return false;
  if (findSecretHits(v, 1).length > 0) return true;
  // Long high-entropy-ish bare tokens
  if (/^[A-Za-z0-9_\-+/=]{32,}$/.test(v) && /[A-Za-z]/.test(v) && /\d/.test(v)) return true;
  return false;
}

/** npx/uvx-style runner arg without a version pin. */
export function isUnpinnedPackageArg(arg: string): boolean {
  if (!arg || arg.startsWith("-")) return false;
  if (arg.startsWith("@")) {
    const rest = arg.slice(1);
    const slash = rest.indexOf("/");
    if (slash < 0) return false;
    return !rest.slice(slash + 1).includes("@");
  }
  if (arg.includes("/") && !arg.startsWith(".")) return false; // paths / URLs
  return /^[a-z0-9][a-z0-9._-]*$/i.test(arg);
}
