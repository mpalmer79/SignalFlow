import { findAllCustomers, findCustomerById } from "@/lib/repositories/customer-repository";
import { findAllSignals, findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import {
  findAllOpportunities,
  findOpportunitiesByCustomer,
} from "@/lib/repositories/opportunity-repository";
import {
  findAllCommunications,
  findCommunicationsByCustomer,
} from "@/lib/repositories/communication-repository";
import { buildCustomerIntelligence, type CustomerIntelligence } from "@/lib/intelligence/customer-graph";
import { enrichSignals } from "@/lib/signals/signal-enricher";
import type { Customer } from "@/lib/types/customer";
import type { Signal } from "@/lib/types/signal";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type {
  CustomerIntelligenceProfile,
  DetectedOpportunity,
  NormalizedSignal,
} from "@/lib/types/intelligence";

export interface CustomerIntelligenceSummary {
  customerId: string;
  customerName: string;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  priority: CustomerIntelligenceProfile["priority"];
  intentLevel: CustomerIntelligenceProfile["intentLevel"];
  topAction: string;
  consentSummary: CustomerIntelligenceProfile["consentSummary"];
  riskCount: number;
  hasCriticalRisk: boolean;
}

export interface SignalExplorerRow extends NormalizedSignal {
  customerId: string;
  customerName: string;
}

export interface DetectedOpportunitySummary extends DetectedOpportunity {
  customerId: string;
  customerName: string;
}

// Build intelligence for a single customer. Returns null when the customer is
// not found, so callers can render a not found state.
export async function getCustomerIntelligence(
  customerId: string,
): Promise<CustomerIntelligence | null> {
  const customer = await findCustomerById(customerId);
  if (!customer) return null;

  const [signals, opportunities, communications] = await Promise.all([
    findSignalsByCustomer(customerId),
    findOpportunitiesByCustomer(customerId),
    findCommunicationsByCustomer(customerId),
  ]);

  return buildCustomerIntelligence({
    customer,
    signals,
    opportunities,
    communications,
  });
}

interface CustomerBundle {
  customer: Customer;
  signals: Signal[];
  opportunities: Opportunity[];
  communications: Communication[];
}

async function loadAllBundles(): Promise<CustomerBundle[]> {
  const [customers, signals, opportunities, communications] = await Promise.all(
    [
      findAllCustomers(),
      findAllSignals(),
      findAllOpportunities(),
      findAllCommunications(),
    ],
  );

  return customers.map((customer) => ({
    customer,
    signals: signals.filter((s) => s.customerId === customer.id),
    opportunities: opportunities.filter((o) => o.customerId === customer.id),
    communications: communications.filter((c) => c.customerId === customer.id),
  }));
}

function toProfile(bundle: CustomerBundle): CustomerIntelligenceProfile {
  return buildCustomerIntelligence(bundle).profile;
}

function toSummary(
  profile: CustomerIntelligenceProfile,
): CustomerIntelligenceSummary {
  return {
    customerId: profile.customer.id,
    customerName: profile.customer.name,
    intentScore: profile.intentScore,
    opportunityScore: profile.opportunityScore,
    engagementScore: profile.engagementScore,
    priority: profile.priority,
    intentLevel: profile.intentLevel,
    topAction: profile.recommendedActions[0]?.action ?? "Review Opportunity",
    consentSummary: profile.consentSummary,
    riskCount: profile.riskFlags.length,
    hasCriticalRisk: profile.riskFlags.some((f) => f.severity === "critical"),
  };
}

export async function listIntelligenceSummaries(): Promise<
  CustomerIntelligenceSummary[]
> {
  const bundles = await loadAllBundles();
  return bundles.map((bundle) => toSummary(toProfile(bundle)));
}

export interface IntelligenceOverview {
  summaries: CustomerIntelligenceSummary[];
  topIntent: CustomerIntelligenceSummary[];
  topOpportunities: CustomerIntelligenceSummary[];
  needingAttention: CustomerIntelligenceSummary[];
  atRisk: CustomerIntelligenceSummary[];
  detectedOpportunities: DetectedOpportunitySummary[];
}

export async function getIntelligenceOverview(): Promise<IntelligenceOverview> {
  const bundles = await loadAllBundles();
  const profiles = bundles.map(toProfile);
  const summaries = profiles.map(toSummary);

  const topIntent = [...summaries]
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, 5);

  const topOpportunities = [...summaries]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);

  const needingAttention = summaries.filter(
    (s) =>
      s.intentLevel === "Needs Human Review" ||
      s.priority === "high" ||
      s.consentSummary === "review",
  );

  const atRisk = summaries.filter((s) => s.hasCriticalRisk);

  const detectedOpportunities: DetectedOpportunitySummary[] = profiles.flatMap(
    (profile) =>
      profile.detectedOpportunities.map((opp) => ({
        ...opp,
        customerId: profile.customer.id,
        customerName: profile.customer.name,
      })),
  );

  detectedOpportunities.sort((a, b) => b.confidence - a.confidence);

  return {
    summaries,
    topIntent,
    topOpportunities,
    needingAttention,
    atRisk,
    detectedOpportunities,
  };
}

// Flatten every customer's normalized signals into a single explorer feed that
// demonstrates the Signal Engine end to end.
export async function getSignalExplorer(): Promise<SignalExplorerRow[]> {
  const [signals] = await Promise.all([findAllSignals()]);

  const byCustomer = new Map<string, Signal[]>();
  for (const signal of signals) {
    const list = byCustomer.get(signal.customerId) ?? [];
    list.push(signal);
    byCustomer.set(signal.customerId, list);
  }

  const rows: SignalExplorerRow[] = [];
  for (const signal of signals) {
    const [enriched] = enrichSignals([signal]);
    rows.push({
      ...enriched,
      customerId: signal.customerId,
      customerName: signal.customerName,
    });
  }

  return rows.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}
