-- DropForeignKey
ALTER TABLE "AuditEvent" DROP CONSTRAINT "AuditEvent_customerId_fkey";

-- DropForeignKey
ALTER TABLE "AuditEvent" DROP CONSTRAINT "AuditEvent_workflowRunId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VoicePlan" ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;

-- CreateIndex
CREATE INDEX "AIRecommendation_organizationId_createdAt_idx" ON "AIRecommendation"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_occurredAt_idx" ON "AuditEvent"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "Communication_organizationId_createdAt_idx" ON "Communication"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "OutcomeEvent_organizationId_occurredAt_idx" ON "OutcomeEvent"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "ProviderAuditEvent_organizationId_createdAt_idx" ON "ProviderAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "RevenueAttribution_organizationId_createdAt_idx" ON "RevenueAttribution"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Signal_organizationId_receivedAt_idx" ON "Signal"("organizationId", "receivedAt");

-- CreateIndex
CREATE INDEX "VoiceCall_opportunityId_idx" ON "VoiceCall"("opportunityId");

-- CreateIndex
CREATE INDEX "VoiceCall_organizationId_startedAt_idx" ON "VoiceCall"("organizationId", "startedAt");

-- CreateIndex
CREATE INDEX "VoiceCallOutcome_opportunityId_idx" ON "VoiceCallOutcome"("opportunityId");

-- CreateIndex
CREATE INDEX "VoicePlan_opportunityId_idx" ON "VoicePlan"("opportunityId");

-- CreateIndex
CREATE INDEX "VoicePlan_recommendationId_idx" ON "VoicePlan"("recommendationId");

-- CreateIndex
CREATE INDEX "VoicePlan_organizationId_createdAt_idx" ON "VoicePlan"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowRun_organizationId_createdAt_idx" ON "WorkflowRun"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePlan" ADD CONSTRAINT "VoicePlan_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AIRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
