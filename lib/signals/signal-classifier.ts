import type {
  IntentClassification,
  NormalizedSignalType,
} from "@/lib/types/intelligence";

// Deterministic intent classification. Each normalized signal maps to a single
// intent class through fixed rules. No model output is involved.
const INTENT_MAP: Record<NormalizedSignalType, IntentClassification> = {
  NEW_LEAD: "Interested",
  MISSED_CALL: "Interested",
  EMAIL_OPEN: "Researching",
  EMAIL_CLICK: "Engaged",
  SMS_REPLY: "Engaged",
  APPOINTMENT_REQUEST: "Appointment Intent",
  APPOINTMENT_CANCEL: "Needs Human Review",
  TRADE_REQUEST: "Purchase Intent",
  VEHICLE_VIEW: "Researching",
  SERVICE_DUE: "Reactivation Opportunity",
  RECALL_NOTICE: "Reactivation Opportunity",
  DENTAL_RECALL: "Reactivation Opportunity",
  ESTIMATE_REQUEST: "Purchase Intent",
  CONSULTATION_REQUEST: "Appointment Intent",
};

export function classifyIntent(
  type: NormalizedSignalType,
): IntentClassification {
  return INTENT_MAP[type];
}

// Rank intent classes so a customer level intent can be summarized from the
// strongest signal observed.
const INTENT_RANK: Record<IntentClassification, number> = {
  "Needs Human Review": 6,
  "Purchase Intent": 5,
  "Appointment Intent": 4,
  Engaged: 3,
  "Reactivation Opportunity": 2,
  Interested: 1,
  Researching: 0,
};

export function strongestIntent(
  intents: IntentClassification[],
): IntentClassification {
  if (intents.length === 0) return "Researching";
  return intents.reduce((best, current) =>
    INTENT_RANK[current] > INTENT_RANK[best] ? current : best,
  );
}
