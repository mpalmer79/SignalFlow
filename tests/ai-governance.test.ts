import { describe, it, expect } from "vitest";
import { scoreConfidence } from "@/lib/ai/ai-confidence";
import { determineReviewRequirement } from "@/lib/review/review-engine";
import {
  applyReviewDecision,
  canTransition,
} from "@/lib/review/review-decision";
import { aiInput, aiRecommendation } from "./factories";

describe("ai confidence engine", () => {
  it("is deterministic for identical input", () => {
    expect(scoreConfidence(aiInput())).toEqual(scoreConfidence(aiInput()));
  });

  it("stays within 0 to 100", () => {
    const high = scoreConfidence(
      aiInput({ intentScore: 100, opportunityScore: 100, engagementScore: 100, signalCount: 10 }),
    );
    const low = scoreConfidence(
      aiInput({
        intentScore: 0,
        opportunityScore: 0,
        engagementScore: 0,
        optedOut: true,
        riskFlags: [{ label: "x", severity: "critical" }],
      }),
    );
    expect(high.score).toBeLessThanOrEqual(100);
    expect(high.score).toBeGreaterThanOrEqual(0);
    expect(low.score).toBeGreaterThanOrEqual(0);
    expect(low.score).toBeLessThanOrEqual(100);
  });

  it("lowers confidence when the customer has opted out", () => {
    const base = scoreConfidence(aiInput()).score;
    const opted = scoreConfidence(aiInput({ optedOut: true })).score;
    expect(opted).toBeLessThan(base);
  });
});

describe("ai review engine", () => {
  it("requires review for a low confidence recommendation", () => {
    const rec = aiRecommendation({
      confidence: { score: 40, tier: "Low" },
    });
    const req = determineReviewRequirement(rec);
    expect(req.requiresReview).toBe(true);
    expect(req.reasons).toContain("CONFIDENCE_BELOW_THRESHOLD");
  });

  it("requires review for a high-risk recommendation", () => {
    const rec = aiRecommendation({
      explanation: {
        recommendation: "x",
        reasoningFactors: [],
        supportingSignals: [],
        riskConsiderations: ["Customer has opted out of contact."],
      },
    });
    const req = determineReviewRequirement(rec);
    expect(req.requiresReview).toBe(true);
    expect(req.reasons).toContain("COMPLIANCE_RISK");
  });

  it("requires review for legal intake regardless of confidence", () => {
    const rec = aiRecommendation({
      vertical: "legal-intake",
      confidence: { score: 95, tier: "Very High" },
    });
    expect(determineReviewRequirement(rec).requiresReview).toBe(true);
  });

  it("does not require review for a clean, high confidence automotive recommendation", () => {
    const rec = aiRecommendation({
      confidence: { score: 90, tier: "Very High" },
      explanation: {
        recommendation: "x",
        reasoningFactors: [],
        supportingSignals: [],
        riskConsiderations: ["No risk flags."],
      },
    });
    expect(determineReviewRequirement(rec).requiresReview).toBe(false);
  });
});

describe("ai review decision state machine", () => {
  it("rejected recommendations move to a rejected, non-executable state", () => {
    const result = applyReviewDecision("rejected");
    expect(result.recommendationStatus).toBe("rejected");
    expect(canTransition("rejected", "executed")).toBe(false);
    expect(canTransition("rejected", "approved")).toBe(false);
  });

  it("approved recommendations may be executed", () => {
    const result = applyReviewDecision("approved");
    expect(result.recommendationStatus).toBe("approved");
    expect(canTransition("approved", "executed")).toBe(true);
  });

  it("cannot skip from generated to executed", () => {
    expect(canTransition("generated", "executed")).toBe(false);
  });
});
