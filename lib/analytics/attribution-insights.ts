import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";
import type { AttributionType } from "@/lib/types/outcome";

export interface AttributionInsight {
  type: AttributionType;
  amount: number;
  count: number;
}

// Group attributions by type into totals. Pure reduction over records.
export function computeAttributionInsights(
  attributions: RevenueAttributionRecord[],
): AttributionInsight[] {
  const byType = new Map<AttributionType, { amount: number; count: number }>();

  for (const attribution of attributions) {
    const entry =
      byType.get(attribution.attributionType) ?? { amount: 0, count: 0 };
    entry.amount += attribution.attributedAmount;
    entry.count += 1;
    byType.set(attribution.attributionType, entry);
  }

  return Array.from(byType.entries())
    .map(([type, data]) => ({ type, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount);
}
