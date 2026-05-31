import type { OutcomeContext, OutcomeEvent } from "@/lib/types/outcome";

// Deterministically classify a workflow run context into outcome events. The
// rules are fixed and ordered, so the same context always yields the same
// events. No randomness and no model output.
export function classifyOutcomes(context: OutcomeContext): OutcomeEvent[] {
  const events: OutcomeEvent[] = [];

  // Compliance stop dominates everything else.
  if (context.optedOut || context.workflowOutcome === "paused") {
    events.push({
      outcomeType: "COMPLIANCE_STOP",
      reason: "Customer opted out, so outreach stopped.",
      confidence: 100,
      actionType: "PAUSE_OUTREACH",
    });
    return events;
  }

  const executed = new Set(context.executedActionTypes);
  const blocked = new Set(context.blockedActionTypes);

  // Blocked actions become explicit outcome events.
  for (const actionType of context.blockedActionTypes) {
    events.push({
      outcomeType: "ACTION_BLOCKED",
      reason: `${actionType} was blocked by the policy layer.`,
      confidence: 100,
      actionType,
    });
  }

  // Positive engagement outcomes from executed channels.
  if (executed.has("SEND_EMAIL")) {
    events.push({
      outcomeType: "EMAIL_OPENED",
      reason: "Email was delivered and engagement is inferred from intent.",
      confidence: context.engagementScore >= 50 ? 70 : 45,
      actionType: "SEND_EMAIL",
    });
  }

  const repliedLikely =
    (executed.has("SEND_SMS") || executed.has("SEND_EMAIL")) &&
    context.engagementScore >= 55 &&
    context.hasRecentResponse;
  if (repliedLikely) {
    events.push({
      outcomeType: "CUSTOMER_REPLIED",
      reason: "Engagement signals indicate the customer responded.",
      confidence: 75,
      actionType: executed.has("SEND_SMS") ? "SEND_SMS" : "SEND_EMAIL",
    });
  }

  // Appointment outcomes.
  if (executed.has("BOOK_APPOINTMENT")) {
    events.push({
      outcomeType: "APPOINTMENT_SCHEDULED",
      reason: "An appointment booking action executed in simulation.",
      confidence: 80,
      actionType: "BOOK_APPOINTMENT",
    });
    if (context.intentScore >= 80) {
      events.push({
        outcomeType: "APPOINTMENT_CONFIRMED",
        reason: "High intent supports appointment confirmation.",
        confidence: 65,
        actionType: "BOOK_APPOINTMENT",
      });
    }
  } else if (
    context.intentScore >= 70 &&
    context.opportunityScore >= 70 &&
    (executed.has("SEND_SMS") || executed.has("SEND_EMAIL")) &&
    context.opportunity !== null
  ) {
    // High intent purchase paths schedule an appointment downstream.
    events.push({
      outcomeType: "APPOINTMENT_SCHEDULED",
      reason: "High intent and opportunity value lead to a scheduled appointment.",
      confidence: 60,
      actionType: "SEND_SMS",
    });
  }

  // Human handling outcomes.
  if (context.workflowOutcome === "escalated" || executed.has("CREATE_TASK")) {
    events.push({
      outcomeType: "HUMAN_TASK_CREATED",
      reason: "A human task was created for follow-up.",
      confidence: 90,
      actionType: "CREATE_TASK",
    });
    if (context.intentScore >= 75 && !context.hasCriticalRisk) {
      events.push({
        outcomeType: "HUMAN_HANDOFF_COMPLETED",
        reason: "High intent supports a completed human handoff.",
        confidence: 55,
        actionType: "ESCALATE_MANAGER",
      });
    }
  }

  // No response when nothing engaged the customer.
  const noEngagement =
    !context.hasRecentResponse &&
    context.engagementScore < 45 &&
    !executed.has("BOOK_APPOINTMENT");
  if (noEngagement && (executed.size > 0 || blocked.size > 0)) {
    events.push({
      outcomeType: "NO_RESPONSE",
      reason: "No engagement was observed after the workflow ran.",
      confidence: 60,
      actionType: null,
    });
  }

  return events;
}
