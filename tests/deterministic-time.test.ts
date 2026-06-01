import { describe, it, expect } from "vitest";
import { spreadTimestamp } from "@/lib/utils/deterministic-time";

const base = "2026-01-15T12:00:00.000Z";

describe("spreadTimestamp", () => {
  it("is deterministic for the same inputs", () => {
    expect(spreadTimestamp(base, "abc", 24)).toBe(
      spreadTimestamp(base, "abc", 24),
    );
  });
  it("produces a value at or before the base", () => {
    const result = new Date(spreadTimestamp(base, "abc", 24)).getTime();
    expect(result).toBeLessThanOrEqual(new Date(base).getTime());
  });
  it("stays within the requested window", () => {
    const result = new Date(spreadTimestamp(base, "abc", 4)).getTime();
    const diffHours = (new Date(base).getTime() - result) / 3_600_000;
    expect(diffHours).toBeGreaterThanOrEqual(0);
    expect(diffHours).toBeLessThan(4);
  });
  it("yields different offsets for different ids in the same window", () => {
    const a = spreadTimestamp(base, "id-a", 24);
    const b = spreadTimestamp(base, "id-b", 24);
    expect(a).not.toBe(b);
  });
});
