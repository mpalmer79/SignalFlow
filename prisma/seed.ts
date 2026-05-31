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
import { verticalPackConfigs } from "../lib/verticals/registry";
import {
  generateCustomer,
  createRng,
  hashSeed,
} from "../lib/simulation/synthetic-data";
import type { GeneratedCustomer } from "../lib/simulation/synthetic-data";
import { DEMO_ORG_SLUG } from "../lib/repositories/organization-repository";
import type { Role } from "../lib/types/auth";
import { generateRecommendation } from "../lib/ai/ai-engine";
import { determineReviewRequirement } from "../lib/review/review-engine";
import { persistRecommendation, recordReviewDecision } from "../lib/repositories/ai-repository";
import type { ReviewDecision } from "../lib/types/ai";
import { simulateAndPersistVoiceForCustomer } from "../lib/services/voice-simulation-service";

const prisma = new PrismaClient();

// The demo organization id, set during seeding. Every business record is
// attached to it so organization scoping has a real organization to filter by.
let DEMO_ORG_ID = "";

// Seed the demo organization, demo users, and their memberships. Users have no
// Clerk accounts; they exist so the members list and roles render. The demo
// auth context resolves to the owner of this organization.
async function seedOrganization() {
  const org = await prisma.organization.create({
    data: {
      name: "SignalFlow Demo Organization",
      slug: DEMO_ORG_SLUG,
      industry: "Multi-Vertical Revenue Operations",
    },
  });
  DEMO_ORG_ID = org.id;

  const demoUsers: { name: string; email: string; role: Role }[] = [
    { name: "Demo Owner", email: "owner@signalflow.demo", role: "OWNER" },
    { name: "Demo Manager", email: "manager@signalflow.demo", role: "MANAGER" },
    { name: "Demo Sales", email: "sales@signalflow.demo", role: "SALES_USER" },
    {
      name: "Demo Marketing",
      email: "marketing@signalflow.demo",
      role: "MARKETING_USER",
    },
    {
      name: "Demo Compliance",
      email: "compliance@signalflow.demo",
      role: "COMPLIANCE_REVIEWER",
    },
    { name: "Demo Viewer", email: "viewer@signalflow.demo", role: "VIEWER" },
  ];

  for (const demoUser of demoUsers) {
    const user = await prisma.user.create({
      data: { name: demoUser.name, email: demoUser.email },
    });
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: demoUser.role,
        status: "ACTIVE",
      },
    });
  }

  // A representative organization lifecycle audit event.
  await prisma.auditEvent.create({
    data: {
      organizationId: org.id,
      type: "MEMBERSHIP_CREATED",
      policyDecision: "Membership provisioned",
      action: `Seeded ${demoUsers.length} demo memberships for ${org.name}.`,
      outcome: "recorded",
    },
  });
}

// Prisma enums use snake_case while the mock data uses kebab-case. The only
// difference is the separator.
function toDbEnum(value: string): string {
  return value.replace(/-/g, "_");
}

