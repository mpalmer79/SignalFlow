import type {
  DetectedOpportunity,
  DetectedOpportunityType,
  NormalizedSignal,
  NormalizedSignalType,
} from "@/lib/types/intelligence";

// Each rule maps a normalized signal to a detected revenue opportunity with a
// deterministic confidence. Confidence is fixed per rule, not probabilistic.
interface DetectionRule {
  type: DetectedOpportunityType;
  reason: string;
  confidence: number;
  recommendedAction: string;
}

const DETECTION_RULES: Partial<Record<NormalizedSignalType, DetectionRule>> = {
  TRADE_REQUEST: {
    type: "Vehicle Purchase Opportunity",
    reason: "Customer submitted a trade request, a strong purchase indicator",
    confidence: 92,
    recommendedAction: "Route to a salesperson for immediate follow-up",
  },
  VEHICLE_VIEW: {
    type: "Vehicle Purchase Opportunity",
    reason: "Customer is actively browsing vehicle inventory",
    confidence: 60,
    recommendedAction: "Send a tailored vehicle follow-up",
  },
  SERVICE_DUE: {
    type: "Service Revenue Opportunity",
    reason: "Vehicle service is due, indicating recurring service revenue",
    confidence: 72,
    recommendedAction: "Offer a service appointment with a reminder",
  },
  DENTAL_RECALL: {
    type: "Appointment Opportunity",
    reason: "Patient is overdue for a recall visit",
    confidence: 68,
    recommendedAction: "Send a recall reminder and offer a slot",
  },
  RECALL_NOTICE: {
    type: "Service Revenue Opportunity",
    reason: "An open recall notice requires a service visit",
    confidence: 66,
    recommendedAction: "Schedule the recall service",
  },
  ESTIMATE_REQUEST: {
    type: "Sales Opportunity",
    reason: "Customer requested an estimate, a direct buying signal",
    confidence: 88,
    recommendedAction: "Schedule the estimate visit promptly",
  },
  CONSULTATION_REQUEST: {
    type: "Consultation Opportunity",
    reason: "Customer requested a consultation",
    confidence: 80,
    recommendedAction: "Qualify the request and route to intake",
  },
  APPOINTMENT_REQUEST: {
    type: "Appointment Opportunity",
    reason: "Customer asked to book or reschedule an appointment",
    confidence: 78,
    recommendedAction: "Confirm the requested appointment",
  },
  NEW_LEAD: {
    type: "Sales Opportunity",
    reason: "A new lead entered the system",
    confidence: 64,
    recommendedAction: "Respond quickly to qualify the lead",
  },
};

export function detectOpportunities(
  signals: NormalizedSignal[],
): DetectedOpportunity[] {
  const detected: DetectedOpportunity[] = [];
  const seen = new Set<DetectedOpportunityType>();

  for (const signal of signals) {
    const rule = DETECTION_RULES[signal.normalizedType];
    if (!rule) continue;
    if (seen.has(rule.type)) continue;

    seen.add(rule.type);
    detected.push({
      type: rule.type,
      reason: rule.reason,
      confidence: rule.confidence,
      recommendedAction: rule.recommendedAction,
      sourceSignalId: signal.signalId,
    });
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}
