import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';
import { prisma } from '../src/config/db';
import { AnalyticsService, AnalyticsError } from '../src/services/analyticsService';

describe('Analytics Service', () => {
  let analyticsService: AnalyticsService;
  let testOrganizationId: number;
  let testIndustryId: number;

  beforeAll(async () => {
    analyticsService = new AnalyticsService();

    // Create test industry
    const industry = await prisma.industry.create({
      data: {
        name: 'Test Industry',
        description: 'Test Industry Description'
      }
    });
    testIndustryId = industry.id;

    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Analytics Organization',
        address: '123 Analytics St',
        phone: '555-0000',
        industryId: testIndustryId
      }
    });
    testOrganizationId = organization.id;

    // Create test process types first
    const processType1 = await prisma.processType.create({
      data: {
        name: 'Test Process Type 1',
        category: 'Production',
        description: 'Test Process Type 1 Description'
      }
    });

    const processType2 = await prisma.processType.create({
      data: {
        name: 'Test Process Type 2',
        category: 'HR',
        description: 'Test Process Type 2 Description'
      }
    });

    // Create test digital processes
    await prisma.digitalProcess.createMany({
      data: [
        {
          organizationId: testOrganizationId,
          processTypeId: processType1.id,
          digitizationLevel: 4,
          automationLevel: 3,
          implementationDate: new Date(),
          lastAssessmentDate: new Date()
        },
        {
          organizationId: testOrganizationId,
          processTypeId: processType2.id,
          digitizationLevel: 5,
          automationLevel: 4,
          implementationDate: new Date(),
          lastAssessmentDate: new Date()
        }
      ]
    });

    // Create test skills
    const skill1 = await prisma.skill.create({
      data: {
        name: 'Test Skill 1',
        category: 'Technical',
        i40Relevance: true,
        description: 'Test Skill 1 Description'
      }
    });

    const skill2 = await prisma.skill.create({
      data: {
        name: 'Test Skill 2',
        category: 'Management',
        i40Relevance: true,
        description: 'Test Skill 2 Description'
      }
    });

    // Create test personnel skills
    await prisma.personnelSkill.createMany({
      data: [
        {
          organizationId: testOrganizationId,
          skillId: skill1.id,
          numberOfPersonnel: 10,
          proficiencyLevel: 4,
          assessmentDate: new Date()
        },
        {
          organizationId: testOrganizationId,
          skillId: skill2.id,
          numberOfPersonnel: 15,
          proficiencyLevel: 3,
          assessmentDate: new Date()
        }
      ]
    });

    // Create test strategy assessment
    await prisma.strategyAssessment.create({
      data: {
        organizationId: testOrganizationId,
        hasI40Strategy: true,
        strategyMaturity: 4,
        implementationProgress: 75,
        nextReviewDate: new Date('2025-12-31'),
        assessmentDate: new Date()
      }
    });

    // Create test facts for trends
    const dates = [5, 4, 3, 2, 1, 0].map(months => {
      const date = new Date();
      date.setMonth(date.getMonth() - months);
      return date;
    });

    await Promise.all(dates.map(date => 
      prisma.technologyImplementationFact.create({
        data: {
          organizationId: testOrganizationId,
          sectorId: testIndustryId,
          date,
          technologyCount: 0,
          avgMaturityLevel: 0,
          totalInvestment: 0,
          implementationStatusCounts: JSON.stringify({
            planning: 1,
            inProgress: 2,
            completed: 1
          })
        }
      })
    ));

    await Promise.all(dates.map(date => 
      prisma.processDigitizationFact.create({
        data: {
          organizationId: testOrganizationId,
          sectorId: testIndustryId,
          processId: processType1.id,
          date,
          avgDigitizationLevel: 0,
          avgAutomationLevel: 0,
          processCount: 0
        }
      })
    ));
  });

  afterAll(async () => {
    // Clean up test data in correct order to handle foreign key constraints
    await prisma.technologyImplementationFact.deleteMany({
      where: { 
        OR: [
          { organizationId: testOrganizationId },
          { sectorId: testIndustryId }
        ]
      }
    });
    await prisma.processDigitizationFact.deleteMany({
      where: { 
        OR: [
          { organizationId: testOrganizationId },
          { sectorId: testIndustryId }
        ]
      }
    });
    await prisma.personnelSkill.deleteMany({
      where: { organizationId: testOrganizationId }
    });
    await prisma.digitalProcess.deleteMany({
      where: { organizationId: testOrganizationId }
    });
    await prisma.strategyAssessment.deleteMany({
      where: { organizationId: testOrganizationId }
    });
    // Delete skills after personnel skills
    await prisma.skill.deleteMany({
      where: { name: { startsWith: 'Test Skill' } }
    });
    // Delete process types after digital processes
    await prisma.processType.deleteMany({
      where: { name: { startsWith: 'Test Process Type' } }
    });
    // Delete all organizations in the test industry
    await prisma.organization.deleteMany({
      where: { industryId: testIndustryId }
    });
    // Now we can safely delete the industry
    await prisma.industry.delete({
      where: { id: testIndustryId }
    });
    await prisma.$disconnect();
  });

  describe('getDashboardMetrics', () => {
    it('should return complete dashboard metrics for a valid organization', async () => {
      const metrics = await analyticsService.getDashboardMetrics(testOrganizationId);

      // Test technology metrics from fact table
      expect(metrics.technologyMetrics.implementationCount).toBe(0);
      expect(metrics.technologyMetrics.averageMaturity).toBeNull();
      expect(metrics.technologyMetrics.trendData).toHaveLength(6);
      expect(metrics.technologyMetrics.trendData[0]).toHaveProperty('date');
      expect(metrics.technologyMetrics.trendData[0]).toHaveProperty('count');
      expect(metrics.technologyMetrics.trendData[0]).toHaveProperty('maturityLevel');

      // Test process metrics
      expect(metrics.processMetrics.digitizationLevel).toBe(4.5);
      expect(metrics.processMetrics.automationLevel).toBe(3.5);
      expect(metrics.processMetrics.trendData).toHaveLength(6);
      expect(metrics.processMetrics.trendData[0]).toHaveProperty('date');
      expect(metrics.processMetrics.trendData[0]).toHaveProperty('digitizationLevel');
      expect(metrics.processMetrics.trendData[0]).toHaveProperty('automationLevel');

      // Test personnel metrics
      expect(metrics.personnelMetrics.totalSkilled).toBe(25);
      expect(metrics.personnelMetrics.avgProficiency).toBe(3.5);
      expect(metrics.personnelMetrics.skillDistribution).toHaveLength(2);
      expect(metrics.personnelMetrics.skillDistribution[0]).toHaveProperty('category');
      expect(metrics.personnelMetrics.skillDistribution[0]).toHaveProperty('count');

      // Test strategy metrics
      expect(metrics.strategyMetrics.hasI40Strategy).toBe(true);
      expect(metrics.strategyMetrics.implementationProgress).toBe(75);
      expect(metrics.strategyMetrics.strategyMaturity).toBe(4);
      expect(metrics.strategyMetrics.nextReviewDate).toBeInstanceOf(Date);

      // Test sector comparison
      expect(metrics.sectorComparison.organizationMaturity).toBe(0);
      expect(metrics.sectorComparison.sectorAvgMaturity).toBe(0);
      expect(metrics.sectorComparison.sectorName).toBe('Test Industry');
    });

    it('should throw AnalyticsError for non-existent organization', async () => {
      const nonExistentOrganizationId = 999999;
      await expect(analyticsService.getDashboardMetrics(nonExistentOrganizationId))
        .rejects
        .toThrow(AnalyticsError);
    });

    it('should handle missing data gracefully', async () => {
      // Create a new organization without any associated data
      const emptyOrganization = await prisma.organization.create({
        data: {
          name: `Empty Test Organization ${Date.now()}`,
          address: '456 Empty St',
          phone: '555-9999',
          industryId: testIndustryId
        }
      });

      const metrics = await analyticsService.getDashboardMetrics(emptyOrganization.id);

      // Verify default/null values are handled properly
      expect(metrics.technologyMetrics.implementationCount).toBe(0);
      expect(metrics.technologyMetrics.averageMaturity).toBeNull();
      expect(metrics.technologyMetrics.trendData).toHaveLength(0);

      expect(metrics.processMetrics.digitizationLevel).toBeNull();
      expect(metrics.processMetrics.automationLevel).toBeNull();
      expect(metrics.processMetrics.trendData).toHaveLength(0);

      expect(metrics.personnelMetrics.totalSkilled).toBe(0);
      expect(metrics.personnelMetrics.avgProficiency).toBeNull();
      expect(metrics.personnelMetrics.skillDistribution).toHaveLength(0);

      expect(metrics.strategyMetrics.hasI40Strategy).toBeNull();
      expect(metrics.strategyMetrics.implementationProgress).toBeNull();
      expect(metrics.strategyMetrics.strategyMaturity).toBeNull();
      expect(metrics.strategyMetrics.nextReviewDate).toBeNull();

      // Clean up
      await prisma.organization.delete({
        where: { id: emptyOrganization.id }
      });
    });
  });
});