async function reset() {
  // Delete in dependency order. Cascades cover most of this, but explicit
  // deletes keep reseeding deterministic.
  await prisma.voiceCallOutcome.deleteMany();
  await prisma.voiceTranscript.deleteMany();
  await prisma.voiceComplianceDecision.deleteMany();
  await prisma.voiceCall.deleteMany();
  await prisma.voicePlan.deleteMany();
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
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
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
        organizationId: DEMO_ORG_ID,
        name: customer.name,
        verticalId: customer.vertical,
        preferredChannel: customer.preferredChannel,
        optedOut: customer.optedOut,
        lastAction: customer.lastAction,
        lastActionAt: new Date(customer.lastActionAt),
        contactMethods: {
          create: customer.channels.map((channel) => ({
            organizationId: DEMO_ORG_ID,
            channel: channel.channel,
            value: channel.value,
            consent: channel.consent,
          })),
        },
        consentRecords: {
          create: customer.channels.map((channel) => ({
            organizationId: DEMO_ORG_ID,
            channel: channel.channel,
            state: channel.consent,
            source: "phase-0 seed",
            capturedAt: channel.consent === "granted" ? new Date(customer.lastActionAt) : null,
          })),
        },
        riskFlags: {
          create: customer.riskFlags.map((flag) => ({
            organizationId: DEMO_ORG_ID,
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
        organizationId: DEMO_ORG_ID,
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
        organizationId: DEMO_ORG_ID,
        type: toDbEnum(signal.type) as Prisma.SignalCreateInput["type"],
        label: signal.label,
        customerId: signal.customerId,
        source: toDbEnum(signal.source) as Prisma.SignalCreateInput["source"],
        priority: signal.priority,
        recommendedAction: signal.recommendedAction,
        recommendedChannel: signal.recommendedChannel,
        consentStatus: signal.consentStatus,
        detail: signal.detail,
        opportunityId: opportunityForCustomer(signal.customerId) ?? undefined,
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
        organizationId: DEMO_ORG_ID,
        channel: comm.channel,
        customerId: comm.customerId,
        signalId: comm.relatedSignalId ?? undefined,
        opportunityId: opportunityForCustomer(comm.customerId) ?? undefined,
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
        organizationId: DEMO_ORG_ID,
        type: event.type,
        customerId: event.customerId,
        signalId: event.signalId,
        opportunityId: event.customerId
          ? opportunityForCustomer(event.customerId) ?? undefined
          : undefined,
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
        organizationId: DEMO_ORG_ID,
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

// How many synthetic customers to generate per vertical. These join the curated
// hand written examples so every vertical has a believable population.
const POPULATION_SIZES: Record<string, number> = {
  automotive: 24,
  dental: 24,
  "home-services": 24,
  "legal-intake": 15,
  insurance: 15,
};

// Distribute a generated population across intent, consent, and response mixes
// deterministically, so the persisted data has realistic variety.
function populationProfile(rng: () => number) {
  const intentRoll = rng();
  const intentLevel =
    intentRoll > 0.66 ? "high" : intentRoll > 0.33 ? "medium" : "low";
  const consentRoll = rng();
  const optedOut = consentRoll > 0.9;
  const consentState = optedOut
    ? ("revoked" as const)
    : consentRoll > 0.75
      ? ("unknown" as const)
      : ("granted" as const);
  const hasResponse = !optedOut && rng() > 0.5;
  return { intentLevel, consentState, optedOut, hasResponse } as const;
}

async function persistGeneratedCustomer(generated: GeneratedCustomer) {
  const { customer, signals: customerSignals, opportunity } = generated;

  await prisma.customer.create({
    data: {
      id: customer.id,
      organizationId: DEMO_ORG_ID,
      name: customer.name,
      verticalId: customer.vertical,
      preferredChannel: customer.preferredChannel,
      optedOut: customer.optedOut,
      lastAction: customer.lastAction,
      lastActionAt: new Date(customer.lastActionAt),
      contactMethods: {
        create: customer.channels.map((channel) => ({
          organizationId: DEMO_ORG_ID,
          channel: channel.channel,
          value: channel.value,
          consent: channel.consent,
        })),
      },
      consentRecords: {
        create: customer.channels.map((channel) => ({
          organizationId: DEMO_ORG_ID,
          channel: channel.channel,
          state: channel.consent,
          source: "phase-5 generated",
          capturedAt:
            channel.consent === "granted"
              ? new Date(customer.lastActionAt)
              : null,
        })),
      },
      riskFlags: {
        create: customer.riskFlags.map((flag) => ({
          organizationId: DEMO_ORG_ID,
          label: flag.label,
          severity: flag.severity,
        })),
      },
    },
  });

  await prisma.opportunity.create({
    data: {
      id: opportunity.id,
      organizationId: DEMO_ORG_ID,
      title: opportunity.title,
      customerId: opportunity.customerId,
      stage: toDbEnum(opportunity.stage) as Prisma.OpportunityCreateInput["stage"],
      intentScore: opportunity.intentScore,
      estimatedValue: opportunity.estimatedValue,
      owner: opportunity.owner,
      updatedAt: new Date(opportunity.updatedAt),
    },
  });

  for (const signal of customerSignals) {
    await prisma.signal.create({
      data: {
        id: signal.id,
        organizationId: DEMO_ORG_ID,
        type: toDbEnum(signal.type) as Prisma.SignalCreateInput["type"],
        label: signal.label,
        customerId: signal.customerId,
        source: toDbEnum(signal.source) as Prisma.SignalCreateInput["source"],
        priority: signal.priority,
        recommendedAction: signal.recommendedAction,
        recommendedChannel: signal.recommendedChannel,
        consentStatus: signal.consentStatus,
        detail: signal.detail,
        opportunityId: opportunity.id,
        receivedAt: new Date(signal.receivedAt),
      },
    });
  }

  if (generated.hasResponse) {
    await prisma.communication.create({
      data: {
        organizationId: DEMO_ORG_ID,
        channel: customer.preferredChannel,
        customerId: customer.id,
        opportunityId: opportunity.id,
        signalId: customerSignals[0]?.id ?? undefined,
        subject: "Customer reply",
        preview: "Customer engaged with the simulated outreach.",
        status: "replied",
        simulated: true,
        createdAt: new Date(customer.lastActionAt),
      },
    });
  }
}

// Generate and persist believable populations for each vertical pack. These
// reuse the same deterministic generator the scenario and simulation engines
// use, so the persisted data is consistent with the live tools.
async function seedGeneratedPopulations() {
  for (const pack of verticalPackConfigs) {
    const size = POPULATION_SIZES[pack.id] ?? 12;
    const rng = createRng(hashSeed(`seed-population:${pack.id}`));

    for (let i = 0; i < size; i += 1) {
      const profile = populationProfile(rng);
      const generated = generateCustomer({
        pack,
        index: i + 1000,
        seedKey: `seed-population:${pack.id}`,
        intentLevel: profile.intentLevel,
        consentState: profile.consentState,
        optedOut: profile.optedOut,
        hasResponse: profile.hasResponse,
      });
      await persistGeneratedCustomer(generated);
    }
  }
}

// Build and persist one simulated workflow run per customer, then assess and
// persist its outcomes, attribution, stage movement, effectiveness, and any
// missed opportunity. Reads through the repositories so the engines see the
// same domain shapes the application uses.
async function seedWorkflowRuns() {
  const persistedCustomers = await findAllCustomers(DEMO_ORG_ID);

  for (const customer of persistedCustomers) {
    const [customerSignals, customerOpportunities, customerCommunications] =
      await Promise.all([
        findSignalsByCustomer(DEMO_ORG_ID, customer.id),
        findOpportunitiesByCustomer(DEMO_ORG_ID, customer.id),
        findCommunicationsByCustomer(DEMO_ORG_ID, customer.id),
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
      organizationId: DEMO_ORG_ID,
      plan: planned.plan,
      opportunityId: openOpportunity?.id ?? null,
      intentScore: planned.intentScore,
      opportunityScore: planned.opportunityScore,
      engagementScore: planned.engagementScore,
    });

    const run = await findWorkflowRunById(DEMO_ORG_ID, runId);
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
      organizationId: DEMO_ORG_ID,
      customerId: customer.id,
      opportunityId: context.opportunity?.id ?? openOpportunity?.id ?? null,
      workflowRunId: runId,
      assessment,
    });
  }
}

// Generate and persist an AI recommendation per customer, then apply a
// deterministic spread of review decisions so the queue shows approved,
// rejected, pending, and escalated states. Reviewers are the seeded demo users.
async function seedAIRecommendations() {
  const persistedCustomers = await findAllCustomers(DEMO_ORG_ID);
  const reviewers = [
    { id: "demo-manager", name: "Demo Manager" },
    { id: "demo-owner", name: "Demo Owner" },
  ];

  let index = 0;
  for (const customer of persistedCustomers) {
    const [customerSignals, customerOpportunities, customerCommunications] =
      await Promise.all([
        findSignalsByCustomer(DEMO_ORG_ID, customer.id),
        findOpportunitiesByCustomer(DEMO_ORG_ID, customer.id),
        findCommunicationsByCustomer(DEMO_ORG_ID, customer.id),
      ]);

    const profile = buildIntelligenceProfile({
      customer,
      signals: customerSignals,
      opportunities: customerOpportunities,
      communications: customerCommunications,
    });

    const recommendation = generateRecommendation(profile);
    const review = determineReviewRequirement(recommendation);

    const openOpportunity = customerOpportunities.find(
      (opp) => !["won", "lost", "dormant"].includes(opp.stage),
    );

    const recommendationId = await persistRecommendation({
      organizationId: DEMO_ORG_ID,
      recommendation,
      opportunityId: openOpportunity?.id ?? null,
      status: review.requiresReview ? "pending-review" : "generated",
      reviewState: review.recommendedState,
      reviewReasons: review.reasons,
    });

    // Apply a deterministic review decision to recommendations that do not
    // require review, and to a rotating subset of those that do, so the queue
    // shows every state. Recommendations that require review and are not acted
    // on remain pending.
    let decision: ReviewDecision | null = null;
    if (!review.requiresReview) {
      decision = "approved";
    } else if (index % 4 === 0) {
      decision = "rejected";
    } else if (index % 4 === 1) {
      decision = "escalated";
    }

    if (decision) {
      const reviewer = reviewers[index % reviewers.length];
      await recordReviewDecision({
        organizationId: DEMO_ORG_ID,
        recommendationId,
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        decision,
        notes:
          decision === "approved"
            ? "Confidence and consent support the recommendation."
            : decision === "rejected"
              ? "Held back pending more signal."
              : "Escalated to a senior reviewer.",
      });
    }

    index += 1;
  }
}

// Seed deterministic voice plans across every customer. The voice consent,
// quiet hours, no-response count, and review approval are derived from the
// customer index so the seed produces a spread of allowed, blocked, and
// needs-review plans, plus a range of simulated call outcomes. Voice is fully
// simulated: no call is placed and no provider is contacted.
async function seedVoicePlans() {
  const persistedCustomers = await findAllCustomers(DEMO_ORG_ID);

  let index = 0;
  for (const customer of persistedCustomers) {
    // Derive deterministic conditions from the index so the demo shows every
    // compliance state. Voice consent and opt-out come from the persisted
    // customer channels, read inside the simulation service. Quiet hours,
    // no-response count, and review approval are derived here.
    const quietHours = index % 7 === 3; // a slice fall inside quiet hours
    const noResponseCount = index % 9 === 4 ? 3 : index % 3; // a slice hit the limit
    const reviewApproved = index % 4 !== 2; // a slice await human approval

    await simulateAndPersistVoiceForCustomer({
      organizationId: DEMO_ORG_ID,
      customerId: customer.id,
      reviewApproved,
      quietHours,
      noResponseCount,
    });

    index += 1;
  }
}

async function main() {
  await reset();
  await seedOrganization();
  await seedVerticalPacks();
  await seedCustomers();
  await seedOpportunities();
  await seedSignals();
  await seedCommunications();
  await seedAuditEvents();
  await seedPolicyDecisions();
  await seedGeneratedPopulations();
  await seedWorkflowRuns();
  await seedAIRecommendations();
  await seedVoicePlans();

  const [
    customerCount,
    signalCount,
    opportunityCount,
    workflowCount,
    outcomeCount,
    attributionCount,
    missedCount,
    recommendationCount,
    reviewDecisionCount,
    voicePlanCount,
    voiceCallCount,
    voiceOutcomeCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.signal.count(),
    prisma.opportunity.count(),
    prisma.workflowRun.count(),
    prisma.outcomeEvent.count(),
    prisma.revenueAttribution.count(),
    prisma.missedOpportunityEstimate.count(),
    prisma.aIRecommendation.count(),
    prisma.aIReviewDecision.count(),
    prisma.voicePlan.count(),
    prisma.voiceCall.count(),
    prisma.voiceCallOutcome.count(),
  ]);

  console.log(
    `Seed complete: ${customerCount} customers, ${signalCount} signals, ${opportunityCount} opportunities, ${workflowCount} workflow runs, ${outcomeCount} outcome events, ${attributionCount} attributions, ${missedCount} missed estimates, ${recommendationCount} AI recommendations, ${reviewDecisionCount} review decisions, ${voicePlanCount} voice plans, ${voiceCallCount} voice calls, ${voiceOutcomeCount} voice outcomes.`,
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
