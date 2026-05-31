import type { NormalizedSignal } from "@/lib/types/intelligence";
import { clampScore } from "./scoring-config";

// Intent score sums the intent contribution of every normalized signal, with a
// mild recency weighting so newer signals count for slightly more. The result
// is clamped to the 0 to 100 range.
export function calculateIntentScore(signals: NormalizedSignal[]): number {
  if (signals.length === 0) return 0;

  const ordered = [...signals].sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );

  let total = 0;
  ordered.forEach((signal, index) => {
    const recencyWeight = index === 0 ? 1.15 : index < 3 ? 1 : 0.85;
    total += signal.intentContribution * recencyWeight;
  });

  return clampScore(total);
}
