import type { NormalizedSignalType } from "@/lib/types/intelligence";
import type { VerticalId } from "@/lib/types/vertical-pack";

// Centralized, deterministic scoring weights. All intelligence scores derive
// from this configuration so behavior is predictable and tunable in one place.

export const INTENT_SIGNAL_WEIGHTS: Record<NormalizedSignalType, number> = {
  NEW_LEAD: 25,
  MISSED_CALL: 15,
  EMAIL_OPEN: 8,
  EMAIL_CLICK: 12,
  SMS_REPLY: 20,
  APPOINTMENT_REQUEST: 30,
  APPOINTMENT_CANCEL: 5,
  TRADE_REQUEST: 40,
  VEHICLE_VIEW: 10,
  SERVICE_DUE: 18,
  RECALL_NOTICE: 18,
  DENTAL_RECALL: 18,
  ESTIMATE_REQUEST: 35,
  CONSULTATION_REQUEST: 32,
};

// Engagement deltas. Positive signals raise engagement, negative ones lower it.
export const ENGAGEMENT_SIGNAL_WEIGHTS: Record<NormalizedSignalType, number> = {
  NEW_LEAD: 10,
  MISSED_CALL: 4,
  EMAIL_OPEN: 12,
  EMAIL_CLICK: 18,
  SMS_REPLY: 22,
  APPOINTMENT_REQUEST: 20,
  APPOINTMENT_CANCEL: -15,
  TRADE_REQUEST: 16,
  VEHICLE_VIEW: 10,
  SERVICE_DUE: 6,
  RECALL_NOTICE: 6,
  DENTAL_RECALL: 6,
  ESTIMATE_REQUEST: 16,
  CONSULTATION_REQUEST: 16,
};

export const ENGAGEMENT_BASELINE = 40;
export const ENGAGEMENT_OPT_OUT_PENALTY = 40;
export const ENGAGEMENT_LOST_OPPORTUNITY_PENALTY = 12;
export const ENGAGEMENT_NO_RESPONSE_PENALTY = 8;

// Base opportunity value by vertical, used as the deterministic anchor for the
// opportunity score before signal and stage adjustments.
export const VERTICAL_OPPORTUNITY_BASE: Record<VerticalId, number> = {
  automotive: 85,
  dental: 55,
  medical: 50,
  "home-services": 90,
  "legal-intake": 70,
  insurance: 70,
};

export const PRIORITY_THRESHOLDS = {
  high: 70,
  medium: 40,
} as const;

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
