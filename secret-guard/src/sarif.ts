import type { ScanReport } from "./types.js";

/** Minimal SARIF 2.1.0 for GitHub Code Scanning / CI. */
export function toSarif(report: ScanReport): object {
  const results = report.findings
    .filter((f) => f.severity === "error" || f.severity === "warn")
    .map((f) => ({
      ruleId: f.pattern,
      level: f.severity === "error" ? "error" : "warning",
      message: { text: f.message },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: f.file.replace(/\\/g, "/") },
            region: {
              startLine: f.line ?? 1,
              startColumn: f.column ?? 1,
            },
          },
        },
      ],
      properties: {
        kind: f.kind,
        snippet: f.snippet,
        fix: f.fix,
      },
    }));

  const ruleIds = [...new Set(results.map((r) => r.ruleId as string))];

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "secret-guard",
            informationUri: "https://github.com/bhaskarpandey2708/ai-instruct-sync/tree/main/secret-guard",
            version: "0.1.0-beta.0",
            rules: ruleIds.map((id) => ({
              id,
              shortDescription: { text: `Secret pattern: ${id}` },
              help: {
                text: "Remove secrets from AI agent configs and MCP env; use a secret manager.",
              },
            })),
          },
        },
        results,
      },
    ],
  };
}
