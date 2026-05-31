import type { Customer } from "@/lib/types/customer";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type { Signal } from "@/lib/types/signal";
import type {
  ConsentSummary,
  CustomerIntelligenceProfile,
} from "@/lib/types/intelligence";
import { enrichSignals } from "@/lib/signals/signal-enricher";
import { strongestIntent } from "@/lib/signals/signal-classifier";
import { priorityFromScore } from "@/lib/signals/signal-priority";
import { calculateIntentScore } from "@/lib/scoring/intent-score";
import { calculateEngagementScore } from "@/lib/scoring/engagement-score";
import { calculateOpportunityScore } from "@/lib/scoring/opportunity-score";
import { detectOpportunities } from "@/lib/recommendations/opportunity-detector";
import { recommendNextBestActions } from "@/lib/recommendations/next-best-action";
import { deriveRiskFlags } from "./risk-flags";

export interface IntelligenceInput {
  customer: Customer;
  signals: Signal[];
  opportunities: Opportunity[];
  communications: Communication[];
}

const OPEN_STAGES_EXCLUDED = new Set(["won", "lost", "dormant"]);
const RESPONSE_STATUSES = new Set(["replied", "delivered"]);

// Build the full Customer Intelligence Profile from persisted domain objects.
// This is pure composition over deterministic engines. No persistence, no UI.
export function buildIntelligenceProfile(
  input: IntelligenceInput,
): CustomerIntelligenceProfile {
  const { customer, signals, opportunities, communications } = input;

  const normalizedSignals = enrichSignals(signals);

  const preferredChannelConsent =
    customer.channels.find((c) => c.channel === customer.preferredChannel)
      ?.consent ?? "unknown";
  const consentSummary = summarizeConsent(
    customer.optedOut,
    preferredChannelConsent,
  );

  const hasRecentResponse = communications.some((comm) =>
    RESPONSE_STATUSES.has(comm.status),
  );

  const openOpportunities = opportunities.filter(
    (opp) => !OPEN_STAGES_EXCLUDED.has(opp.stage),
  );

  const intentScore = calculateIntentScore(normalizedSignals);
  const engagementScore = calculateEngagementScore({
    customer,
    signals: normalizedSignals,
    opportunities,
    hasRecentResponse,
  });
  const opportunityScore = calculateOpportunityScore({
    vertical: customer.vertical,
    signals: normalizedSignals,
    openOpportunities,
  });

  const intentLevel = strongestIntent(
    normalizedSignals.map((signal) => signal.intent),
  );

  const riskFlags = deriveRiskFlags({
    customer,
    signals: normalizedSignals,
    opportunities,
    consentSummary,
    hasRecentResponse,
  });

  const detectedOpportunities = detectOpportunities(normalizedSignals);

  const recommendedActions = recommendNextBestActions({
    intentScore,
    opportunityScore,
    engagementScore,
    intentLevel,
    preferredChannel: customer.preferredChannel,
    consentSummary,
    optedOut: customer.optedOut,
    riskFlags,
  });

  // The overall priority blends intent and opportunity, the two scores that
  // most directly drive revenue urgency.
  const priorityScore = Math.round(intentScore * 0.6 + opportunityScore * 0.4);

  return {
    customer,
    vertical: customer.vertical,
    intentScore,
    intentLevel,
    opportunityScore,
    engagementScore,
    priority: priorityFromScore(priorityScore),
    preferredChannel: customer.preferredChannel,
    preferredChannelConsent,
    consentSummary,
    normalizedSignals,
    detectedOpportunities,
    recommendedActions,
    riskFlags,
    openOpportunities,
  };
}

function summarizeConsent(
  optedOut: boolean,
  preferredChannelConsent: string,
): ConsentSummary {
  if (optedOut || preferredChannelConsent === "revoked") return "blocked";
  if (preferredChannelConsent === "granted") return "allowed";
  if (preferredChannelConsent === "denied") return "blocked";
  return "review";
}
