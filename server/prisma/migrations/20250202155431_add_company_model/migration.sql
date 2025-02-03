/*
  Warnings:

  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Component` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Costing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DesignSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EnergyStorageSystem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Incentive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inverter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadCaptureForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrgSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PVModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingScheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectUtilityTariff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProposalTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoofType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `System` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UtilityTariff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowStage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "Component" DROP CONSTRAINT "Component_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContractTemplate" DROP CONSTRAINT "ContractTemplate_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Costing" DROP CONSTRAINT "Costing_orgId_fkey";

-- DropForeignKey
ALTER TABLE "DesignSetting" DROP CONSTRAINT "DesignSetting_orgId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTemplate" DROP CONSTRAINT "DocumentTemplate_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_eventTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EventType" DROP CONSTRAINT "EventType_orgId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Incentive" DROP CONSTRAINT "Incentive_orgId_fkey";

-- DropForeignKey
ALTER TABLE "LeadCaptureForm" DROP CONSTRAINT "LeadCaptureForm_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgSettings" DROP CONSTRAINT "OrgSettings_orgId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentOption" DROP CONSTRAINT "PaymentOption_orgId_fkey";

-- DropForeignKey
ALTER TABLE "PricingScheme" DROP CONSTRAINT "PricingScheme_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ProjectContact" DROP CONSTRAINT "ProjectContact_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectContact" DROP CONSTRAINT "ProjectContact_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRole" DROP CONSTRAINT "ProjectRole_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRole" DROP CONSTRAINT "ProjectRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTag" DROP CONSTRAINT "ProjectTag_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTag" DROP CONSTRAINT "ProjectTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectUtilityTariff" DROP CONSTRAINT "ProjectUtilityTariff_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectUtilityTariff" DROP CONSTRAINT "ProjectUtilityTariff_utilityTariffId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalTemplate" DROP CONSTRAINT "ProposalTemplate_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_orgId_fkey";

-- DropForeignKey
ALTER TABLE "RoofType" DROP CONSTRAINT "RoofType_orgId_fkey";

-- DropForeignKey
ALTER TABLE "System" DROP CONSTRAINT "System_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Testimonial" DROP CONSTRAINT "Testimonial_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UtilityTariff" DROP CONSTRAINT "UtilityTariff_orgId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStage" DROP CONSTRAINT "WorkflowStage_workflowId_fkey";

-- DropTable
DROP TABLE "Action";

-- DropTable
DROP TABLE "Component";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "ContractTemplate";

-- DropTable
DROP TABLE "Costing";

-- DropTable
DROP TABLE "DesignSetting";

-- DropTable
DROP TABLE "DocumentTemplate";

-- DropTable
DROP TABLE "EnergyStorageSystem";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "EventType";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Incentive";

-- DropTable
DROP TABLE "Inverter";

-- DropTable
DROP TABLE "LeadCaptureForm";

-- DropTable
DROP TABLE "Org";

-- DropTable
DROP TABLE "OrgSettings";

-- DropTable
DROP TABLE "PVModule";

-- DropTable
DROP TABLE "PaymentOption";

-- DropTable
DROP TABLE "PricingScheme";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectContact";

-- DropTable
DROP TABLE "ProjectRole";

-- DropTable
DROP TABLE "ProjectTag";

-- DropTable
DROP TABLE "ProjectUtilityTariff";

-- DropTable
DROP TABLE "ProposalTemplate";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoofType";

-- DropTable
DROP TABLE "System";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "Testimonial";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "UtilityTariff";

-- DropTable
DROP TABLE "Workflow";

-- DropTable
DROP TABLE "WorkflowStage";

-- DropEnum
DROP TYPE "AssignmentType";

-- DropEnum
DROP TYPE "ComponentType";

-- DropEnum
DROP TYPE "ContactType";

-- DropEnum
DROP TYPE "FileType";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "RoleType";

-- DropEnum
DROP TYPE "TariffType";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
