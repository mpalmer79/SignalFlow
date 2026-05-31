-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('sms', 'email', 'voice', 'human');

-- CreateEnum
CREATE TYPE "ConsentState" AS ENUM ('granted', 'denied', 'unknown', 'revoked');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('new_lead', 'missed_call', 'appointment_cancellation', 'email_engagement', 'recall_opportunity', 'estimate_request', 'service_due', 'consultation_request');

-- CreateEnum
CREATE TYPE "SignalSource" AS ENUM ('web_form', 'phone', 'email', 'chat', 'third_party', 'scheduler');

-- CreateEnum
CREATE TYPE "SignalPriority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('new', 'contact_attempted', 'engaged', 'appointment_set', 'needs_human_review', 'won', 'lost', 'dormant', 'reactivated');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('drafted', 'queued', 'sent', 'delivered', 'replied', 'failed', 'blocked', 'escalated');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('SIGNAL_RECEIVED', 'INTENT_CLASSIFIED', 'OPPORTUNITY_CREATED', 'POLICY_ALLOWED_ACTION', 'POLICY_BLOCKED_ACTION', 'MESSAGE_DRAFTED', 'VOICE_CALL_QUEUED', 'HUMAN_TASK_CREATED', 'CUSTOMER_OPTED_OUT');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('allowed', 'blocked', 'review', 'recorded');

-- CreateEnum
CREATE TYPE "PolicyDecisionType" AS ENUM ('allowed', 'blocked', 'needs_review');

-- CreateEnum
CREATE TYPE "ComplianceSensitivity" AS ENUM ('standard', 'elevated', 'high');

-- CreateEnum
CREATE TYPE "PackPhaseStatus" AS ENUM ('mvp_focus', 'in_design', 'planned', 'research');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateTable
CREATE TABLE "VerticalPack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keySignals" TEXT[],
    "keyActions" TEXT[],
    "sensitivity" "ComplianceSensitivity" NOT NULL,
    "phaseStatus" "PackPhaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerticalPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "preferredChannel" "Channel" NOT NULL,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "lastAction" TEXT,
    "lastActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMethod" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "value" TEXT NOT NULL,
    "consent" "ConsentState" NOT NULL DEFAULT 'unknown',

    CONSTRAINT "ContactMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "state" "ConsentState" NOT NULL,
    "source" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "type" "SignalType" NOT NULL,
    "label" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "source" "SignalSource" NOT NULL,
    "priority" "SignalPriority" NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "recommendedChannel" "Channel" NOT NULL,
    "consentStatus" "ConsentState" NOT NULL,
    "detail" TEXT NOT NULL,
    "opportunityId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" "OpportunityStage" NOT NULL,
    "intentScore" INTEGER NOT NULL,
    "estimatedValue" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "signalId" TEXT,
    "subject" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "type" "AuditEventType" NOT NULL,
    "customerId" TEXT NOT NULL,
    "signalId" TEXT,
    "opportunityId" TEXT,
    "policyDecision" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" "AuditOutcome" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyDecision" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "signalId" TEXT,
    "channel" "Channel" NOT NULL,
    "decision" "PolicyDecisionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFlag" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "severity" "RiskSeverity" NOT NULL,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_verticalId_idx" ON "Customer"("verticalId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMethod_customerId_channel_key" ON "ContactMethod"("customerId", "channel");

-- CreateIndex
CREATE INDEX "ConsentRecord_customerId_idx" ON "ConsentRecord"("customerId");

-- CreateIndex
CREATE INDEX "Signal_customerId_idx" ON "Signal"("customerId");

-- CreateIndex
CREATE INDEX "Signal_opportunityId_idx" ON "Signal"("opportunityId");

-- CreateIndex
CREATE INDEX "Opportunity_customerId_idx" ON "Opportunity"("customerId");

-- CreateIndex
CREATE INDEX "Opportunity_stage_idx" ON "Opportunity"("stage");

-- CreateIndex
CREATE INDEX "Communication_customerId_idx" ON "Communication"("customerId");

-- CreateIndex
CREATE INDEX "Communication_channel_idx" ON "Communication"("channel");

-- CreateIndex
CREATE INDEX "AuditEvent_customerId_idx" ON "AuditEvent"("customerId");

-- CreateIndex
CREATE INDEX "AuditEvent_occurredAt_idx" ON "AuditEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "PolicyDecision_customerId_idx" ON "PolicyDecision"("customerId");

-- CreateIndex
CREATE INDEX "RiskFlag_customerId_idx" ON "RiskFlag"("customerId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "VerticalPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMethod" ADD CONSTRAINT "ContactMethod_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDecision" ADD CONSTRAINT "PolicyDecision_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDecision" ADD CONSTRAINT "PolicyDecision_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
