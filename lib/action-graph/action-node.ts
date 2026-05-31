import type { Channel } from "@/lib/types/consent";
import type { ActionNode, ActionType } from "@/lib/types/orchestrator";

export interface ActionNodeInput {
  id: string;
  actionType: ActionType;
  channel: Channel | null;
  reason: string;
  recommendedAt: string;
}

// Create an action node in its initial planned state. Policy evaluation later
// sets allowed, status, and blockedReason.
export function createActionNode(input: ActionNodeInput): ActionNode {
  return {
    id: input.id,
    actionType: input.actionType,
    channel: input.channel,
    reason: input.reason,
    status: "planned",
    allowed: false,
    blockedReason: null,
    recommendedAt: input.recommendedAt,
  };
}

// The channel an action operates on, used by policy evaluation. Actions that do
// not touch a customer channel return null and bypass channel consent checks.
export function channelForAction(actionType: ActionType): Channel | null {
  switch (actionType) {
    case "SEND_SMS":
      return "sms";
    case "SEND_EMAIL":
      return "email";
    case "PLACE_VOICE_CALL":
      return "voice";
    case "CREATE_TASK":
    case "ASSIGN_OWNER":
    case "BOOK_APPOINTMENT":
    case "ESCALATE_MANAGER":
    case "REVIEW_OPPORTUNITY":
    case "PAUSE_OUTREACH":
    case "CLOSE_OPPORTUNITY":
      return null;
  }
}

export const ACTION_LABELS: Record<ActionType, string> = {
  SEND_SMS: "Send SMS",
  SEND_EMAIL: "Send Email",
  PLACE_VOICE_CALL: "Place Voice Call",
  CREATE_TASK: "Create Task",
  ASSIGN_OWNER: "Assign Owner",
  BOOK_APPOINTMENT: "Book Appointment",
  ESCALATE_MANAGER: "Escalate To Manager",
  REVIEW_OPPORTUNITY: "Review Opportunity",
  PAUSE_OUTREACH: "Pause Outreach",
  CLOSE_OPPORTUNITY: "Close Opportunity",
};
