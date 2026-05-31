-- CreateEnum
CREATE TYPE "OutcomeEventType" AS ENUM ('CUSTOMER_REPLIED', 'EMAIL_OPENED', 'APPOINTMENT_SCHEDULED', 'APPOINTMENT_CONFIRMED', 'HUMAN_TASK_CREATED', 'HUMAN_HANDOFF_COMPLETED', 'OPPORTUNITY_ADVANCED', 'OPPORTUNITY_WON', 'OPPORTUNITY_LOST', 'OPPORTUNITY_DORMANT', 'OPPORTUNITY_REACTIVATED', 'NO_RESPONSE', 'ACTION_BLOCKED', 'COMPLIANCE_STOP');

-- CreateEnum
CREATE TYPE "AttributionType" AS ENUM ('INFLUENCED', 'ASSISTED', 'RECOVERED', 'PREVENTED_LOSS', 'MISSED');

-- CreateEnum
CREATE TYPE "MissedOpportunitySeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'OUTCOME_EVENT_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'STAGE_TRANSITION_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'REVENUE_ATTRIBUTED';
ALTER TYPE "AuditEventType" ADD VALUE 'MISSED_OPPORTUNITY_ESTIMATED';
ALTER TYPE "AuditEventType" ADD VALUE 'WORKFLOW_EFFECTIVENESS_SCORED';

-- CreateTable
CREATE TABLE "OutcomeEvent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "workflowRunId" TEXT,
    "outcomeType" "OutcomeEventType" NOT NULL,
    "outcomeReason" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "actionType" "ActionTypeEnum",
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutcomeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAttribution" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "workflowRunId" TEXT,
    "attributedAmount" INTEGER NOT NULL,
    "attributionType" "AttributionType" NOT NULL,
    "attributionReason" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTransition" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "fromStage" "OpportunityStage" NOT NULL,
    "toStage" "OpportunityStage" NOT NULL,
    "reason" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEffectivenessSnapshot" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "completionStatus" TEXT NOT NULL,
    "actionsExecuted" INTEGER NOT NULL,
    "actionsBlocked" INTEGER NOT NULL,
    "actionsEscalated" INTEGER NOT NULL,
    "outcomeScore" INTEGER NOT NULL,
    "revenueInfluenced" INTEGER NOT NULL,
    "policyFriction" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowEffectivenessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissedOpportunityEstimate" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "estimatedValue" INTEGER NOT NULL,
    "missedReason" TEXT NOT NULL,
    "severity" "MissedOpportunitySeverity" NOT NULL,
    "recommendedRecoveryAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissedOpportunityEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutcomeEvent_customerId_idx" ON "OutcomeEvent"("customerId");

-- CreateIndex
CREATE INDEX "OutcomeEvent_opportunityId_idx" ON "OutcomeEvent"("opportunityId");

-- CreateIndex
CREATE INDEX "OutcomeEvent_workflowRunId_idx" ON "OutcomeEvent"("workflowRunId");

-- CreateIndex
CREATE INDEX "RevenueAttribution_customerId_idx" ON "RevenueAttribution"("customerId");

-- CreateIndex
CREATE INDEX "RevenueAttribution_opportunityId_idx" ON "RevenueAttribution"("opportunityId");

-- CreateIndex
CREATE INDEX "RevenueAttribution_attributionType_idx" ON "RevenueAttribution"("attributionType");

-- CreateIndex
CREATE INDEX "StageTransition_opportunityId_idx" ON "StageTransition"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowEffectivenessSnapshot_workflowRunId_key" ON "WorkflowEffectivenessSnapshot"("workflowRunId");

-- CreateIndex
CREATE INDEX "MissedOpportunityEstimate_customerId_idx" ON "MissedOpportunityEstimate"("customerId");

-- CreateIndex
CREATE INDEX "MissedOpportunityEstimate_severity_idx" ON "MissedOpportunityEstimate"("severity");

-- AddForeignKey
ALTER TABLE "OutcomeEvent" ADD CONSTRAINT "OutcomeEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeEvent" ADD CONSTRAINT "OutcomeEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeEvent" ADD CONSTRAINT "OutcomeEvent_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAttribution" ADD CONSTRAINT "RevenueAttribution_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAttribution" ADD CONSTRAINT "RevenueAttribution_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAttribution" ADD CONSTRAINT "RevenueAttribution_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEffectivenessSnapshot" ADD CONSTRAINT "WorkflowEffectivenessSnapshot_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissedOpportunityEstimate" ADD CONSTRAINT "MissedOpportunityEstimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissedOpportunityEstimate" ADD CONSTRAINT "MissedOpportunityEstimate_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
