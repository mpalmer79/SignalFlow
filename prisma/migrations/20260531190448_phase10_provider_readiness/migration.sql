-- CreateEnum
CREATE TYPE "ProviderCategoryEnum" AS ENUM ('AI_TEXT', 'AI_VOICE', 'TELEPHONY', 'SMS', 'EMAIL', 'INTERNAL_MOCK');

-- CreateEnum
CREATE TYPE "ProviderStatusEnum" AS ENUM ('mocked', 'future_ready', 'disabled', 'blocked');

-- CreateEnum
CREATE TYPE "ProviderReadinessStatusEnum" AS ENUM ('live_ready', 'sandbox_ready', 'not_ready');

-- CreateEnum
CREATE TYPE "ProviderAuditResultEnum" AS ENUM ('allowed', 'blocked', 'simulated', 'recorded');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'PROVIDER_SELECTED';
ALTER TYPE "AuditEventType" ADD VALUE 'PROVIDER_BLOCKED_BY_FLAG';
ALTER TYPE "AuditEventType" ADD VALUE 'PROVIDER_BLOCKED_BY_COMPLIANCE';
ALTER TYPE "AuditEventType" ADD VALUE 'PROVIDER_SANDBOX_RUN';
ALTER TYPE "AuditEventType" ADD VALUE 'PROVIDER_READINESS_CHECKED';
ALTER TYPE "AuditEventType" ADD VALUE 'FEATURE_FLAG_EVALUATED';
ALTER TYPE "AuditEventType" ADD VALUE 'FEATURE_FLAG_UPDATED';

-- CreateTable
CREATE TABLE "ProviderConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "category" "ProviderCategoryEnum" NOT NULL,
    "status" "ProviderStatusEnum" NOT NULL,
    "sandboxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "liveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "complianceApproved" BOOLEAN NOT NULL DEFAULT false,
    "configuredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" "ProviderAuditResultEnum" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderReadinessCheck" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "status" "ProviderReadinessStatusEnum" NOT NULL,
    "missingRequirements" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderReadinessCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderConfiguration_organizationId_idx" ON "ProviderConfiguration"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderConfiguration_organizationId_providerKey_key" ON "ProviderConfiguration"("organizationId", "providerKey");

-- CreateIndex
CREATE INDEX "FeatureFlag_organizationId_idx" ON "FeatureFlag"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_organizationId_flagKey_key" ON "FeatureFlag"("organizationId", "flagKey");

-- CreateIndex
CREATE INDEX "ProviderAuditEvent_organizationId_idx" ON "ProviderAuditEvent"("organizationId");

-- CreateIndex
CREATE INDEX "ProviderAuditEvent_providerKey_idx" ON "ProviderAuditEvent"("providerKey");

-- CreateIndex
CREATE INDEX "ProviderReadinessCheck_organizationId_idx" ON "ProviderReadinessCheck"("organizationId");

-- CreateIndex
CREATE INDEX "ProviderReadinessCheck_providerKey_idx" ON "ProviderReadinessCheck"("providerKey");

-- AddForeignKey
ALTER TABLE "ProviderConfiguration" ADD CONSTRAINT "ProviderConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderAuditEvent" ADD CONSTRAINT "ProviderAuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderReadinessCheck" ADD CONSTRAINT "ProviderReadinessCheck_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
