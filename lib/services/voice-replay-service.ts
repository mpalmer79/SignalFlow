import {
  findAllVoiceCalls,
  findVoiceCallDetail,
} from "@/lib/repositories/voice-repository";
import { findAuditEventsByCustomer } from "@/lib/repositories/audit-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { AuditEvent } from "@/lib/types/audit";
import type { VoiceCallDetail, VoiceCallRecord } from "@/lib/types/voice-records";

export interface VoiceReplay {
  detail: VoiceCallDetail;
  voiceAudit: AuditEvent[];
}

const VOICE_AUDIT_TYPES = new Set<string>([
  "VOICE_PLAN_CREATED",
  "VOICE_COMPLIANCE_ALLOWED",
  "VOICE_COMPLIANCE_BLOCKED",
  "VOICE_COMPLIANCE_NEEDS_REVIEW",
  "VOICE_CALL_SIMULATED",
  "VOICE_TRANSCRIPT_CREATED",
  "VOICE_OUTCOME_CREATED",
  "VOICE_REVENUE_ATTRIBUTED",
]);

// Build the voice replay for a single call: the full call detail plus the
// voice audit events for that customer, filtered to voice activity.
export async function getVoiceReplay(
  context: RequestContext,
  callId: string,
): Promise<VoiceReplay | null> {
  const orgId = context.organizationId;
  const detail = await findVoiceCallDetail(orgId, callId);
  if (!detail) return null;

  const audit = await findAuditEventsByCustomer(orgId, detail.call.customerId);
  const voiceAudit = audit.filter((event) => VOICE_AUDIT_TYPES.has(event.type));

  return { detail, voiceAudit };
}

// List recent calls for the command center to link into the replay.
export async function listVoiceCalls(
  context: RequestContext,
): Promise<VoiceCallRecord[]> {
  return findAllVoiceCalls(context.organizationId);
}
