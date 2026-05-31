-- CreateEnum
CREATE TYPE "AIRecommendationStatus" AS ENUM ('draft', 'generated', 'pending_review', 'approved', 'rejected', 'executed', 'archived');

-- CreateEnum
CREATE TYPE "AIReviewState" AS ENUM ('pending_review', 'approved', 'rejected', 'needs_revision', 'escalated');

-- CreateEnum
CREATE TYPE "AIReviewDecisionType" AS ENUM ('approved', 'rejected', 'needs_revision', 'escalated');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'AI_RECOMMENDATION_CREATED';
ALTER TYPE "AuditEventType" ADD VALUE 'AI_RECOMMENDATION_APPROVED';
ALTER TYPE "AuditEventType" ADD VALUE 'AI_RECOMMENDATION_REJECTED';
ALTER TYPE "AuditEventType" ADD VALUE 'AI_EXPLANATION_GENERATED';
ALTER TYPE "AuditEventType" ADD VALUE 'AI_REVIEW_REQUIRED';
ALTER TYPE "AuditEventType" ADD VALUE 'AI_REVIEW_COMPLETED';

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "recommendationType" TEXT NOT NULL,
    "recommendationLabel" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "confidenceTier" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "AIRecommendationStatus" NOT NULL DEFAULT 'generated',
    "reviewState" "AIReviewState" NOT NULL DEFAULT 'pending_review',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIExplanation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "reasoningFactors" TEXT[],
    "supportingSignals" TEXT[],
    "riskConsiderations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReviewDecision" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "decision" "AIReviewDecisionType" NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReviewDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIRecommendation_organizationId_idx" ON "AIRecommendation"("organizationId");

-- CreateIndex
CREATE INDEX "AIRecommendation_customerId_idx" ON "AIRecommendation"("customerId");

-- CreateIndex
CREATE INDEX "AIRecommendation_reviewState_idx" ON "AIRecommendation"("reviewState");

-- CreateIndex
CREATE INDEX "AIRecommendation_status_idx" ON "AIRecommendation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AIExplanation_recommendationId_key" ON "AIExplanation"("recommendationId");

-- CreateIndex
CREATE INDEX "AIExplanation_organizationId_idx" ON "AIExplanation"("organizationId");

-- CreateIndex
CREATE INDEX "AIReviewDecision_organizationId_idx" ON "AIReviewDecision"("organizationId");

-- CreateIndex
CREATE INDEX "AIReviewDecision_recommendationId_idx" ON "AIReviewDecision"("recommendationId");

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExplanation" ADD CONSTRAINT "AIExplanation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExplanation" ADD CONSTRAINT "AIExplanation_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AIRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReviewDecision" ADD CONSTRAINT "AIReviewDecision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReviewDecision" ADD CONSTRAINT "AIReviewDecision_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AIRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
