import { describe, it, expect } from "vitest";
import { validateWorkflow } from "@/lib/orchestrator/workflow-validator";
import { applyAttributionFactor } from "@/lib/attribution/attribution-calculator";
import { ATTRIBUTION_FACTORS } from "@/lib/outcomes/outcome-config";
import type { ActionPlan } from "@/lib/types/orchestrator";

import type { ActionNode, ActionEdge } from "@/lib/types/orchestrator";

function node(id: string, actionType: ActionNode["actionType"]): ActionNode {
  return {
    id,
    actionType,
    channel: null,
    reason: "test",
    status: "planned",
    allowed: true,
    blockedReason: null,
    recommendedAt: "2026-01-01T00:00:00.000Z",
  };
}

function edge(
  from: string,
  to: string,
  kind: ActionEdge["kind"],
  waitMinutes?: number,
): ActionEdge {
  return { from, to, kind, waitMinutes, label: "test" };
}

function plan(overrides: Partial<ActionPlan> = {}): ActionPlan {
  return {
    nodes: [node("a", "SEND_SMS"), node("b", "CREATE_TASK")],
    edges: [edge("a", "b", "then")],
    ...overrides,
  };
}

describe("workflow validator", () => {
  it("accepts a well formed plan", () => {
    expect(validateWorkflow(plan()).valid).toBe(true);
  });

  it("rejects an empty plan", () => {
    const result = validateWorkflow(plan({ nodes: [], edges: [] }));
    expect(result.valid).toBe(false);
    expect(result.issues.join(" ")).toMatch(/no actions/i);
  });

  it("rejects duplicate action ids", () => {
    const dup = plan({ nodes: [node("a", "SEND_SMS"), node("a", "CREATE_TASK")], edges: [] });
    expect(validateWorkflow(dup).valid).toBe(false);
  });

  it("rejects an edge to an unknown node", () => {
    const bad = plan({ edges: [edge("a", "zzz", "then")] });
    expect(validateWorkflow(bad).valid).toBe(false);
  });

  it("rejects a wait edge with no positive duration", () => {
    const bad = plan({ edges: [edge("a", "b", "wait", 0)] });
    expect(validateWorkflow(bad).valid).toBe(false);
  });
});

describe("revenue attribution bounds", () => {
  it("each attribution factor is a fraction between 0 and 1", () => {
    for (const factor of Object.values(ATTRIBUTION_FACTORS)) {
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    }
  });

  it("attributed amount never exceeds the base opportunity value", () => {
    const base = 30000;
    for (const type of Object.keys(ATTRIBUTION_FACTORS) as Array<
      keyof typeof ATTRIBUTION_FACTORS
    >) {
      const amount = applyAttributionFactor(type, base);
      expect(amount).toBeLessThanOrEqual(base);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });

  it("attribution is deterministic", () => {
    expect(applyAttributionFactor("INFLUENCED", 30000)).toBe(
      applyAttributionFactor("INFLUENCED", 30000),
    );
  });
});
