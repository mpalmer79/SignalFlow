import {
  findAllAttributions,
  findAttributionsByCustomer,
  findAttributionsByOpportunity,
  getAttributionTotals,
  type AttributionTotals,
} from "@/lib/repositories/attribution-repository";
import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";

export async function listAttributions(): Promise<RevenueAttributionRecord[]> {
  return findAllAttributions();
}

export async function listAttributionsByCustomer(
  customerId: string,
): Promise<RevenueAttributionRecord[]> {
  return findAttributionsByCustomer(customerId);
}

export async function listAttributionsByOpportunity(
  opportunityId: string,
): Promise<RevenueAttributionRecord[]> {
  return findAttributionsByOpportunity(opportunityId);
}

export async function getRevenueTotals(): Promise<AttributionTotals> {
  return getAttributionTotals();
}
