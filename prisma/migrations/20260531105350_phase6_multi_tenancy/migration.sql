-- Phase 6 multi-tenancy migration.
-- This migration is backfill safe. It creates the organization tables, inserts
-- the demo organization, adds organizationId as nullable, backfills every
-- existing row to the demo organization, then enforces NOT NULL. It therefore
-- succeeds against both an empty and a non-empty local database.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SALES_USER', 'SERVICE_USER', 'MARKETING_USER', 'COMPLIANCE_REVIEWER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- AlterEnum: add authorization and membership lifecycle audit event types.
ALTER TYPE "AuditEventType" ADD VALUE 'USER_CONTEXT_RESOLVED';
ALTER TYPE "AuditEventType" ADD VALUE 'ORGANIZATION_CONTEXT_RESOLVED';
ALTER TYPE "AuditEventType" ADD VALUE 'AUTHORIZATION_CHECK_PASSED';
ALTER TYPE "AuditEventType" ADD VALUE 'AUTHORIZATION_CHECK_FAILED';
ALTER TYPE "AuditEventType" ADD VALUE 'ROLE_ASSIGNED';
ALTER TYPE "AuditEventType" ADD VALUE 'MEMBERSHIP_CREATED';

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill organization. Insert the demo organization so existing business
-- rows have a tenant to attach to. The seed creates a fresh organization when
-- the database is reset, so this row only matters when upgrading a non-empty
-- database in place.
INSERT INTO "Organization" ("id", "name", "slug", "industry", "createdAt", "updatedAt")
VALUES ('org_demo_phase6_backfill', 'SignalFlow Demo Organization', 'signalflow-demo', 'Multi-Vertical Revenue Operations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- AlterTable: AuditEvent customerId becomes nullable for organization events.
ALTER TABLE "AuditEvent" ALTER COLUMN "customerId" DROP NOT NULL;

-- Add organizationId as nullable, backfill, then enforce NOT NULL per table.
ALTER TABLE "AuditEvent" ADD COLUMN "organizationId" TEXT;
UPDATE "AuditEvent" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "AuditEvent" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Communication" ADD COLUMN "organizationId" TEXT;
UPDATE "Communication" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "Communication" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "ConsentRecord" ADD COLUMN "organizationId" TEXT;
UPDATE "ConsentRecord" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "ConsentRecord" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "ContactMethod" ADD COLUMN "organizationId" TEXT;
UPDATE "ContactMethod" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "ContactMethod" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Customer" ADD COLUMN "organizationId" TEXT;
UPDATE "Customer" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "Customer" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "MissedOpportunityEstimate" ADD COLUMN "organizationId" TEXT;
UPDATE "MissedOpportunityEstimate" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "MissedOpportunityEstimate" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Opportunity" ADD COLUMN "organizationId" TEXT;
UPDATE "Opportunity" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "Opportunity" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "OutcomeEvent" ADD COLUMN "organizationId" TEXT;
UPDATE "OutcomeEvent" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "OutcomeEvent" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "PolicyDecision" ADD COLUMN "organizationId" TEXT;
UPDATE "PolicyDecision" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "PolicyDecision" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "RevenueAttribution" ADD COLUMN "organizationId" TEXT;
UPDATE "RevenueAttribution" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "RevenueAttribution" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "RiskFlag" ADD COLUMN "organizationId" TEXT;
UPDATE "RiskFlag" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "RiskFlag" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Signal" ADD COLUMN "organizationId" TEXT;
UPDATE "Signal" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "Signal" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "StageTransition" ADD COLUMN "organizationId" TEXT;
UPDATE "StageTransition" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "StageTransition" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "WorkflowAction" ADD COLUMN "organizationId" TEXT;
UPDATE "WorkflowAction" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "WorkflowAction" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "WorkflowEffectivenessSnapshot" ADD COLUMN "organizationId" TEXT;
UPDATE "WorkflowEffectivenessSnapshot" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "WorkflowEffectivenessSnapshot" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "WorkflowResult" ADD COLUMN "organizationId" TEXT;
UPDATE "WorkflowResult" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "WorkflowResult" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "WorkflowRun" ADD COLUMN "organizationId" TEXT;
UPDATE "WorkflowRun" SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "slug" = 'signalflow-demo') WHERE "organizationId" IS NULL;
ALTER TABLE "WorkflowRun" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_idx" ON "AuditEvent"("organizationId");
CREATE INDEX "Communication_organizationId_idx" ON "Communication"("organizationId");
CREATE INDEX "ConsentRecord_organizationId_idx" ON "ConsentRecord"("organizationId");
CREATE INDEX "ContactMethod_organizationId_idx" ON "ContactMethod"("organizationId");
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE INDEX "MissedOpportunityEstimate_organizationId_idx" ON "MissedOpportunityEstimate"("organizationId");
CREATE INDEX "Opportunity_organizationId_idx" ON "Opportunity"("organizationId");
CREATE INDEX "OutcomeEvent_organizationId_idx" ON "OutcomeEvent"("organizationId");
CREATE INDEX "PolicyDecision_organizationId_idx" ON "PolicyDecision"("organizationId");
CREATE INDEX "RevenueAttribution_organizationId_idx" ON "RevenueAttribution"("organizationId");
CREATE INDEX "RiskFlag_organizationId_idx" ON "RiskFlag"("organizationId");
CREATE INDEX "Signal_organizationId_idx" ON "Signal"("organizationId");
CREATE INDEX "StageTransition_organizationId_idx" ON "StageTransition"("organizationId");
CREATE INDEX "WorkflowAction_organizationId_idx" ON "WorkflowAction"("organizationId");
CREATE INDEX "WorkflowEffectivenessSnapshot_organizationId_idx" ON "WorkflowEffectivenessSnapshot"("organizationId");
CREATE INDEX "WorkflowResult_organizationId_idx" ON "WorkflowResult"("organizationId");
CREATE INDEX "WorkflowRun_organizationId_idx" ON "WorkflowRun"("organizationId");
