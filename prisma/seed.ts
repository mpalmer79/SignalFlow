import { PrismaClient, type Prisma } from "@prisma/client";
import { verticalPacks } from "../lib/mock-data/vertical-packs";
import { customers } from "../lib/mock-data/customers";
import { signals } from "../lib/mock-data/signals";
import { opportunities } from "../lib/mock-data/opportunities";
import { communications } from "../lib/mock-data/communications";
import { auditEvents } from "../lib/mock-data/audit-events";
import { findAllCustomers } from "../lib/repositories/customer-repository";
import { findSignalsByCustomer } from "../lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "../lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "../lib/repositories/communication-repository";
import { planWorkflowWithScores } from "../lib/orchestrator/workflow-runner";
import {
  persistWorkflowRun,
  findWorkflowRunById,
} from "../lib/repositories/workflow-repository";
import { buildIntelligenceProfile } from "../lib/intelligence/graph-summary";
import { assessOutcomes } from "../lib/outcomes/outcome-engine";
import { buildOutcomeContext } from "../lib/services/outcome-service";
import { persistAssessment } from "../lib/repositories/outcome-repository";

const prisma = new PrismaClient();

// Prisma enums use snake_case while the mock data uses kebab-case. The only
// difference is the separator.
function toDbEnum(value: string): string {
  return value.replace(/-/g, "_");
}

async function reset() {
  // Delete in dependency order. Cascades cover most of this, but explicit
  // deletes keep reseeding deterministic.
  await prisma.missedOpportunityEstimate.deleteMany();
  await prisma.workflowEffectivenessSnapshot.deleteMany();
  await prisma.stageTransition.deleteMany();
  await prisma.revenueAttribution.deleteMany();
  await prisma.outcomeEvent.deleteMany();
  await prisma.workflowResult.deleteMany();
  await prisma.workflowAction.deleteMany();
  await prisma.policyDecision.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.contactMethod.deleteMany();
  await prisma.riskFlag.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.verticalPack.deleteMany();
}

async function seedVerticalPacks() {
  for (const pack of verticalPacks) {
    await prisma.verticalPack.create({
      data: {
        id: pack.id,
        name: pack.name,
        summary: pack.summary,
        keySignals: pack.keySignals,
        keyActions: pack.keyActions,
        sensitivity: pack.complianceSensitivity,
        phaseStatus: toDbEnum(pack.phaseStatus) as Prisma.VerticalPackCreateInput["phaseStatus"],
      },
    });
  }
}

async function seedCustomers() {
  for (const customer of customers) {
    await prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        verticalId: customer.vertical,
        preferredChannel: customer.preferredChannel,
        optedOut: customer.optedOut,
        lastAction: customer.lastAction,
        lastActionAt: new Date(customer.lastActionAt),
        contactMethods: {
          create: customer.channels.map((channel) => ({
            channel: channel.channel,
            value: channel.value,
            consent: channel.consent,
          })),
        },
        consentRecords: {
          create: customer.channels.map((channel) => ({
            channel: channel.channel,
            state: channel.consent,
            source: "phase-0 seed",
            capturedAt: channel.consent === "granted" ? new Date(customer.lastActionAt) : null,
          })),
        },
        riskFlags: {
          create: customer.riskFlags.map((flag) => ({
            label: flag.label,
            severity: flag.severity,
          })),
        },
      },
    });
  }
}

async function seedOpportunities() {
  for (const opp of opportunities) {
    await prisma.opportunity.create({
      data: {
        id: opp.id,
        title: opp.title,
        customerId: opp.customerId,
        stage: toDbEnum(opp.stage) as Prisma.OpportunityCreateInput["stage"],
        intentScore: opp.intentScore,
        estimatedValue: opp.estimatedValue,
        owner: opp.owner,
        updatedAt: new Date(opp.updatedAt),
      },
    });
  }
}

// Link a signal to its customer's most relevant open opportunity when one
// exists, so the graph reflects signal to opportunity relationships.
function opportunityForCustomer(customerId: string): string | null {
  const match = opportunities.find(
    (opp) =>
      opp.customerId === customerId &&
      !["won", "lost", "dormant"].includes(opp.stage),
  );
  return match?.id ?? null;
}

async function seedSignals() {
  for (const signal of signals) {
    await prisma.signal.create({
      data: {
        id: signal.id,
        type: toDbEnum(signal.type) as Prisma.SignalCreateInput["type"],
        label: signal.label,
        customerId: signal.customerId,
        source: toDbEnum(signal.source) as Prisma.SignalCreateInput["source"],
        priority: signal.priority,
        recommendedAction: signal.recommendedAction,
        recommendedChannel: signal.recommendedChannel,
        consentStatus: signal.consentStatus,
        detail: signal.detail,
        opportunityId: opportunityForCustomer(signal.customerId),
        receivedAt: new Date(signal.receivedAt),
      },
    });
  }
}

