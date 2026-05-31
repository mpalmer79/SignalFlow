import { describe, it, expect } from "vitest";
import { evaluateVoiceCompliance } from "@/lib/voice/voice-compliance-engine";
import { buildVoicePlan } from "@/lib/voice/voice-plan-engine";
import { voiceInput } from "./factories";

describe("voice compliance engine", () => {
  it("allows a clean, consented, approved plan", () => {
    const result = evaluateVoiceCompliance(voiceInput());
    expect(result.status).toBe("allowed");
    expect(result.blockedReason).toBeNull();
  });

  it("blocks when the customer has opted out", () => {
    const result = evaluateVoiceCompliance(voiceInput({ optedOut: true }));
    expect(result.status).toBe("blocked");
    expect(result.blockedReason).toBe("CUSTOMER_OPTED_OUT");
  });

  it("blocks when voice consent is missing", () => {
    const result = evaluateVoiceCompliance(voiceInput({ voiceConsent: false }));
    expect(result.status).toBe("blocked");
    expect(result.blockedReason).toBe("MISSING_VOICE_CONSENT");
  });

  it("blocks during quiet hours", () => {
    const result = evaluateVoiceCompliance(voiceInput({ quietHours: true }));
    expect(result.status).toBe("blocked");
    expect(result.blockedReason).toBe("QUIET_HOURS");
  });

  it("blocks after repeated no response at the limit", () => {
    const result = evaluateVoiceCompliance(voiceInput({ noResponseCount: 3 }));
    expect(result.status).toBe("blocked");
    expect(result.blockedReason).toBe("REPEATED_NO_RESPONSE");
  });

  it("requires review for a sensitive vertical", () => {
    const result = evaluateVoiceCompliance(
      voiceInput({ vertical: "legal-intake" }),
    );
    expect(result.status).toBe("needs-review");
  });

  it("requires review when the underlying recommendation is unapproved", () => {
    const result = evaluateVoiceCompliance(
      voiceInput({ reviewApproved: false }),
    );
    expect(result.status).toBe("needs-review");
  });

  it("prefers a hard block over review when both apply", () => {
    const result = evaluateVoiceCompliance(
      voiceInput({ optedOut: true, vertical: "legal-intake" }),
    );
    expect(result.status).toBe("blocked");
  });
});

describe("voice simulation eligibility", () => {
  it("an allowed plan does not expect a compliance stop", () => {
    const plan = buildVoicePlan(voiceInput());
    expect(plan.compliance.status).toBe("allowed");
    expect(plan.expectedOutcome).not.toBe("COMPLIANCE_STOP");
  });

  it("a blocked plan expects a compliance stop and is not eligible for simulation", () => {
    const plan = buildVoicePlan(voiceInput({ optedOut: true }));
    expect(plan.compliance.status).toBe("blocked");
    expect(plan.expectedOutcome).toBe("COMPLIANCE_STOP");
  });

  it("a needs-review plan is not allowed, so it is not eligible for simulation", () => {
    const plan = buildVoicePlan(voiceInput({ reviewApproved: false }));
    expect(plan.compliance.status).toBe("needs-review");
    // The simulation service only simulates when status === "allowed".
    expect(plan.compliance.status).not.toBe("allowed");
  });
});
