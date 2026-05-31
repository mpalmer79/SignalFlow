import type { Signal } from "@/lib/types/signal";
import type {
  IntentClassification,
  NormalizedSignal,
  NormalizedSignalType,
} from "@/lib/types/intelligence";
import { INTENT_SIGNAL_WEIGHTS } from "@/lib/scoring/scoring-config";
import { normalizeSignalType } from "./signal-normalizer";
import { classifyIntent } from "./signal-classifier";
import { assignSignalPriority } from "./signal-priority";

// A short, deterministic next action per intent class, used in the Signal
// Explorer and timeline. Customer level recommendations come from the Next
// Best Action engine.
const INTENT_ACTION: Record<IntentClassification, string> = {
  Researching: "Nurture with relevant follow-up content",
  Interested: "Send a prompt follow-up to qualify interest",
  Engaged: "Continue the active conversation",
  "Purchase Intent": "Route to a human for immediate follow-up",
  "Appointment Intent": "Offer the next available appointment slot",
  "Reactivation Opportunity": "Send a reactivation offer",
  "Needs Human Review": "Hold for human review before any outreach",
};

export function enrichSignal(signal: Signal): NormalizedSignal {
  const normalizedType: NormalizedSignalType = normalizeSignalType(signal);
  const intent = classifyIntent(normalizedType);
  const priority = assignSignalPriority(normalizedType, intent);

  return {
    signalId: signal.id,
    rawLabel: signal.label,
    rawDetail: signal.detail,
    normalizedType,
    intent,
    priority,
    intentContribution: INTENT_SIGNAL_WEIGHTS[normalizedType],
    recommendedAction: INTENT_ACTION[intent],
    receivedAt: signal.receivedAt,
  };
}

export function enrichSignals(signals: Signal[]): NormalizedSignal[] {
  return signals
    .map(enrichSignal)
    .sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
}
