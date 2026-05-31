import type { Channel } from "@/lib/types/consent";
import type {
  ConsentSummary,
  IntelligenceRiskFlag,
  IntentClassification,
  NextBestAction,
} from "@/lib/types/intelligence";

export interface NextBestActionInput {
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  intentLevel: IntentClassification;
  preferredChannel: Channel;
  consentSummary: ConsentSummary;
  optedOut: boolean;
  riskFlags: IntelligenceRiskFlag[];
}

// Deterministic recommendation engine. Recommendations are derived from scores,
// consent, and risk flags through fixed rules. The first applicable rule for
// each concern is applied, producing an ordered list of next best actions.
export function recommendNextBestActions(
  input: NextBestActionInput,
): NextBestAction[] {
  const {
    intentScore,
    opportunityScore,
    engagementScore,
    intentLevel,
    preferredChannel,
    consentSummary,
    optedOut,
    riskFlags,
  } = input;

  const actions: NextBestAction[] = [];

  // Opt-out and blocked consent are absolute. Outreach pauses immediately.
  if (optedOut) {
    return [
      {
        action: "Pause Outreach",
        rationale: "Customer opted out, so all outreach is paused.",
        channel: null,
        urgency: "immediate",
      },
    ];
  }

  const hasCriticalRisk = riskFlags.some(
    (flag) => flag.severity === "critical",
  );

  // Compliance sensitive or review intents route to a human first.
  if (intentLevel === "Needs Human Review" || hasCriticalRisk) {
    actions.push({
      action: "Review Opportunity",
      rationale:
        "A risk flag or review intent requires human review before outreach.",
      channel: null,
      urgency: "high",
    });
  }

  if (consentSummary === "blocked") {
    actions.push({
      action: "Create Task",
      rationale:
        "Consent is missing for the preferred channel, so a task is created to capture consent.",
      channel: null,
      urgency: "standard",
    });
    return dedupe(actions);
  }

  // High intent and high opportunity warrant immediate human contact.
  if (intentScore >= 80 && opportunityScore >= 75) {
    actions.push({
      action: "Escalate To Manager",
      rationale:
        "High intent and high opportunity value justify immediate human follow-up.",
      channel: preferredChannel,
      urgency: "immediate",
    });
  }

  if (intentLevel === "Appointment Intent") {
    actions.push({
      action: "Book Appointment",
      rationale: "Customer signaled appointment intent.",
      channel: preferredChannel,
      urgency: "high",
    });
  }

  if (intentLevel === "Purchase Intent" && actions.length === 0) {
    actions.push({
      action: "Schedule Call",
      rationale: "Purchase intent is best served by a direct conversation.",
      channel: preferredChannel === "human" ? "voice" : preferredChannel,
      urgency: "high",
    });
  }

  if (intentLevel === "Reactivation Opportunity") {
    actions.push({
      action: channelAction(preferredChannel),
      rationale: "Reactivation outreach can re-engage a dormant customer.",
      channel: outreachChannel(preferredChannel),
      urgency: "standard",
    });
  }

  // Engaged or interested customers get a channel-appropriate follow-up.
  if (
    actions.length === 0 &&
    (intentLevel === "Engaged" || intentLevel === "Interested")
  ) {
    actions.push({
      action: channelAction(preferredChannel),
      rationale: "Maintain momentum with a timely follow-up.",
      channel: outreachChannel(preferredChannel),
      urgency: engagementScore >= 60 ? "high" : "standard",
    });
  }

  // Low engagement researchers are nurtured rather than pushed.
  if (actions.length === 0) {
    actions.push({
      action: "Send Email",
      rationale: "Nurture a researching customer with relevant content.",
      channel: "email",
      urgency: "low",
    });
  }

  return dedupe(actions);
}

function channelAction(channel: Channel): NextBestAction["action"] {
  switch (channel) {
    case "sms":
      return "Send SMS";
    case "email":
      return "Send Email";
    case "voice":
      return "Schedule Call";
    case "human":
      return "Create Task";
  }
}

function outreachChannel(channel: Channel): Channel {
  return channel === "human" ? "email" : channel;
}

function dedupe(actions: NextBestAction[]): NextBestAction[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.action)) return false;
    seen.add(action.action);
    return true;
  });
}
