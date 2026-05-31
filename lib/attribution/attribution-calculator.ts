import type { AttributionType, OutcomeContext } from "@/lib/types/outcome";
import {
  ATTRIBUTION_FACTORS,
  VERTICAL_DEFAULT_VALUE,
} from "@/lib/outcomes/outcome-config";

// Resolve the opportunity value to attribute against, falling back to a
// vertical default when an opportunity carries no estimated value.
export function resolveOpportunityValue(context: OutcomeContext): number {
  const value = context.opportunity?.estimatedValue ?? 0;
  if (value > 0) return value;
  return VERTICAL_DEFAULT_VALUE[context.vertical];
}

// Apply the deterministic attribution factor for a type to a base value.
export function applyAttributionFactor(
  type: AttributionType,
  baseValue: number,
): number {
  return Math.round(baseValue * ATTRIBUTION_FACTORS[type]);
}
