import type { VerticalId } from "./vertical-pack";
import type {
  TranscriptLine,
  VoiceCallOutcomeType,
  VoiceCallPriority,
  VoiceCallPurpose,
  VoiceCallStatus,
  VoiceComplianceStatus,
  VoicePlanStatus,
  VoiceScriptType,
} from "./voice";

// Persisted voice record shapes returned by the repository layer.

export interface VoicePlanRecord {
  id: string;
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  opportunityId: string | null;
  recommendationId: string | null;
  purpose: VoiceCallPurpose;
  priority: VoiceCallPriority;
  scriptType: VoiceScriptType;
  status: VoicePlanStatus;
  complianceStatus: VoiceComplianceStatus;
  blockedReason: string | null;
  expectedOutcome: VoiceCallOutcomeType;
  requiresApproval: boolean;
  createdAt: string;
}

export interface VoiceCallRecord {
  id: string;
  voicePlanId: string;
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  opportunityId: string | null;
  status: VoiceCallStatus;
  connected: boolean;
  durationSeconds: number;
  startedAt: string;
  completedAt: string | null;
  purpose: VoiceCallPurpose;
  outcomeType: VoiceCallOutcomeType | null;
}

export interface VoiceTranscriptRecord {
  id: string;
  voiceCallId: string;
  transcript: string;
  lines: TranscriptLine[];
  summary: string;
  createdAt: string;
}

export interface VoiceComplianceDecisionRecord {
  id: string;
  voicePlanId: string;
  decision: VoiceComplianceStatus;
  reason: string;
  createdAt: string;
}

export interface VoiceCallOutcomeRecord {
  id: string;
  voiceCallId: string;
  customerId: string;
  opportunityId: string | null;
  outcomeType: VoiceCallOutcomeType;
  outcomeReason: string;
  attributedAmount: number;
  createdAt: string;
}

// The full detail used by the voice replay page.
export interface VoiceCallDetail {
  call: VoiceCallRecord;
  plan: VoicePlanRecord;
  compliance: VoiceComplianceDecisionRecord | null;
  transcript: VoiceTranscriptRecord | null;
  outcome: VoiceCallOutcomeRecord | null;
}
