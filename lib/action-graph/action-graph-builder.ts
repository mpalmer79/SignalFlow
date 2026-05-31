import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type {
  ActionEdge,
  ActionNode,
  ActionPlan,
  ActionType,
} from "@/lib/types/orchestrator";
import { createActionNode, channelForAction } from "./action-node";
import { createActionEdge } from "./action-edge";
import { createActionPlan } from "./action-plan";

interface PlannedStep {
  actionType: ActionType;
  reason: string;
  waitBefore?: number;
}

// Build the action plan deterministically from the intelligence profile. The
// plan is a linear chain of steps with wait edges between sends. Channel choice
// follows the customer preferred channel where applicable.
export function buildActionGraph(
  profile: CustomerIntelligenceProfile,
): ActionPlan {
  const steps = planSteps(profile);
  const recommendedAt =
    profile.normalizedSignals[0]?.receivedAt ?? new Date().toISOString();

  const nodes: ActionNode[] = steps.map((step, index) =>
    createActionNode({
      id: `node-${index + 1}`,
      actionType: step.actionType,
      channel: channelForAction(step.actionType),
      reason: step.reason,
      recommendedAt,
    }),
  );

  const edges: ActionEdge[] = [];
  for (let i = 0; i < steps.length - 1; i += 1) {
    const next = steps[i + 1];
    edges.push(
      createActionEdge({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        kind: next.waitBefore ? "wait" : edgeKind(next.actionType),
        waitMinutes: next.waitBefore,
      }),
    );
  }

  return createActionPlan(nodes, edges);
}

function edgeKind(actionType: ActionType): "then" | "fallback" | "escalate" {
  if (actionType === "ESCALATE_MANAGER") return "escalate";
  if (actionType === "SEND_EMAIL") return "fallback";
  return "then";
}

// Translate scores and intent into an ordered sequence of planned steps. Opt-out
// short circuits to a single pause action.
function planSteps(profile: CustomerIntelligenceProfile): PlannedStep[] {
  if (profile.customer.optedOut) {
    return [
      {
        actionType: "PAUSE_OUTREACH",
        reason: "Customer opted out, so the workflow pauses immediately.",
      },
    ];
  }

  if (profile.intentLevel === "Needs Human Review") {
    return [
      {
        actionType: "REVIEW_OPPORTUNITY",
        reason: "Signal requires human review before any outreach.",
      },
      {
        actionType: "CREATE_TASK",
        reason: "A human task is created to handle the review.",
        waitBefore: 0,
      },
    ];
  }

  const preferredSend = sendActionForChannel(profile);
  const steps: PlannedStep[] = [];

  // High intent and high opportunity lead with immediate outreach then escalate.
  const highValue = profile.intentScore >= 80 && profile.opportunityScore >= 75;

  steps.push({
    actionType: preferredSend,
    reason: "Open the conversation on the customer preferred channel.",
  });

  steps.push({
    actionType: "SEND_EMAIL",
    reason: "Fall back to email if there is no reply.",
    waitBefore: 10,
  });

  if (profile.intentLevel === "Appointment Intent") {
    steps.push({
      actionType: "BOOK_APPOINTMENT",
      reason: "Customer signaled appointment intent.",
      waitBefore: 30,
    });
  }

  if (highValue) {
    steps.push({
      actionType: "ESCALATE_MANAGER",
      reason: "High intent and opportunity value warrant human escalation.",
      waitBefore: 60,
    });
  } else if (profile.intentLevel === "Purchase Intent") {
    steps.push({
      actionType: "CREATE_TASK",
      reason: "Purchase intent is handed to a human for direct follow-up.",
      waitBefore: 60,
    });
  }

  return steps;
}

function sendActionForChannel(
  profile: CustomerIntelligenceProfile,
): ActionType {
  switch (profile.preferredChannel) {
    case "sms":
      return "SEND_SMS";
    case "email":
      return "SEND_EMAIL";
    case "voice":
      return "PLACE_VOICE_CALL";
    case "human":
      return "CREATE_TASK";
  }
}
