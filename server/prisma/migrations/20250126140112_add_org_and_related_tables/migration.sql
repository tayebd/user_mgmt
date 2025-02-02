-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'VENDOR', 'CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('TEAM_MEMBER', 'SITE_INSPECTOR', 'INSTALLER', 'DESIGNER', 'SALESPERSON');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('ASSIGNED_ROLE', 'ASSIGNED_INSTALLER', 'ASSIGNED_SITE_INSPECTOR', 'ASSIGNED_DESIGNER', 'ASSIGNED_SALESPERSON');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TariffType" AS ENUM ('CURRENT', 'PROPOSED');

-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('MODULE', 'INVERTER', 'BATTERY', 'OTHER');

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "type" "ContactType" NOT NULL DEFAULT 'INDIVIDUAL',
    "identifier" TEXT,
    "licenceNumber" TEXT,
    "customContactInfo1" TEXT,
    "customContactInfo2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContact" (
    "projectId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "ProjectContact_pkey" PRIMARY KEY ("projectId","contactId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "roleType" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRole" (
    "projectId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL,

    CONSTRAINT "ProjectRole_pkey" PRIMARY KEY ("projectId","roleId")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "annualProduction" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UtilityTariff" (
    "id" TEXT NOT NULL,
    "tariffDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "UtilityTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUtilityTariff" (
    "projectId" TEXT NOT NULL,
    "utilityTariffId" TEXT NOT NULL,
    "tariffType" "TariffType" NOT NULL,

    CONSTRAINT "ProjectUtilityTariff_pkey" PRIMARY KEY ("projectId","utilityTariffId")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "activeStageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "orgId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("orgId","roleId")
);

-- CreateTable
CREATE TABLE "OrgSettings" (
    "orgId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,

    CONSTRAINT "OrgSettings_pkey" PRIMARY KEY ("orgId","settingKey")
);

-- CreateTable
CREATE TABLE "PricingScheme" (
    "id" TEXT NOT NULL,
    "schemeDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "PricingScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOption" (
    "id" TEXT NOT NULL,
    "optionDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "PaymentOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Costing" (
    "id" TEXT NOT NULL,
    "costingDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Costing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignSetting" (
    "id" TEXT NOT NULL,
    "settingType" TEXT NOT NULL,
    "settingDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "DesignSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "componentType" "ComponentType" NOT NULL,
    "details" JSONB NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incentive" (
    "id" TEXT NOT NULL,
    "incentiveDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Incentive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCaptureForm" (
    "id" TEXT NOT NULL,
    "formDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "LeadCaptureForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoofType" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "RoofType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "milestone" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowStageId" TEXT NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transactionDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalTemplate" (
    "id" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "ProposalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTag" (
    "projectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProjectTag_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_apiKey_key" ON "Org"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_identifier_key" ON "Contact"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_licenceNumber_key" ON "Contact"("licenceNumber");

-- CreateIndex
CREATE INDEX "Contact_orgId_idx" ON "Contact"("orgId");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "ProjectContact_projectId_idx" ON "ProjectContact"("projectId");

-- CreateIndex
CREATE INDEX "ProjectContact_contactId_idx" ON "ProjectContact"("contactId");

-- CreateIndex
CREATE INDEX "ProjectRole_projectId_idx" ON "ProjectRole"("projectId");

-- CreateIndex
CREATE INDEX "ProjectRole_roleId_idx" ON "ProjectRole"("roleId");

-- CreateIndex
CREATE INDEX "System_projectId_idx" ON "System"("projectId");

-- CreateIndex
CREATE INDEX "Event_projectId_idx" ON "Event"("projectId");

-- CreateIndex
CREATE INDEX "Event_eventTypeId_idx" ON "Event"("eventTypeId");

-- CreateIndex
CREATE INDEX "File_projectId_idx" ON "File"("projectId");

-- CreateIndex
CREATE INDEX "ProjectUtilityTariff_projectId_idx" ON "ProjectUtilityTariff"("projectId");

-- CreateIndex
CREATE INDEX "ProjectUtilityTariff_utilityTariffId_idx" ON "ProjectUtilityTariff"("utilityTariffId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_workflowId_key" ON "Workflow"("workflowId");

-- CreateIndex
CREATE INDEX "Team_orgId_idx" ON "Team"("orgId");

-- CreateIndex
CREATE INDEX "Team_roleId_idx" ON "Team"("roleId");

-- CreateIndex
CREATE INDEX "OrgSettings_orgId_idx" ON "OrgSettings"("orgId");

-- CreateIndex
CREATE INDEX "PricingScheme_orgId_idx" ON "PricingScheme"("orgId");

-- CreateIndex
CREATE INDEX "PaymentOption_orgId_idx" ON "PaymentOption"("orgId");

-- CreateIndex
CREATE INDEX "Costing_orgId_idx" ON "Costing"("orgId");

-- CreateIndex
CREATE INDEX "DesignSetting_orgId_idx" ON "DesignSetting"("orgId");

-- CreateIndex
CREATE INDEX "Component_orgId_idx" ON "Component"("orgId");

-- CreateIndex
CREATE INDEX "Incentive_orgId_idx" ON "Incentive"("orgId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_orgId_idx" ON "DocumentTemplate"("orgId");

-- CreateIndex
CREATE INDEX "LeadCaptureForm_orgId_idx" ON "LeadCaptureForm"("orgId");

-- CreateIndex
CREATE INDEX "RoofType_orgId_idx" ON "RoofType"("orgId");

-- CreateIndex
CREATE INDEX "Action_workflowStageId_idx" ON "Action"("workflowStageId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso2_key" ON "Country"("iso2");

-- CreateIndex
CREATE INDEX "Testimonial_projectId_idx" ON "Testimonial"("projectId");

-- CreateIndex
CREATE INDEX "Transaction_projectId_idx" ON "Transaction"("projectId");

-- CreateIndex
CREATE INDEX "ContractTemplate_orgId_idx" ON "ContractTemplate"("orgId");

-- CreateIndex
CREATE INDEX "ProposalTemplate_orgId_idx" ON "ProposalTemplate"("orgId");

-- CreateIndex
CREATE INDEX "ProjectTag_projectId_idx" ON "ProjectTag"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTag_tagId_idx" ON "ProjectTag"("tagId");

-- CreateIndex
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilityTariff" ADD CONSTRAINT "UtilityTariff_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUtilityTariff" ADD CONSTRAINT "ProjectUtilityTariff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUtilityTariff" ADD CONSTRAINT "ProjectUtilityTariff_utilityTariffId_fkey" FOREIGN KEY ("utilityTariffId") REFERENCES "UtilityTariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSettings" ADD CONSTRAINT "OrgSettings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingScheme" ADD CONSTRAINT "PricingScheme_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOption" ADD CONSTRAINT "PaymentOption_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costing" ADD CONSTRAINT "Costing_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignSetting" ADD CONSTRAINT "DesignSetting_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCaptureForm" ADD CONSTRAINT "LeadCaptureForm_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoofType" ADD CONSTRAINT "RoofType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("workflowId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalTemplate" ADD CONSTRAINT "ProposalTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
