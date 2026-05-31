/*
  Warnings:

  - Added the required column `organizationId` to the `AuditEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Communication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ConsentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ContactMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `MissedOpportunityEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `OutcomeEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `PolicyDecision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `RevenueAttribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `RiskFlag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `StageTransition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `WorkflowAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `WorkflowEffectivenessSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `WorkflowResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `WorkflowRun` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SALES_USER', 'SERVICE_USER', 'MARKETING_USER', 'COMPLIANCE_REVIEWER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'USER_CONTEXT_RESOLVED';
ALTER TYPE "AuditEventType" ADD VALUE 'ORGANIZATION_CONTEXT_RESOLVED';
ALTER TYPE "AuditEventType" ADD VALUE 'AUTHORIZATION_CHECK_PASSED';
ALTER TYPE "AuditEventType" ADD VALUE 'AUTHORIZATION_CHECK_FAILED';
ALTER TYPE "AuditEventType" ADD VALUE 'ROLE_ASSIGNED';
ALTER TYPE "AuditEventType" ADD VALUE 'MEMBERSHIP_CREATED';

-- AlterTable
ALTER TABLE "AuditEvent" ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ConsentRecord" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContactMethod" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MissedOpportunityEstimate" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OutcomeEvent" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PolicyDecision" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RevenueAttribution" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RiskFlag" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Signal" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StageTransition" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowAction" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowEffectivenessSnapshot" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowResult" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowRun" ADD COLUMN     "organizationId" TEXT NOT NULL;

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

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_idx" ON "AuditEvent"("organizationId");

-- CreateIndex
CREATE INDEX "Communication_organizationId_idx" ON "Communication"("organizationId");

-- CreateIndex
CREATE INDEX "ConsentRecord_organizationId_idx" ON "ConsentRecord"("organizationId");

-- CreateIndex
CREATE INDEX "ContactMethod_organizationId_idx" ON "ContactMethod"("organizationId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");

-- CreateIndex
CREATE INDEX "MissedOpportunityEstimate_organizationId_idx" ON "MissedOpportunityEstimate"("organizationId");

-- CreateIndex
CREATE INDEX "Opportunity_organizationId_idx" ON "Opportunity"("organizationId");

-- CreateIndex
CREATE INDEX "OutcomeEvent_organizationId_idx" ON "OutcomeEvent"("organizationId");

-- CreateIndex
CREATE INDEX "PolicyDecision_organizationId_idx" ON "PolicyDecision"("organizationId");

-- CreateIndex
CREATE INDEX "RevenueAttribution_organizationId_idx" ON "RevenueAttribution"("organizationId");

-- CreateIndex
CREATE INDEX "RiskFlag_organizationId_idx" ON "RiskFlag"("organizationId");

-- CreateIndex
CREATE INDEX "Signal_organizationId_idx" ON "Signal"("organizationId");

-- CreateIndex
CREATE INDEX "StageTransition_organizationId_idx" ON "StageTransition"("organizationId");

-- CreateIndex
CREATE INDEX "WorkflowAction_organizationId_idx" ON "WorkflowAction"("organizationId");

-- CreateIndex
CREATE INDEX "WorkflowEffectivenessSnapshot_organizationId_idx" ON "WorkflowEffectivenessSnapshot"("organizationId");

-- CreateIndex
CREATE INDEX "WorkflowResult_organizationId_idx" ON "WorkflowResult"("organizationId");

-- CreateIndex
CREATE INDEX "WorkflowRun_organizationId_idx" ON "WorkflowRun"("organizationId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
