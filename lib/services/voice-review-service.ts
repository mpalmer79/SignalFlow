import { recordVoiceReviewDecision } from "@/lib/repositories/voice-repository";
import { hasPermission } from "@/lib/auth/authorization";
import type { RequestContext } from "@/lib/types/auth";

export type VoiceReviewOutcome =
  | { ok: true; approved: boolean }
  | { ok: false; reason: "forbidden" | "not-found" };

// Submit a human review decision on a needs-review voice plan. Authorization is
// enforced server side: a reviewer needs the REVIEW_AI_RECOMMENDATIONS
// permission, which compliance reviewers, managers, and owners hold. Approving
// makes the plan eligible for simulation under the existing rules; it does not
// place a call or trigger a simulation here. The decision is audited and
// organization scoped.
export async function submitVoiceReviewDecision(
  context: RequestContext,
  voicePlanId: string,
  approve: boolean,
  notes: string,
): Promise<VoiceReviewOutcome> {
  if (!hasPermission(context, "REVIEW_AI_RECOMMENDATIONS")) {
    return { ok: false, reason: "forbidden" };
  }

  const result = await recordVoiceReviewDecision({
    organizationId: context.organizationId,
    voicePlanId,
    approve,
    reviewerId: context.userId,
    reviewerName: context.userName,
    notes: notes.trim().length > 0 ? notes.trim() : "No notes provided.",
  });

  if (!result.updated) {
    return { ok: false, reason: "not-found" };
  }
  return { ok: true, approved: approve };
}
