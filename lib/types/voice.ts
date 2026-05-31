import type { VerticalId } from "./vertical-pack";

// Phase 9 voice types. Voice is fully simulated. These types describe the
// shape a future provider (ElevenLabs, OpenAI Realtime, Twilio, Retell, Vapi)
// would conform to, without any of them being integrated or called.

export type VoiceCallPurpose =
  | "LEAD_FOLLOW_UP"
  | "APPOINTMENT_CONFIRMATION"
  | "APPOINTMENT_RECOVERY"
  | "DORMANT_LEAD_REACTIVATION"
  | "SERVICE_REMINDER"
  | "ESTIMATE_FOLLOW_UP"
  | "CONSULTATION_SCHEDULING"
  | "RENEWAL_FOLLOW_UP";

export type VoiceCallPriority = "immediate" | "high" | "standard" | "low";

export type VoiceScriptType =
  | "AUTOMOTIVE_FOLLOW_UP"
  | "AUTOMOTIVE_TRADE"
  | "DENTAL_RECALL"
  | "HOME_SERVICES_ESTIMATE"
  | "LEGAL_CONSULTATION"
  | "INSURANCE_RENEWAL"
  | "GENERIC_FOLLOW_UP";

// The deterministic compliance verdict for a voice plan.
export type VoiceComplianceStatus = "allowed" | "blocked" | "needs-review";

export type VoiceBlockedReason =
  | "MISSING_VOICE_CONSENT"
  | "CUSTOMER_OPTED_OUT"
  | "QUIET_HOURS"
  | "COMPLIANCE_SENSITIVE"
  | "REPEATED_NO_RESPONSE"
  | "HUMAN_REVIEW_REQUIRED";

export const VOICE_BLOCKED_REASON_LABELS: Record<VoiceBlockedReason, string> = {
  MISSING_VOICE_CONSENT: "Missing voice consent",
  CUSTOMER_OPTED_OUT: "Customer opted out",
  QUIET_HOURS: "Quiet hours",
  COMPLIANCE_SENSITIVE: "Compliance sensitive",
  REPEATED_NO_RESPONSE: "Repeated no response",
  HUMAN_REVIEW_REQUIRED: "Human review required",
};

export const VOICE_PURPOSE_LABELS: Record<VoiceCallPurpose, string> = {
  LEAD_FOLLOW_UP: "Lead follow-up",
  APPOINTMENT_CONFIRMATION: "Appointment confirmation",
  APPOINTMENT_RECOVERY: "Appointment recovery",
  DORMANT_LEAD_REACTIVATION: "Dormant lead reactivation",
  SERVICE_REMINDER: "Service reminder",
  ESTIMATE_FOLLOW_UP: "Estimate follow-up",
  CONSULTATION_SCHEDULING: "Consultation scheduling",
  RENEWAL_FOLLOW_UP: "Renewal follow-up",
};

// The lifecycle a voice plan and its call move through.
export type VoicePlanStatus =
  | "planned"
  | "blocked"
  | "needs-review"
  | "ready"
  | "simulated"
  | "archived";

export type VoiceCallStatus =
  | "pending"
  | "simulated"
  | "blocked"
  | "no-answer"
  | "completed";

// Deterministic call outcomes. No randomness and no external calls.
export type VoiceCallOutcomeType =
  | "APPOINTMENT_SCHEDULED"
  | "CALLBACK_REQUESTED"
  | "CUSTOMER_INTERESTED"
  | "CUSTOMER_NOT_INTERESTED"
  | "NEEDS_HUMAN_FOLLOW_UP"
  | "NO_ANSWER"
  | "VOICEMAIL_LEFT"
  | "WRONG_NUMBER"
  | "COMPLIANCE_STOP";

export const VOICE_OUTCOME_LABELS: Record<VoiceCallOutcomeType, string> = {
  APPOINTMENT_SCHEDULED: "Appointment scheduled",
  CALLBACK_REQUESTED: "Callback requested",
  CUSTOMER_INTERESTED: "Customer interested",
  CUSTOMER_NOT_INTERESTED: "Customer not interested",
  NEEDS_HUMAN_FOLLOW_UP: "Needs human follow-up",
  NO_ANSWER: "No answer",
  VOICEMAIL_LEFT: "Voicemail left",
  WRONG_NUMBER: "Wrong number",
  COMPLIANCE_STOP: "Compliance stop",
};

// The deterministic input the voice engines consume. Assembled from the
// intelligence profile and the AI recommendation, so the voice layer never
// touches Prisma, React, Clerk, or a provider.
export interface VoicePlanInput {
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  intentLevel: string;
  consentSummary: "allowed" | "blocked" | "review";
  voiceConsent: boolean;
  optedOut: boolean;
  quietHours: boolean;
  signalCount: number;
  noResponseCount: number;
  riskFlags: { label: string; severity: "info" | "warning" | "critical" }[];
  topSignalLabel: string | null;
  estimatedValue: number;
  recommendationType: string;
  reviewApproved: boolean;
}

// A single compliance check result.
export interface VoiceComplianceCheck {
  passed: boolean;
  reason: VoiceBlockedReason | null;
  detail: string;
}

export interface VoiceComplianceResult {
  status: VoiceComplianceStatus;
  blockedReason: VoiceBlockedReason | null;
  checks: VoiceComplianceCheck[];
  summary: string;
}

// The full deterministic voice plan produced by the plan engine.
export interface VoicePlan {
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  callPurpose: VoiceCallPurpose;
  callPriority: VoiceCallPriority;
  recommendedScriptType: VoiceScriptType;
  requiresApproval: boolean;
  compliance: VoiceComplianceResult;
  expectedOutcome: VoiceCallOutcomeType;
}

// A line in a simulated transcript.
export interface TranscriptLine {
  speaker: "agent" | "customer" | "outcome";
  text: string;
}

export interface VoiceTranscript {
  lines: TranscriptLine[];
  summary: string;
  simulated: true;
}

// A structured voice script for a vertical. Data only. Never sent anywhere.
export interface VoiceScript {
  scriptType: VoiceScriptType;
  vertical: VerticalId;
  title: string;
  opening: string;
  reasonForCall: string;
  primaryQuestion: string;
  fallbackQuestion: string;
  humanHandoff: string;
  close: string;
}

// The simulated call result produced by the call simulator.
export interface SimulatedCall {
  outcomeType: VoiceCallOutcomeType;
  outcomeReason: string;
  connected: boolean;
  durationSeconds: number;
}
