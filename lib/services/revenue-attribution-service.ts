import {
  findAllAttributions,
  findAttributionsByCustomer,
  findAttributionsByOpportunity,
  getAttributionTotals,
  type AttributionTotals,
} from "@/lib/repositories/attribution-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";

export async function listAttributions(
  context: RequestContext,
): Promise<RevenueAttributionRecord[]> {
  return findAllAttributions(context.organizationId);
}

export async function listAttributionsByCustomer(
  context: RequestContext,
  customerId: string,
): Promise<RevenueAttributionRecord[]> {
  return findAttributionsByCustomer(context.organizationId, customerId);
}

export async function listAttributionsByOpportunity(
  context: RequestContext,
  opportunityId: string,
): Promise<RevenueAttributionRecord[]> {
  return findAttributionsByOpportunity(context.organizationId, opportunityId);
}

export async function getRevenueTotals(
  context: RequestContext,
): Promise<AttributionTotals> {
  return getAttributionTotals(context.organizationId);
}
