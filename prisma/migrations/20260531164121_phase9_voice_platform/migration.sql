-- CreateEnum
CREATE TYPE "VoiceComplianceStatusEnum" AS ENUM ('allowed', 'blocked', 'needs_review');

-- CreateEnum
CREATE TYPE "VoicePlanStatusEnum" AS ENUM ('planned', 'blocked', 'needs_review', 'ready', 'simulated', 'archived');

-- CreateEnum
CREATE TYPE "VoiceCallStatusEnum" AS ENUM ('pending', 'simulated', 'blocked', 'no_answer', 'completed');

-- CreateEnum
CREATE TYPE "VoiceCallOutcomeEnum" AS ENUM ('APPOINTMENT_SCHEDULED', 'CALLBACK_REQUESTED', 'CUSTOMER_INTERESTED', 'CUSTOMER_NOT_INTERESTED', 'NEEDS_HUMAN_FOLLOW_UP', 'NO_ANSWER', 'VOICEMAIL_LEFT', 'WRONG_NUMBER', 'COMPLIANCE_STOP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_PLAN_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_COMPLIANCE_ALLOWED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_COMPLIANCE_BLOCKED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_COMPLIANCE_NEEDS_REVIEW';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_CALL_SIMULATED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_TRANSCRIPT_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_OUTCOME_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'VOICE_REVENUE_ATTRIBUTED';

-- CreateTable
CREATE TABLE "VoicePlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "recommendationId" TEXT,
    "purpose" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "scriptType" TEXT NOT NULL,
    "status" "VoicePlanStatusEnum" NOT NULL DEFAULT 'planned',
    "complianceStatus" "VoiceComplianceStatusEnum" NOT NULL DEFAULT 'needs_review',
    "blockedReason" TEXT,
    "expectedOutcome" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoicePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceCall" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "voicePlanId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "status" "VoiceCallStatusEnum" NOT NULL DEFAULT 'pending',
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceTranscript" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "voiceCallId" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceComplianceDecision" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "voicePlanId" TEXT NOT NULL,
    "decision" "VoiceComplianceStatusEnum" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceComplianceDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceCallOutcome" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "voiceCallId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "outcomeType" "VoiceCallOutcomeEnum" NOT NULL,
    "outcomeReason" TEXT NOT NULL,
    "attributedAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceCallOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoicePlan_organizationId_idx" ON "VoicePlan"("organizationId");

-- CreateIndex
CREATE INDEX "VoicePlan_customerId_idx" ON "VoicePlan"("customerId");

-- CreateIndex
CREATE INDEX "VoicePlan_complianceStatus_idx" ON "VoicePlan"("complianceStatus");

-- CreateIndex
CREATE INDEX "VoicePlan_status_idx" ON "VoicePlan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceCall_voicePlanId_key" ON "VoiceCall"("voicePlanId");

-- CreateIndex
CREATE INDEX "VoiceCall_organizationId_idx" ON "VoiceCall"("organizationId");

-- CreateIndex
CREATE INDEX "VoiceCall_customerId_idx" ON "VoiceCall"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceTranscript_voiceCallId_key" ON "VoiceTranscript"("voiceCallId");

-- CreateIndex
CREATE INDEX "VoiceTranscript_organizationId_idx" ON "VoiceTranscript"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceComplianceDecision_voicePlanId_key" ON "VoiceComplianceDecision"("voicePlanId");

-- CreateIndex
CREATE INDEX "VoiceComplianceDecision_organizationId_idx" ON "VoiceComplianceDecision"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceCallOutcome_voiceCallId_key" ON "VoiceCallOutcome"("voiceCallId");

-- CreateIndex
CREATE INDEX "VoiceCallOutcome_organizationId_idx" ON "VoiceCallOutcome"("organizationId");

-- CreateIndex
CREATE INDEX "VoiceCallOutcome_customerId_idx" ON "VoiceCallOutcome"("customerId");

-- AddForeignKey
ALTER TABLE "VoicePlan" ADD CONSTRAINT "VoicePlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePlan" ADD CONSTRAINT "VoicePlan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePlan" ADD CONSTRAINT "VoicePlan_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCall" ADD CONSTRAINT "VoiceCall_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCall" ADD CONSTRAINT "VoiceCall_voicePlanId_fkey" FOREIGN KEY ("voicePlanId") REFERENCES "VoicePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCall" ADD CONSTRAINT "VoiceCall_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_voiceCallId_fkey" FOREIGN KEY ("voiceCallId") REFERENCES "VoiceCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceComplianceDecision" ADD CONSTRAINT "VoiceComplianceDecision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceComplianceDecision" ADD CONSTRAINT "VoiceComplianceDecision_voicePlanId_fkey" FOREIGN KEY ("voicePlanId") REFERENCES "VoicePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCallOutcome" ADD CONSTRAINT "VoiceCallOutcome_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCallOutcome" ADD CONSTRAINT "VoiceCallOutcome_voiceCallId_fkey" FOREIGN KEY ("voiceCallId") REFERENCES "VoiceCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
