import { describe, it, expect } from "vitest";
import {
  buildScenarioSteps,
  resolveStepKey,
  SCENARIO_STEP_KEYS,
} from "@/lib/scenarios/scenario-steps";
import { runScenarioById } from "@/lib/scenarios/scenario-runner";

describe("SCENARIO_STEP_KEYS", () => {
  it("has the canonical seven steps in order", () => {
    expect(SCENARIO_STEP_KEYS).toEqual([
      "signal",
      "intelligence",
      "recommendation",
      "policy",
      "workflow",
      "outcome",
      "revenue",
    ]);
  });
});

describe("resolveStepKey", () => {
  it("returns signal for missing input", () => {
    expect(resolveStepKey(undefined)).toBe("signal");
    expect(resolveStepKey("")).toBe("signal");
  });
  it("returns signal for unknown step", () => {
    expect(resolveStepKey("unknown")).toBe("signal");
  });
  it("accepts a valid step key", () => {
    expect(resolveStepKey("revenue")).toBe("revenue");
    expect(resolveStepKey("policy")).toBe("policy");
  });
  it("reads the first element of an array param", () => {
    expect(resolveStepKey(["workflow", "ignored"])).toBe("workflow");
  });
});

describe("buildScenarioSteps", () => {
  const result = runScenarioById("automotive-high-intent");
  if (!result) {
    throw new Error("Expected automotive-high-intent scenario to exist");
  }
  const steps = buildScenarioSteps(result);

  it("returns one step per canonical key in order", () => {
    expect(steps).toHaveLength(SCENARIO_STEP_KEYS.length);
    expect(steps.map((step) => step.key)).toEqual(SCENARIO_STEP_KEYS);
  });

  it("indexes the steps sequentially", () => {
    steps.forEach((step, index) => {
      expect(step.index).toBe(index);
      expect(step.total).toBe(SCENARIO_STEP_KEYS.length);
    });
  });

  it("populates a headline and detail on every step", () => {
    for (const step of steps) {
      expect(step.headline.length).toBeGreaterThan(0);
      expect(step.detail.length).toBeGreaterThan(0);
      expect(step.label.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic across calls", () => {
    const again = runScenarioById("automotive-high-intent");
    if (!again) throw new Error("Expected scenario to exist");
    expect(buildScenarioSteps(again)).toEqual(steps);
  });
});
