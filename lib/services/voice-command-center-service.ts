import {
  aggregateVoice,
  findAllVoiceCalls,
  findAllVoicePlans,
  findVoicePlansNeedingReview,
  type VoiceAggregate,
} from "@/lib/repositories/voice-repository";
import type { RequestContext } from "@/lib/types/auth";
import type {
  VoiceCallRecord,
  VoicePlanRecord,
} from "@/lib/types/voice-records";

export interface VoiceCommandCenterView {
  metrics: VoiceAggregate;
  plans: VoicePlanRecord[];
  calls: VoiceCallRecord[];
  needingReview: VoicePlanRecord[];
  blockedPlans: VoicePlanRecord[];
}

// Aggregate the voice operations view. All reads are organization scoped and
// issued in parallel.
export async function getVoiceCommandCenter(
  context: RequestContext,
): Promise<VoiceCommandCenterView> {
  const orgId = context.organizationId;
  const [metrics, plans, calls, needingReview] = await Promise.all([
    aggregateVoice(orgId),
    findAllVoicePlans(orgId),
    findAllVoiceCalls(orgId),
    findVoicePlansNeedingReview(orgId),
  ]);

  const blockedPlans = plans.filter((p) => p.complianceStatus === "blocked");

  return {
    metrics,
    plans: plans.slice(0, 12),
    calls: calls.slice(0, 12),
    needingReview,
    blockedPlans: blockedPlans.slice(0, 8),
  };
}

// Lightweight metrics for the dashboard and the revenue command center.
export async function getVoiceMetrics(
  context: RequestContext,
): Promise<VoiceAggregate> {
  return aggregateVoice(context.organizationId);
}
