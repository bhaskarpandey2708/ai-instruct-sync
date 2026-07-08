import { describe, expect, it } from "vitest";
import { rulesEqual } from "../src/core.js";
import type { RuleMap } from "../src/types.js";

const sample: RuleMap = {
  "naming": { id: "naming", content: "Use camelCase" }
};

describe("rulesEqual", () => {
  it("detects equality", () => {
    expect(rulesEqual(sample, { ...sample })).toBe(true);
  });
  it("detects difference", () => {
    expect(rulesEqual(sample, { naming: { id: "naming", content: "Use PascalCase" } })).toBe(false);
  });
});
