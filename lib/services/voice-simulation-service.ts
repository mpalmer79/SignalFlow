import { findCustomerById } from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import { findRecommendationsByCustomer } from "@/lib/repositories/ai-repository";
import { persistVoicePlan } from "@/lib/repositories/voice-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { generateRecommendation } from "@/lib/ai/ai-engine";
import { buildVoicePlanInput, buildVoicePlan } from "@/lib/voice/voice-plan-engine";
import { getVoiceScript } from "@/lib/voice/voice-script-engine";
import { simulateVoiceCall } from "@/lib/voice/voice-call-simulator";
import { generateTranscript } from "@/lib/voice/voice-transcript-generator";
import { assessVoiceOutcome } from "@/lib/voice/voice-outcome-engine";
import type { Customer } from "@/lib/types/customer";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { VoicePlan } from "@/lib/types/voice";

// Derive whether a customer has voice consent on file from their channels.
export function hasVoiceConsent(customer: Customer): boolean {
  return customer.channels.some(
    (channel) => channel.channel === "voice" && channel.consent === "granted",
  );
}

export interface VoicePreview {
  plan: VoicePlan;
  profile: CustomerIntelligenceProfile;
}

// Build a deterministic voice plan and simulate the call for a customer, then
// persist the whole record. Used by the seed and by a future operator action.
// When the plan is blocked, no call is simulated but the plan and its
// compliance decision are still recorded so the blocked state is visible.
export async function simulateAndPersistVoiceForCustomer(args: {
  organizationId: string;
  customerId: string;
  reviewApproved: boolean;
  quietHours: boolean;
  noResponseCount: number;
}): Promise<string | null> {
  const { organizationId, customerId, reviewApproved, quietHours, noResponseCount } =
    args;
  const customer = await findCustomerById(organizationId, customerId);
  if (!customer) return null;

  const [signals, opportunities, communications, recommendations] =
    await Promise.all([
      findSignalsByCustomer(organizationId, customerId),
      findOpportunitiesByCustomer(organizationId, customerId),
      findCommunicationsByCustomer(organizationId, customerId),
      findRecommendationsByCustomer(organizationId, customerId),
    ]);

  const profile = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });
  const recommendation = generateRecommendation(profile);

  const input = buildVoicePlanInput({
    profile,
    recommendation,
    reviewApproved,
    voiceConsent: hasVoiceConsent(customer),
    quietHours,
    noResponseCount,
  });
  const plan = buildVoicePlan(input);

  const openOpportunity = opportunities.find(
    (opp) => !["won", "lost"].includes(opp.stage),
  );
  const recommendationId = recommendations[0]?.id ?? null;

  // Only simulate the call when compliance allows it. A blocked plan records
  // its compliance decision but never produces a call.
  let simulation: Parameters<typeof persistVoicePlan>[0]["simulation"] = null;
  if (plan.compliance.status !== "blocked") {
    const script = getVoiceScript(plan.recommendedScriptType);
    const call = simulateVoiceCall(plan, input);
    const transcript = generateTranscript(plan, script, call, input);
    const outcome = assessVoiceOutcome({
      call,
      input,
      currentStage: openOpportunity?.stage ?? null,
    });
    simulation = { call, transcript, outcome };
  }

  return persistVoicePlan({
    organizationId,
    plan,
    compliance: plan.compliance,
    opportunityId: openOpportunity?.id ?? null,
    recommendationId,
    simulation,
  });
}
