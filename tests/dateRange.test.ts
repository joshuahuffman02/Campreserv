import { describe, expect, it } from "vitest";
import { normalizeDateRange, rangesOverlap } from "../src/utils/dateRange";

describe("date ranges", () => {
  it("detects overlaps correctly", () => {
    const a = { start: new Date("2024-01-01"), end: new Date("2024-01-05") };
    const b = { start: new Date("2024-01-04"), end: new Date("2024-01-10") };
    const c = { start: new Date("2024-01-05"), end: new Date("2024-01-06") };
    expect(rangesOverlap(a, b)).toBe(true);
    expect(rangesOverlap(a, c)).toBe(false);
  });

  it("normalizes and validates dates", () => {
    const range = normalizeDateRange("2024-01-01", "2024-01-03");
    expect(range.start.toISOString()).toContain("2024-01-01");
    expect(range.end.toISOString()).toContain("2024-01-03");
    expect(() => normalizeDateRange("2024-01-03", "2024-01-01")).toThrow();
  });
});
