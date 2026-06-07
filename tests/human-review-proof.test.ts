import { describe, it, expect } from "vitest";
import { canTransition } from "@/lib/review/review-decision";
import { buildVoicePlan } from "@/lib/voice/voice-plan-engine";
import { evaluateVoiceCompliance } from "@/lib/voice/voice-compliance-engine";
import { voiceInput } from "./factories";

// Human review proof. A recommendation or voice plan that still needs human
// review must never be treated as completed or executable. The existing
// ai-governance suite proves which inputs require review. These tests prove the
// downstream guarantee: needing review keeps the work out of the executable and
// completed states.

describe("recommendation review gating", () => {
  it("cannot execute a recommendation that is still pending review", () => {
    // Awaiting a human decision, the only legal moves are approve or reject.
    expect(canTransition("pending-review", "executed")).toBe(false);
    expect(canTransition("pending-review", "approved")).toBe(true);
    expect(canTransition("pending-review", "rejected")).toBe(true);
  });

  it("requires an approval step before execution is ever possible", () => {
    // There is no path from generated straight to executed. Execution is only
    // reachable from approved.
    expect(canTransition("generated", "executed")).toBe(false);
    expect(canTransition("approved", "executed")).toBe(true);
  });
});

describe("voice plan review gating", () => {
  it("flags a plan that needs review as requiring approval", () => {
    // An unapproved underlying recommendation forces needs-review.
    const compliance = evaluateVoiceCompliance(
      voiceInput({ reviewApproved: false }),
    );
    expect(compliance.status).toBe("needs-review");

    const plan = buildVoicePlan(voiceInput({ reviewApproved: false }));
    expect(plan.requiresApproval).toBe(true);
  });

  it("does not mark a clean approved plan as requiring approval", () => {
    const plan = buildVoicePlan(voiceInput());
    expect(plan.compliance.status).toBe("allowed");
    expect(plan.requiresApproval).toBe(false);
  });
});
