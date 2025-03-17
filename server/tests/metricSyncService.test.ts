import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';
import { prisma } from '../src/config/db';
import { MetricSyncService } from '../src/services/metricSyncService';
import { ProcessedMetrics } from '../src/types/metrics';
import { Prisma, Survey, User, Company } from '@prisma/client';

describe('Metric Sync Service', () => {
  let testUserId: number;
  let testCompanyId: number;
  let testSurveyId: number;
  let testSurveyResponseId: number;

  // Sample processed metrics for testing
  const mockProcessedMetrics: ProcessedMetrics = {
    timestamp: new Date().toISOString(),
    metrics: {
      technologyMetrics: {
        implementationCount: 3,
        averageMaturity: 0.7,
        implementedTechnologies: ['erp', 'crm', 'scm'],
        maturityScore: 75,
        implementationDetails: {
          systemTypes: ['ERP', 'CRM', 'SCM'],
          integrationLevel: 70,
          analyticsCapabilities: {
            level: 'intermediate',
            capabilities: ['reporting', 'dashboards']
          },
          automationStatus: {
            level: 'medium',
            automatedProcesses: ['sales', 'procurement']
          }
        }
      },
      processMetrics: {
        digitizationLevel: 0.65,
        automationLevel: 0.6,
        processAreas: ['sales', 'procurement']
      },
      personnelMetrics: {
        totalSkilled: 25,
        avgProficiency: 0.7,
        skillDistribution: {
          technical: 0.7,
          analytical: 0.5
        }
      },
      strategyMetrics: {
        strategyMaturity: 0.8,
        implementationProgress: 0.75,
        keyMilestones: ['strategy_defined', 'implementation_started']
      }
    },
    confidenceScores: {
      technology: 0.85,
      process: 0.8,
      personnel: 0.75,
      strategy: 0.9
    }
  };

  beforeAll(async () => {
    // Check if test user exists first
    let user = await prisma.user.findUnique({
      where: { email: 'metric-sync-test@example.com' }
    });
    
    if (!user) {
      // Create test user if it doesn't exist
      user = await prisma.user.create({
        data: {
          email: 'metric-sync-test@example.com',
          name: 'Metric Sync Test User',
          role: 'USER',
          uid: 'metric-sync-test-uid'
        }
      });
    }
    testUserId = user.id;

    // Check if test company exists first
    let company = await prisma.company.findFirst({
      where: {
        name: 'Metric Sync Test Company'
      }
    });
    
    if (!company) {
      // Create test company if it doesn't exist
      company = await prisma.company.create({
        data: {
          name: 'Metric Sync Test Company',
          address: '123 Metric St',
          phone: '555-METRIC'
        }
      });
    }
    testCompanyId = company.id;

    // Check if test survey exists first
    let survey = await prisma.survey.findFirst({
      where: {
        title: 'Metric Sync Test Survey',
        userId: testUserId
      }
    });
    
    if (!survey) {
      // Create test survey if it doesn't exist
      survey = await prisma.survey.create({
        data: {
          title: 'Metric Sync Test Survey',
          description: 'Survey for testing metric sync',
          surveyJson: '{}',
          userId: testUserId
        }
      });
    }
    testSurveyId = survey.id;

    // Check if test survey response exists first
    let surveyResponse = await prisma.surveyResponse.findFirst({
      where: {
        surveyId: testSurveyId,
        userId: testUserId,
        companyId: testCompanyId
      }
    });
    
    if (!surveyResponse) {
      // Create test survey response if it doesn't exist
      surveyResponse = await prisma.surveyResponse.create({
        data: {
          surveyId: testSurveyId,
          userId: testUserId,
          companyId: testCompanyId,
          responseJson: {},
          metricsVersion: '1.0.0',
          processedMetrics: {} // Required field
        }
      });
    }
    testSurveyResponseId = surveyResponse.id;
  });

  afterAll(async () => {
    try {
      // Clean up test data in the correct order to avoid foreign key constraint violations
      
      // First delete survey responses
      await prisma.surveyResponse.deleteMany({
        where: { id: testSurveyResponseId }
      });
      
      // Delete technology implementations
      await prisma.$executeRaw`DELETE FROM "TechnologyImplementation" WHERE "companyId" = ${testCompanyId}`;
      
      // Delete digital processes
      await prisma.digitalProcess.deleteMany({
        where: { companyId: testCompanyId }
      });
      
      // Delete personnel skills
      await prisma.personnelSkill.deleteMany({
        where: { companyId: testCompanyId }
      });
      
      // Delete strategy assessments
      await prisma.strategyAssessment.deleteMany({
        where: { companyId: testCompanyId }
      });
      
      // Delete surveys
      await prisma.survey.deleteMany({
        where: { id: testSurveyId }
      });
      
      // Delete company
      await prisma.company.deleteMany({
        where: { id: testCompanyId }
      });
      
      // First delete ALL technology implementations to avoid foreign key constraint violations
      // This is more thorough than just deleting by companyId
      await prisma.technologyImplementation.deleteMany({});
      
      // Now it's safe to delete technology types
      await prisma.technologyType.deleteMany({
        where: { name: { in: ['erp', 'crm', 'scm'] } }
      });
      
      // Delete user
      await prisma.user.deleteMany({
        where: { id: testUserId }
      });
      
      // Delete process types and skills
      await prisma.processType.deleteMany({
        where: { name: 'GENERAL_BUSINESS_PROCESS' }
      });
      await prisma.skill.deleteMany({
        where: { name: 'DIGITAL_COMPETENCY' }
      });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    } finally {
      // Make sure to disconnect from the database
      await prisma.$disconnect();
    }
  });

  describe('syncMetricsWithDashboard', () => {
    it('should sync processed metrics with dashboard tables', async () => {
      // Call the sync method
      await MetricSyncService.syncMetricsWithDashboard(
        testSurveyResponseId,
        mockProcessedMetrics,
        testCompanyId
      );

      // Verify survey response was updated
      const updatedResponse = await prisma.surveyResponse.findUnique({
        where: { id: testSurveyResponseId }
      });

      expect(updatedResponse).not.toBeNull();
      expect(updatedResponse?.metricsVersion).toBe('1.0.0');
      expect(updatedResponse?.processedMetrics).not.toBeNull();
      
      // Verify technology implementations were created
      const techImplementations = await prisma.technologyImplementation.findMany({
        where: { companyId: testCompanyId }
      });
      
      expect(techImplementations.length).toBeGreaterThanOrEqual(1);
      
      // Verify digital processes were created
      const digitalProcesses = await prisma.digitalProcess.findMany({
        where: { companyId: testCompanyId }
      });
      
      expect(digitalProcesses.length).toBeGreaterThanOrEqual(1);
      
      // Verify personnel skills were created
      const personnelSkills = await prisma.personnelSkill.findMany({
        where: { companyId: testCompanyId }
      });
      
      expect(personnelSkills.length).toBeGreaterThanOrEqual(1);
      
      // Verify strategy assessment was created
      const strategyAssessments = await prisma.strategyAssessment.findMany({
        where: { companyId: testCompanyId }
      });
      
      expect(strategyAssessments.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle invalid metrics data gracefully', async () => {
      // Create a new survey response for this test
      const newSurveyResponse = await prisma.surveyResponse.create({
        data: {
          surveyId: testSurveyId,
          userId: testUserId,
          companyId: testCompanyId,
          responseJson: {},
          metricsVersion: '1.0.0',
          processedMetrics: {} // Adding required field
        }
      });

      // Create metrics with minimal valid structure but some invalid/missing fields
      const invalidMetrics = {
        timestamp: new Date().toISOString(),
        metrics: {
          // Include minimal technology metrics to ensure at least one implementation is created
          technologyMetrics: {
            implementedTechnologies: ['erp'], // Include at least one technology
            averageMaturity: 0.7
          },
          // Other metrics fields are missing or incomplete
        },
        confidenceScores: {
          technology: 0.85,
          process: 0.8,
          personnel: 0.75,
          strategy: 0.9
        }
      } as unknown as ProcessedMetrics;

      // The service should handle this gracefully without throwing
      await expect(
        MetricSyncService.syncMetricsWithDashboard(
          newSurveyResponse.id,
          invalidMetrics,
          testCompanyId
        )
      ).resolves.not.toThrow();

      // Clean up the new survey response
      await prisma.surveyResponse.delete({
        where: { id: newSurveyResponse.id }
      });
    });
  });
});
