import type {
  AuditEvent as DbAuditEvent,
  Communication as DbCommunication,
  ContactMethod as DbContactMethod,
  Customer as DbCustomer,
  Opportunity as DbOpportunity,
  RiskFlag as DbRiskFlag,
  Signal as DbSignal,
  VerticalPack as DbVerticalPack,
} from "@prisma/client";
import type { AuditEvent, AuditEventType, AuditOutcome } from "@/lib/types/audit";
import type {
  Communication,
  CommunicationStatus,
} from "@/lib/types/communication";
import type { Channel, ConsentState } from "@/lib/types/consent";
import type { Customer, CustomerRiskFlag } from "@/lib/types/customer";
import type { Opportunity, OpportunityStage } from "@/lib/types/opportunity";
import type {
  Signal,
  SignalPriority,
  SignalSource,
  SignalType,
} from "@/lib/types/signal";
import type {
  ComplianceSensitivity,
  PackPhaseStatus,
  VerticalId,
  VerticalPack,
} from "@/lib/types/vertical-pack";

// Domain enums use kebab-case while Prisma enums use snake_case. The only
// difference is the separator, so conversion is a direct character swap.
function toDomainEnum(value: string): string {
  return value.replace(/_/g, "-");
}

function iso(date: Date): string {
  return date.toISOString();
}

export function mapVerticalPack(row: DbVerticalPack): VerticalPack {
  return {
    id: row.id as VerticalId,
    name: row.name,
    summary: row.summary,
    keySignals: row.keySignals,
    keyActions: row.keyActions,
    complianceSensitivity: row.sensitivity as ComplianceSensitivity,
    phaseStatus: toDomainEnum(row.phaseStatus) as PackPhaseStatus,
  };
}

export function mapSignal(row: DbSignal): Signal {
  return {
    id: row.id,
    type: toDomainEnum(row.type) as SignalType,
    label: row.label,
    customerId: row.customerId,
    customerName: "",
    vertical: "automotive",
    source: toDomainEnum(row.source) as SignalSource,
    priority: row.priority as SignalPriority,
    recommendedAction: row.recommendedAction,
    recommendedChannel: row.recommendedChannel as Channel,
    consentStatus: row.consentStatus as ConsentState,
    detail: row.detail,
    receivedAt: iso(row.receivedAt),
  };
}

type SignalWithCustomer = DbSignal & {
  customer: Pick<DbCustomer, "name" | "verticalId">;
};

export function mapSignalWithCustomer(row: SignalWithCustomer): Signal {
  return {
    ...mapSignal(row),
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
  };
}

type OpportunityWithCustomer = DbOpportunity & {
  customer: Pick<DbCustomer, "name" | "verticalId">;
};

export function mapOpportunity(row: OpportunityWithCustomer): Opportunity {
  return {
    id: row.id,
    title: row.title,
    customerId: row.customerId,
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
    stage: toDomainEnum(row.stage) as OpportunityStage,
    intentScore: row.intentScore,
    estimatedValue: row.estimatedValue,
    owner: row.owner,
    updatedAt: iso(row.updatedAt),
  };
}

type CommunicationWithCustomer = DbCommunication & {
  customer: Pick<DbCustomer, "name">;
};

export function mapCommunication(row: CommunicationWithCustomer): Communication {
  return {
    id: row.id,
    channel: row.channel as Channel,
    customerId: row.customerId,
    customerName: row.customer.name,
    subject: row.subject,
    preview: row.preview,
    status: row.status as CommunicationStatus,
    simulated: true,
    relatedSignalId: row.signalId,
    createdAt: iso(row.createdAt),
  };
}

type AuditEventWithCustomer = DbAuditEvent & {
  customer: Pick<DbCustomer, "name"> | null;
};

export function mapAuditEvent(row: AuditEventWithCustomer): AuditEvent {
  return {
    id: row.id,
    type: row.type as AuditEventType,
    customerId: row.customerId,
    customerName: row.customer?.name ?? "Organization",
    signalId: row.signalId,
    policyDecision: row.policyDecision,
    action: row.action,
    outcome: row.outcome as AuditOutcome,
    occurredAt: iso(row.occurredAt),
  };
}

type CustomerWithRelations = DbCustomer & {
  contactMethods: DbContactMethod[];
  riskFlags: DbRiskFlag[];
  signals: Pick<DbSignal, "label">[];
  opportunities: Pick<DbOpportunity, "title" | "stage">[];
};

const closedStages = new Set(["won", "lost", "dormant"]);

export function mapCustomer(row: CustomerWithRelations): Customer {
  const active = row.opportunities.find(
    (opp) => !closedStages.has(opp.stage),
  );
  return {
    id: row.id,
    name: row.name,
    vertical: row.verticalId as VerticalId,
    channels: row.contactMethods.map((method) => ({
      channel: method.channel as Channel,
      value: method.value,
      consent: method.consent as ConsentState,
    })),
    preferredChannel: row.preferredChannel as Channel,
    optedOut: row.optedOut,
    recentSignals: row.signals.map((signal) => signal.label),
    activeOpportunity: active?.title ?? null,
    lastAction: row.lastAction ?? "No recorded action",
    lastActionAt: row.lastActionAt ? iso(row.lastActionAt) : iso(row.updatedAt),
    riskFlags: row.riskFlags.map(
      (flag): CustomerRiskFlag => ({
        label: flag.label,
        severity: flag.severity as CustomerRiskFlag["severity"],
      }),
    ),
  };
}