async function seedCommunications() {
  for (const comm of communications) {
    await prisma.communication.create({
      data: {
        id: comm.id,
        channel: comm.channel,
        customerId: comm.customerId,
        signalId: comm.relatedSignalId,
        opportunityId: opportunityForCustomer(comm.customerId),
        subject: comm.subject,
        preview: comm.preview,
        status: comm.status,
        simulated: true,
        createdAt: new Date(comm.createdAt),
      },
    });
  }
}

async function seedAuditEvents() {
  for (const event of auditEvents) {
    await prisma.auditEvent.create({
      data: {
        id: event.id,
        type: event.type,
        customerId: event.customerId,
        signalId: event.signalId,
        opportunityId: opportunityForCustomer(event.customerId),
        policyDecision: event.policyDecision,
        action: event.action,
        outcome: event.outcome,
        occurredAt: new Date(event.occurredAt),
      },
    });
  }
}

// Persist deterministic policy decisions for signals that carry a clear
// consent outcome, so the policy layer has database-backed records.
async function seedPolicyDecisions() {
  for (const signal of signals) {
    let decision: "allowed" | "blocked" | "needs_review";
    let reason: string;
    let explanation: string;

    if (signal.consentStatus === "revoked" || signal.consentStatus === "denied") {
      decision = "blocked";
      reason = "customer-opted-out";
      explanation = "Consent is not active for this channel, so the action is blocked.";
    } else if (signal.recommendedChannel === "human") {
      decision = "needs_review";
      reason = "human-review-required";
      explanation = "A human task is created for manual handling.";
    } else if (signal.consentStatus === "unknown") {
      decision = "blocked";
      reason = `missing-${signal.recommendedChannel}-consent`;
      explanation = "Consent has not been captured for this channel yet.";
    } else {
      decision = "allowed";
      reason = "consent-present";
      explanation = "Consent is present and no restriction applies, so the action is allowed.";
    }

    await prisma.policyDecision.create({
      data: {
        customerId: signal.customerId,
        signalId: signal.id,
        channel: signal.recommendedChannel,
        decision,
        reason,
        explanation,
      },
    });
  }
}

// Build and persist one simulated workflow run per customer, then assess and
// persist its outcomes, attribution, stage movement, effectiveness, and any
// missed opportunity. Reads through the repositories so the engines see the
// same domain shapes the application uses.
async function seedWorkflowRuns() {
  const persistedCustomers = await findAllCustomers();

  for (const customer of persistedCustomers) {
    const [customerSignals, customerOpportunities, customerCommunications] =
      await Promise.all([
        findSignalsByCustomer(customer.id),
        findOpportunitiesByCustomer(customer.id),
        findCommunicationsByCustomer(customer.id),
      ]);

    const planned = planWorkflowWithScores({
      customer,
      signals: customerSignals,
      opportunities: customerOpportunities,
      communications: customerCommunications,
    });

    const openOpportunity = customerOpportunities.find(
      (opp) => !["won", "lost", "dormant"].includes(opp.stage),
    );

    const runId = await persistWorkflowRun({
      plan: planned.plan,
      opportunityId: openOpportunity?.id ?? null,
      intentScore: planned.intentScore,
      opportunityScore: planned.opportunityScore,
      engagementScore: planned.engagementScore,
    });

    const run = await findWorkflowRunById(runId);
    if (!run) continue;

    const profile = buildIntelligenceProfile({
      customer,
      signals: customerSignals,
      opportunities: customerOpportunities,
      communications: customerCommunications,
    });

    const context = buildOutcomeContext({
      customer,
      profile,
      communications: customerCommunications,
      opportunities: customerOpportunities,
      run,
    });

    const assessment = assessOutcomes(context);

    await persistAssessment({
      customerId: customer.id,
      opportunityId: context.opportunity?.id ?? openOpportunity?.id ?? null,
      workflowRunId: runId,
      assessment,
    });
  }
}

async function main() {
  await reset();
  await seedVerticalPacks();
  await seedCustomers();
  await seedOpportunities();
  await seedSignals();
  await seedCommunications();
  await seedAuditEvents();
  await seedPolicyDecisions();
  await seedWorkflowRuns();

  const [
    customerCount,
    signalCount,
    opportunityCount,
    workflowCount,
    outcomeCount,
    attributionCount,
    missedCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.signal.count(),
    prisma.opportunity.count(),
    prisma.workflowRun.count(),
    prisma.outcomeEvent.count(),
    prisma.revenueAttribution.count(),
    prisma.missedOpportunityEstimate.count(),
  ]);

  console.log(
    `Seed complete: ${customerCount} customers, ${signalCount} signals, ${opportunityCount} opportunities, ${workflowCount} workflow runs, ${outcomeCount} outcome events, ${attributionCount} attributions, ${missedCount} missed estimates.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
