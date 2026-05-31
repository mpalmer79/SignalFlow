-- CreateEnum
CREATE TYPE "WorkflowOutcomeType" AS ENUM ('completed', 'partially_completed', 'blocked', 'escalated', 'paused', 'failed_validation');

-- CreateEnum
CREATE TYPE "ActionTypeEnum" AS ENUM ('SEND_SMS', 'SEND_EMAIL', 'PLACE_VOICE_CALL', 'CREATE_TASK', 'ASSIGN_OWNER', 'BOOK_APPOINTMENT', 'ESCALATE_MANAGER', 'REVIEW_OPPORTUNITY', 'PAUSE_OUTREACH', 'CLOSE_OPPORTUNITY');

-- CreateEnum
CREATE TYPE "WorkflowActionStatus" AS ENUM ('planned', 'executed', 'blocked', 'skipped', 'escalated');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'WORKFLOW_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'WORKFLOW_STARTED';
ALTER TYPE "AuditEventType" ADD VALUE 'ACTION_ALLOWED';
ALTER TYPE "AuditEventType" ADD VALUE 'ACTION_BLOCKED';
ALTER TYPE "AuditEventType" ADD VALUE 'ACTION_EXECUTED';
ALTER TYPE "AuditEventType" ADD VALUE 'ESCALATION_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'WORKFLOW_COMPLETED';

-- AlterTable
ALTER TABLE "AuditEvent" ADD COLUMN     "workflowRunId" TEXT;

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "title" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "intentScore" INTEGER NOT NULL,
    "opportunityScore" INTEGER NOT NULL,
    "engagementScore" INTEGER NOT NULL,
    "outcome" "WorkflowOutcomeType" NOT NULL,
    "actionsExecuted" INTEGER NOT NULL DEFAULT 0,
    "actionsBlocked" INTEGER NOT NULL DEFAULT 0,
    "actionsEscalated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAction" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "actionType" "ActionTypeEnum" NOT NULL,
    "channel" "Channel",
    "status" "WorkflowActionStatus" NOT NULL,
    "policyOutcome" "PolicyDecisionType" NOT NULL,
    "offsetMinutes" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowResult" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "outcome" "WorkflowOutcomeType" NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowRun_customerId_idx" ON "WorkflowRun"("customerId");

-- CreateIndex
CREATE INDEX "WorkflowRun_outcome_idx" ON "WorkflowRun"("outcome");

-- CreateIndex
CREATE INDEX "WorkflowAction_workflowRunId_idx" ON "WorkflowAction"("workflowRunId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowResult_workflowRunId_key" ON "WorkflowResult"("workflowRunId");

-- CreateIndex
CREATE INDEX "AuditEvent_workflowRunId_idx" ON "AuditEvent"("workflowRunId");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowResult" ADD CONSTRAINT "WorkflowResult_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
