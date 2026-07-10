/**
 * Tough fixture-based tests for ai-setup-doctor.
 * Run: node --test tests/hard.test.mjs
 * (after npm run build)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  runChecks,
  severityScore,
  worstSeverity,
  filterBySeverity,
  sortChecks,
  computeScore,
} from "../dist/core.js";
import {
  findSecretHits,
  isAllowlistedSecretText,
  findInstructionContradictions,
  isUnpinnedPackageArg,
} from "../dist/patterns.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = join(root, "fixtures");

function doctor(name, extra = {}) {
  return runChecks({
    cwd: join(fixtures, name),
    includeUserConfigs: false,
    ...extra,
  });
}

function ids(report) {
  return report.checks.map((c) => c.id);
}

function byId(report, id) {
  return report.checks.find((c) => c.id === id);
}

function hasSeverity(report, severity) {
  return report.checks.some((c) => c.severity === severity);
}

function hasIdMatching(report, re) {
  return report.checks.some((c) => re.test(c.id));
}

// ─── Unit: scoring helpers ───────────────────────────────────────────────────

describe("scoring helpers", () => {
  it("severityScore matches summary.score", () => {
    const r = doctor("healthy");
    assert.equal(severityScore(r), r.summary.score);
  });

  it("worstSeverity escalates to error when present", () => {
    const r = doctor("leaky-secrets");
    assert.equal(worstSeverity(r), "error");
  });

  it("filterBySeverity keeps warn+error", () => {
    const r = doctor("leaky-secrets");
    const hard = filterBySeverity(r, "warn");
    assert.ok(hard.length > 0);
    assert.ok(hard.every((c) => c.severity === "warn" || c.severity === "error"));
  });
});

// ─── Healthy baseline ────────────────────────────────────────────────────────

describe("fixture: healthy", () => {
  it("has no errors when hermetic", () => {
    const r = doctor("healthy");
    assert.equal(r.summary.error, 0, ids(r).join(", "));
    assert.ok(r.summary.score >= 85, `score ${r.summary.score}`);
    assert.ok(byId(r, "agents-found") || byId(r, "agents-none"));
    assert.ok(byId(r, "secrets-clean") || !hasSeverity(r, "error"));
    assert.ok(byId(r, "env-ignored"));
  });

  it("detects Cursor + AGENTS.md", () => {
    const r = doctor("healthy");
    const agents = byId(r, "agents-found");
    assert.ok(agents, "expected agents-found");
    assert.match(agents.message, /Cursor/);
    assert.match(agents.message, /AGENTS\.md/);
  });

  it("parses healthy MCP servers", () => {
    const r = doctor("healthy", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /^mcp-servers-/));
    assert.equal(r.summary.error, 0);
  });
});

// ─── Broken MCP (invalid JSON, empty, no transport) ──────────────────────────

describe("fixture: broken-mcp", () => {
  it("flags invalid JSON as error", () => {
    const r = doctor("broken-mcp", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /mcp-json/), `ids: ${ids(r).join(", ")}`);
    assert.ok(hasSeverity(r, "error"));
  });

  it("flags empty mcpServers", () => {
    const r = doctor("broken-mcp", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /mcp-empty/), `ids: ${ids(r).join(", ")}`);
  });

  it("score is penalized heavily", () => {
    const r = doctor("broken-mcp", { only: ["mcp"] });
    assert.ok(r.summary.score <= 75, `score ${r.summary.score}`);
  });
});

// ─── Leaky secrets (rules + .env not ignored + private key) ──────────────────

describe("fixture: leaky-secrets", () => {
  it("detects secret patterns in rule files", () => {
    const r = doctor("leaky-secrets", { only: ["secrets"] });
    const found = byId(r, "secrets-found");
    assert.ok(found, `ids: ${ids(r).join(", ")}`);
    assert.equal(found.severity, "error");
    assert.ok(found.detail && found.detail.length > 0);
  });

  it("flags .env not gitignored", () => {
    const r = doctor("leaky-secrets", { only: ["secrets"] });
    assert.ok(byId(r, "env-not-ignored"), ids(r).join(", "));
  });

  it("exits-level: worst is error", () => {
    assert.equal(worstSeverity(doctor("leaky-secrets")), "error");
  });
});

// ─── Multi-agent instruction drift ───────────────────────────────────────────

describe("fixture: multi-drift", () => {
  it("detects multiple agents", () => {
    const r = doctor("multi-drift", { only: ["agents"] });
    assert.ok(byId(r, "agents-found"));
    assert.ok(byId(r, "agents-multi"));
  });

  it("detects AGENTS.md vs CLAUDE.md drift", () => {
    const r = doctor("multi-drift", { only: ["agents"] });
    assert.ok(
      hasIdMatching(r, /agents-drift-AGENTS\.md-CLAUDE\.md/),
      `ids: ${ids(r).join(", ")}`,
    );
  });

  it("detects CLAUDE vs GEMINI drift", () => {
    const r = doctor("multi-drift", { only: ["agents"] });
    assert.ok(hasIdMatching(r, /agents-drift/), ids(r).join(", "));
    const drifts = r.checks.filter((c) => c.id.startsWith("agents-drift"));
    assert.ok(drifts.length >= 2, `expected >=2 drifts, got ${drifts.length}`);
  });
});

// ─── Placeholders ────────────────────────────────────────────────────────────

describe("fixture: placeholders", () => {
  it("warns on CHANGE_ME / your-api-key", () => {
    const r = doctor("placeholders", { only: ["hygiene"] });
    const p = byId(r, "placeholders-found");
    assert.ok(p, ids(r).join(", "));
    assert.equal(p.severity, "warn");
  });
});

// ─── Empty agent shells ──────────────────────────────────────────────────────

describe("fixture: empty-agents", () => {
  it("warns on empty .cursor directory", () => {
    const r = doctor("empty-agents", { only: ["agents"] });
    // Either empty shell or agents-found with empty shell check
    const empty = byId(r, "agents-empty-shell");
    assert.ok(empty, `expected empty shell warning; ids: ${ids(r).join(", ")}`);
    assert.equal(empty.severity, "warn");
  });
});

// ─── MCP hardcoded env / args / bad url ──────────────────────────────────────

describe("fixture: mcp-hardcoded-env", () => {
  it("errors on hardcoded GITHUB token in env", () => {
    const r = doctor("mcp-hardcoded-env", { only: ["mcp", "secrets"] });
    assert.ok(
      hasIdMatching(r, /env-secrets/),
      `ids: ${ids(r).join(", ")}`,
    );
  });

  it("errors on secret in MCP args", () => {
    const r = doctor("mcp-hardcoded-env", { only: ["mcp", "secrets"] });
    assert.ok(hasIdMatching(r, /arg-secret/), ids(r).join(", "));
  });

  it("warns on non-http url", () => {
    const r = doctor("mcp-hardcoded-env", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /bad-url/), ids(r).join(", "));
  });

  it("notes disabled server without hard error for transport", () => {
    const r = doctor("mcp-hardcoded-env", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /disabled/), ids(r).join(", "));
    // ghost has no command/url but disabled — should NOT get no-transport
    const noTransportOnGhost = r.checks.find(
      (c) => c.id.includes("ghost") && c.id.includes("no-transport"),
    );
    assert.equal(noTransportOnGhost, undefined);
  });
});

// ─── Bloat rules ─────────────────────────────────────────────────────────────

describe("fixture: bloat-rules", () => {
  it("warns on oversized rule file", () => {
    const r = doctor("bloat-rules", { only: ["hygiene"] });
    assert.ok(
      hasIdMatching(r, /rules-file-bloat|rules-bloat/),
      ids(r).join(", "),
    );
  });
});

// ─── Missing README ──────────────────────────────────────────────────────────

describe("fixture: no-readme", () => {
  it("warns when README missing", () => {
    const r = doctor("no-readme", { only: ["hygiene"] });
    assert.ok(byId(r, "readme-missing"), ids(r).join(", "));
  });
});

// ─── Bad package.json ────────────────────────────────────────────────────────

describe("fixture: bad-package", () => {
  it("errors on invalid package.json JSON", () => {
    const r = doctor("bad-package", { only: ["hygiene"] });
    assert.ok(byId(r, "package-json-invalid"), ids(r).join(", "));
    assert.equal(worstSeverity(r), "error");
  });
});

// ─── Category filters ────────────────────────────────────────────────────────

describe("category filters", () => {
  it("--only secrets excludes agents checks", () => {
    const r = doctor("healthy", { only: ["secrets"] });
    assert.ok(r.checks.every((c) => c.category === "secrets"));
  });

  it("--skip mcp removes mcp category", () => {
    const r = doctor("broken-mcp", { skip: ["mcp"] });
    assert.ok(!r.checks.some((c) => c.category === "mcp"));
  });

  it("includeUserConfigs false keeps fixtures hermetic", () => {
    const r = doctor("healthy", { only: ["mcp"] });
    // Should only see project MCP, not Claude Desktop from user home
    assert.ok(!r.checks.some((c) => /Claude Desktop/.test(c.title + c.message + (c.detail || ""))));
  });
});

// ─── Report shape ────────────────────────────────────────────────────────────

describe("report contract", () => {
  it("always returns required fields", () => {
    const r = doctor("healthy");
    assert.equal(typeof r.cwd, "string");
    assert.equal(typeof r.checkedAt, "string");
    assert.equal(typeof r.node, "string");
    assert.equal(typeof r.platform, "string");
    assert.ok(Array.isArray(r.checks));
    assert.ok(r.checks.length > 0);
    for (const c of r.checks) {
      assert.ok(c.id && c.title && c.category && c.severity && c.message);
    }
    const s = r.summary;
    assert.equal(s.ok + s.info + s.warn + s.error, r.checks.length);
    assert.ok(s.score >= 0 && s.score <= 100);
    assert.ok(s.byCategory && typeof s.byCategory === "object");
    assert.ok(s.byCategory.secrets);
  });

  it("sorts errors before ok checks", () => {
    const r = doctor("leaky-secrets");
    const ranks = { error: 0, warn: 1, info: 2, ok: 3 };
    for (let i = 1; i < r.checks.length; i++) {
      assert.ok(
        ranks[r.checks[i - 1].severity] <= ranks[r.checks[i].severity],
        `order broken at ${i}: ${r.checks[i - 1].severity} then ${r.checks[i].severity}`,
      );
    }
  });
});

// ─── Pattern unit strength ───────────────────────────────────────────────────

describe("secret allowlist + patterns", () => {
  it("ignores classic AWS docs example key", () => {
    assert.ok(isAllowlistedSecretText("AKIAIOSFODNN7EXAMPLE"));
    assert.equal(findSecretHits("Use AKIAIOSFODNN7EXAMPLE in docs", 3).length, 0);
  });

  it("flags real-looking AWS access keys", () => {
    const hits = findSecretHits("key AKIA0NOTDOCSKEY12345 here", 3);
    assert.ok(hits.some((h) => h.id === "aws-key"), JSON.stringify(hits));
  });

  it("detects always/never contradictions", () => {
    const c = findInstructionContradictions(
      "Always use npm for installs.\nNever use npm for installs.",
    );
    assert.ok(c.length >= 1, c.join("; "));
  });

  it("detects unpinned npx package args", () => {
    assert.equal(isUnpinnedPackageArg("@modelcontextprotocol/server-filesystem"), true);
    assert.equal(isUnpinnedPackageArg("@modelcontextprotocol/server-filesystem@0.6.2"), false);
    assert.equal(isUnpinnedPackageArg("foo@1.0.0"), false);
    assert.equal(isUnpinnedPackageArg("left-pad"), true);
  });

  it("computeScore caps category penalties", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      title: "t",
      category: "mcp",
      severity: "error",
      message: "m",
    }));
    const { score, byCategory, totalPenalty } = computeScore(many);
    assert.equal(byCategory.mcp.penalty, 50); // cap
    assert.equal(totalPenalty, 50);
    assert.equal(score, 50);
  });

  it("sortChecks is stable by severity", () => {
    const sorted = sortChecks([
      { id: "a", title: "a", category: "hygiene", severity: "ok", message: "" },
      { id: "b", title: "b", category: "secrets", severity: "error", message: "" },
      { id: "c", title: "c", category: "mcp", severity: "warn", message: "" },
    ]);
    assert.equal(sorted[0].severity, "error");
    assert.equal(sorted[1].severity, "warn");
    assert.equal(sorted[2].severity, "ok");
  });
});

// ─── New tough fixtures ──────────────────────────────────────────────────────

describe("fixture: docs-false-positive", () => {
  it("does not error on documentation sample secrets", () => {
    const r = doctor("docs-false-positive", { only: ["secrets"] });
    assert.ok(byId(r, "secrets-clean"), ids(r).join(", "));
    assert.equal(r.summary.error, 0);
  });
});

describe("fixture: rule-conflicts", () => {
  it("flags always/never contradictions", () => {
    const r = doctor("rule-conflicts", { only: ["agents"] });
    assert.ok(byId(r, "rules-contradiction"), ids(r).join(", "));
  });

  it("flags empty rule stubs", () => {
    const r = doctor("rule-conflicts", { only: ["agents"] });
    assert.ok(byId(r, "rules-empty-files"), ids(r).join(", "));
  });

  it("flags broken mdc frontmatter", () => {
    const r = doctor("rule-conflicts", { only: ["agents"] });
    assert.ok(hasIdMatching(r, /rules-mdc-frontmatter/), ids(r).join(", "));
  });

  it("notes legacy .cursorrules", () => {
    const r = doctor("rule-conflicts", { only: ["agents"] });
    assert.ok(byId(r, "rules-legacy-cursorrules"), ids(r).join(", "));
  });
});

describe("fixture: mcp-unpinned", () => {
  it("warns on unpinned npx package", () => {
    const r = doctor("mcp-unpinned", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /unpinned/), ids(r).join(", "));
  });

  it("warns when MCP command not on PATH", () => {
    const r = doctor("mcp-unpinned", { only: ["mcp"] });
    assert.ok(hasIdMatching(r, /cmd-missing/), ids(r).join(", "));
  });
});

describe("fixture: mcp-jsonc", () => {
  it("errors on JSONC comments with clear message", () => {
    const r = doctor("mcp-jsonc", { only: ["mcp"] });
    const hit = r.checks.find((c) => c.id.startsWith("mcp-json-"));
    assert.ok(hit, ids(r).join(", "));
    assert.equal(hit.severity, "error");
    assert.match(hit.message, /JSONC|comments/i);
  });
});

describe("fixture: env-example-leak", () => {
  it("errors when .env.example holds live-looking keys", () => {
    const r = doctor("env-example-leak", { only: ["secrets"] });
    assert.ok(byId(r, "env-example-secrets"), ids(r).join(", "));
    assert.equal(worstSeverity(r), "error");
  });
});
