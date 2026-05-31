import type {
  VoiceComplianceCheck,
  VoiceComplianceResult,
  VoicePlanInput,
} from "@/lib/types/voice";

// A customer with this many or more prior no-response calls is held back so a
// human can decide whether to keep calling.
export const REPEATED_NO_RESPONSE_LIMIT = 3;

// Verticals whose content is sensitive enough that a voice call always routes
// to a human before it can proceed.
const SENSITIVE_VERTICALS = new Set(["legal-intake", "medical"]);

// Run the deterministic voice compliance checks. A call is allowed only when
// every hard check passes. A sensitive vertical or a high risk flag downgrades
// an otherwise allowed call to needs-review rather than blocking it outright.
export function evaluateVoiceCompliance(
  input: VoicePlanInput,
): VoiceComplianceResult {
  const checks: VoiceComplianceCheck[] = [];

  // Hard blocks. Any failure here blocks the call.
  const optedOutPassed = !input.optedOut;
  checks.push({
    passed: optedOutPassed,
    reason: optedOutPassed ? null : "CUSTOMER_OPTED_OUT",
    detail: optedOutPassed
      ? "Customer has not opted out of contact."
      : "Customer has opted out of all contact.",
  });

  const consentPassed = input.voiceConsent;
  checks.push({
    passed: consentPassed,
    reason: consentPassed ? null : "MISSING_VOICE_CONSENT",
    detail: consentPassed
      ? "Voice consent is on file."
      : "No voice consent is on file for this customer.",
  });

  const quietHoursPassed = !input.quietHours;
  checks.push({
    passed: quietHoursPassed,
    reason: quietHoursPassed ? null : "QUIET_HOURS",
    detail: quietHoursPassed
      ? "Current time is outside quiet hours."
      : "Quiet hours are active for this customer.",
  });

  const noResponsePassed =
    input.noResponseCount < REPEATED_NO_RESPONSE_LIMIT;
  checks.push({
    passed: noResponsePassed,
    reason: noResponsePassed ? null : "REPEATED_NO_RESPONSE",
    detail: noResponsePassed
      ? `Prior no-response count is ${input.noResponseCount}.`
      : `Prior no-response count is ${input.noResponseCount}, at or above the limit of ${REPEATED_NO_RESPONSE_LIMIT}.`,
  });

  // Soft checks. These do not block, but they require human review.
  const sensitive = SENSITIVE_VERTICALS.has(input.vertical);
  const hasCriticalRisk = input.riskFlags.some(
    (flag) => flag.severity === "critical",
  );
  const reviewNotApproved = !input.reviewApproved;

  checks.push({
    passed: !sensitive,
    reason: sensitive ? "COMPLIANCE_SENSITIVE" : null,
    detail: sensitive
      ? "Vertical is compliance sensitive and requires human approval."
      : "Vertical is not compliance sensitive.",
  });

  checks.push({
    passed: !reviewNotApproved,
    reason: reviewNotApproved ? "HUMAN_REVIEW_REQUIRED" : null,
    detail: reviewNotApproved
      ? "The underlying AI recommendation has not been approved by a human."
      : "The underlying AI recommendation has been approved.",
  });

  // Resolve the verdict. Hard blocks take precedence over review.
  const hardBlock = checks.find(
    (check) =>
      !check.passed &&
      (check.reason === "CUSTOMER_OPTED_OUT" ||
        check.reason === "MISSING_VOICE_CONSENT" ||
        check.reason === "QUIET_HOURS" ||
        check.reason === "REPEATED_NO_RESPONSE"),
  );

  if (hardBlock) {
    return {
      status: "blocked",
      blockedReason: hardBlock.reason,
      checks,
      summary: hardBlock.detail,
    };
  }

  if (sensitive || hasCriticalRisk || reviewNotApproved) {
    const reason = sensitive
      ? "COMPLIANCE_SENSITIVE"
      : reviewNotApproved
        ? "HUMAN_REVIEW_REQUIRED"
        : "COMPLIANCE_SENSITIVE";
    return {
      status: "needs-review",
      blockedReason: reason,
      checks,
      summary: sensitive
        ? "Sensitive vertical. A human must approve before this call can proceed."
        : reviewNotApproved
          ? "The AI recommendation is awaiting human review."
          : "A critical risk flag requires human review before calling.",
    };
  }

  return {
    status: "allowed",
    blockedReason: null,
    checks,
    summary: "All voice compliance checks passed. The call may proceed.",
  };
}
