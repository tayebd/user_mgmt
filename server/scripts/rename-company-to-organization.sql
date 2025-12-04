-- Migration script to rename Company tables to Organization
-- This script preserves all data, indexes, and relationships

-- Start transaction
BEGIN;

-- 1. Rename the main tables
ALTER TABLE "Company" RENAME TO "Organization";
ALTER TABLE "CompanyProject" RENAME TO "OrganizationProject";

-- 2. Update sequences
ALTER SEQUENCE "Company_id_seq" RENAME TO "Organization_id_seq";
ALTER SEQUENCE "CompanyProject_id_seq" RENAME TO "OrganizationProject_id_seq";

-- 3. Update foreign key constraints
-- Update constraints that reference Company
ALTER TABLE "Certification" RENAME CONSTRAINT "Certification_companyId_fkey" TO "Certification_organizationId_fkey";
ALTER TABLE "Description" RENAME CONSTRAINT "Description_companyId_fkey" TO "Description_organizationId_fkey";
ALTER TABLE "DigitalProcess" RENAME CONSTRAINT "DigitalProcess_companyId_fkey" TO "DigitalProcess_organizationId_fkey";
ALTER TABLE "Partnership" RENAME CONSTRAINT "Partnership_companyId_fkey" TO "Partnership_organizationId_fkey";
ALTER TABLE "PersonnelSkill" RENAME CONSTRAINT "PersonnelSkill_companyId_fkey" TO "PersonnelSkill_organizationId_fkey";
ALTER TABLE "ProductInnovation" RENAME CONSTRAINT "ProductInnovation_companyId_fkey" TO "ProductInnovation_organizationId_fkey";
ALTER TABLE "Review" RENAME CONSTRAINT "Review_companyId_fkey" TO "Review_organizationId_fkey";
ALTER TABLE "Service" RENAME CONSTRAINT "Service_companyId_fkey" TO "Service_organizationId_fkey";
ALTER TABLE "StrategyAssessment" RENAME CONSTRAINT "StrategyAssessment_companyId_fkey" TO "StrategyAssessment_organizationId_fkey";
ALTER TABLE "TechnologyImplementation" RENAME CONSTRAINT "TechnologyImplementation_companyId_fkey" TO "TechnologyImplementation_organizationId_fkey";
ALTER TABLE "responses" RENAME CONSTRAINT "responses_companyId_fkey" TO "responses_organizationId_fkey";

-- Update constraint on CompanyProject (now OrganizationProject)
ALTER TABLE "OrganizationProject" RENAME CONSTRAINT "CompanyProject_companyId_fkey" TO "OrganizationProject_organizationId_fkey";
ALTER TABLE "ProjectPhoto" RENAME CONSTRAINT "ProjectPhoto_projectId_fkey" TO "ProjectPhoto_organizationProjectId_fkey";

-- 4. Update column names in related tables from companyId to organizationId
-- This ensures consistency with the Prisma schema
ALTER TABLE "Certification" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "Description" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "DigitalProcess" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "Partnership" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "PersonnelSkill" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "ProductInnovation" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "Review" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "Service" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "StrategyAssessment" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "TechnologyImplementation" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "responses" RENAME COLUMN "companyId" TO "organizationId";

-- Update CompanyProject (now OrganizationProject) column
ALTER TABLE "OrganizationProject" RENAME COLUMN "companyId" TO "organizationId";

-- Update fact tables (these might be used for analytics)
ALTER TABLE "PersonnelSkillsFact" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "ProcessDigitizationFact" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "StrategyImplementationFact" RENAME COLUMN "companyId" TO "organizationId";
ALTER TABLE "TechnologyImplementationFact" RENAME COLUMN "companyId" TO "organizationId";

-- 5. Verify the changes
-- Check that tables were renamed
SELECT 'Organization table exists: ' || EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Organization');
SELECT 'OrganizationProject table exists: ' || EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'OrganizationProject');

-- Check that sequences were renamed
SELECT 'Organization_id_seq exists: ' || EXISTS(SELECT 1 FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'Organization_id_seq');
SELECT 'OrganizationProject_id_seq exists: ' || EXISTS(SELECT 1 FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'OrganizationProject_id_seq');

-- Commit transaction
COMMIT;

-- Display success message
SELECT 'Migration completed successfully! Company tables renamed to Organization.' AS result;