import { describe, it, expect } from "vitest";
import {
  buildDemoSummary,
  DEMO_REJECTED_OVERRIDES,
  DEMO_STAGES,
} from "@/lib/demo/sixty-second-demo";

describe("DEMO_STAGES", () => {
  it("has the six canonical stages in order", () => {
    expect(DEMO_STAGES.map((stage) => stage.id)).toEqual([
      "signal",
      "intent",
      "recommendation",
      "review",
      "workflow",
      "revenue",
    ]);
  });

  it("indexes the stages sequentially", () => {
    DEMO_STAGES.forEach((stage, index) => {
      expect(stage.index).toBe(index);
    });
  });

  it("marks exactly one interactive stage and one terminal stage", () => {
    expect(DEMO_STAGES.filter((stage) => stage.interactive)).toHaveLength(1);
    expect(DEMO_STAGES.filter((stage) => stage.terminal)).toHaveLength(1);
    expect(DEMO_STAGES.find((stage) => stage.interactive)?.id).toBe("review");
    expect(DEMO_STAGES.find((stage) => stage.terminal)?.id).toBe("revenue");
  });

  it("gives every auto advancing stage a positive duration", () => {
    for (const stage of DEMO_STAGES) {
      if (!stage.interactive && !stage.terminal) {
        expect(stage.autoAdvanceMs).toBeGreaterThan(0);
      } else {
        expect(stage.autoAdvanceMs).toBe(0);
      }
    }
  });

  it("populates copy on every stage", () => {
    for (const stage of DEMO_STAGES) {
      expect(stage.headline.length).toBeGreaterThan(0);
      expect(stage.whatHappening.length).toBeGreaterThan(0);
      expect(stage.whyItMatters.length).toBeGreaterThan(0);
    }
  });
});

describe("buildDemoSummary", () => {
  it("attributes revenue on the approved path", () => {
    const summary = buildDemoSummary("approved");
    expect(summary.influencedRevenue).toBe("$4,200");
    expect(summary.reviewedActions).toContain("approved");
  });

  it("attributes no revenue on the rejected path", () => {
    const summary = buildDemoSummary("rejected");
    expect(summary.influencedRevenue).toBe("$0");
    expect(summary.reviewedActions).toContain("rejected");
    expect(summary.auditStatus).toBe("Complete");
  });

  it("is deterministic", () => {
    expect(buildDemoSummary("approved")).toEqual(buildDemoSummary("approved"));
    expect(buildDemoSummary("rejected")).toEqual(buildDemoSummary("rejected"));
  });
});

describe("DEMO_REJECTED_OVERRIDES", () => {
  it("only overrides stages that exist in the base set", () => {
    const baseIds = new Set(DEMO_STAGES.map((stage) => stage.id));
    for (const id of Object.keys(DEMO_REJECTED_OVERRIDES)) {
      expect(baseIds.has(id as (typeof DEMO_STAGES)[number]["id"])).toBe(true);
    }
  });

  it("provides an alternate workflow and revenue story", () => {
    expect(DEMO_REJECTED_OVERRIDES.workflow?.headline).toBeTruthy();
    expect(DEMO_REJECTED_OVERRIDES.revenue?.evidence).toBeTruthy();
  });
});
