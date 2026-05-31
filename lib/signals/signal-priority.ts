import type {
  IntelligencePriority,
  IntentClassification,
  NormalizedSignalType,
} from "@/lib/types/intelligence";
import { INTENT_SIGNAL_WEIGHTS } from "@/lib/scoring/scoring-config";

// Signal level priority is derived from the intent weight of the normalized
// signal, with review intents always surfaced as high priority.
export function assignSignalPriority(
  type: NormalizedSignalType,
  intent: IntentClassification,
): IntelligencePriority {
  if (intent === "Needs Human Review" || intent === "Purchase Intent") {
    return "high";
  }

  const weight = INTENT_SIGNAL_WEIGHTS[type];
  if (weight >= 30) return "high";
  if (weight >= 15) return "medium";
  return "low";
}

export function priorityFromScore(score: number): IntelligencePriority {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
