import type { Channel, ConsentState } from "@/lib/types/consent";
import type {
  ActionType,
  PolicyEvaluation,
} from "@/lib/types/orchestrator";
import { channelForAction } from "@/lib/action-graph/action-node";

// The minimal customer policy context the action policy engine needs. It is
// derived from persisted consent without any framework or Prisma dependency.
export interface ActionPolicyContext {
  optedOut: boolean;
  channelConsent: Record<Channel, ConsentState>;
  medicalSensitive: boolean;
  withinQuietHours: boolean;
  highValue: boolean;
}

const CHANNEL_LABEL: Record<Channel, string> = {
  sms: "SMS",
  email: "email",
  voice: "voice",
  human: "human",
};

// Evaluate a single action against the policy context. The result is a
// deterministic allowed, blocked, or needs-review decision with an explanation.
export function evaluateAction(
  actionType: ActionType,
  context: ActionPolicyContext,
): PolicyEvaluation {
  // Pausing outreach is always permitted, since it is a stop action.
  if (actionType === "PAUSE_OUTREACH") {
    return {
      outcome: "allowed",
      reason: "stop-action",
      explanation: "Pausing outreach is always permitted.",
    };
  }

  if (context.optedOut) {
    return {
      outcome: "blocked",
      reason: "customer-opted-out",
      explanation: "The customer opted out, so outreach actions are blocked.",
    };
  }

  // Human handling actions route through review rather than channel consent.
  if (
    actionType === "ESCALATE_MANAGER" ||
    actionType === "REVIEW_OPPORTUNITY" ||
    actionType === "CREATE_TASK" ||
    actionType === "ASSIGN_OWNER"
  ) {
    if (context.medicalSensitive || context.highValue) {
      return {
        outcome: "needs-review",
        reason: "human-review-required",
        explanation: "This action is routed to a human for review.",
      };
    }
    return {
      outcome: "allowed",
      reason: "human-task",
      explanation: "A human task does not require channel consent.",
    };
  }

  if (context.medicalSensitive) {
    return {
      outcome: "needs-review",
      reason: "medical-sensitive-message",
      explanation:
        "Medical sensitive content requires human review before any send.",
    };
  }

  const channel = channelForAction(actionType);
  if (channel === null) {
    // Appointment and close actions do not touch a customer channel.
    return {
      outcome: "allowed",
      reason: "no-channel-required",
      explanation: "This action does not require channel consent.",
    };
  }

  const consent = context.channelConsent[channel];
  if (consent !== "granted") {
    return {
      outcome: "blocked",
      reason: `missing-${channel}-consent`,
      explanation: `Missing ${CHANNEL_LABEL[channel]} consent blocks this action until consent is captured.`,
    };
  }

  if (context.withinQuietHours) {
    return {
      outcome: "blocked",
      reason: "quiet-hours",
      explanation: "The current time falls inside the customer quiet hours window.",
    };
  }

  return {
    outcome: "allowed",
    reason: "consent-present",
    explanation: `${CHANNEL_LABEL[channel]} consent is present, so the action is allowed.`,
  };
}
