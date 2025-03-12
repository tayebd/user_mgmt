import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';
import { prisma } from '../src/config/db';
import { AnalyticsService, AnalyticsError } from '../src/services/analyticsService';

describe('Analytics Service', () => {
  let analyticsService: AnalyticsService;
  let testCompanyId: number;
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

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Analytics Company',
        address: '123 Analytics St',
        phone: '555-0000',
        industryId: testIndustryId
      }
    });
    testCompanyId = company.id;

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
          companyId: testCompanyId,
          processTypeId: processType1.id,
          digitizationLevel: 4,
          automationLevel: 3,
          implementationDate: new Date(),
          lastAssessmentDate: new Date()
        },
        {
          companyId: testCompanyId,
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
          companyId: testCompanyId,
          skillId: skill1.id,
          numberOfPersonnel: 10,
          proficiencyLevel: 4,
          assessmentDate: new Date()
        },
        {
          companyId: testCompanyId,
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
        companyId: testCompanyId,
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
          companyId: testCompanyId,
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
          companyId: testCompanyId,
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
          { companyId: testCompanyId },
          { sectorId: testIndustryId }
        ]
      }
    });
    await prisma.processDigitizationFact.deleteMany({
      where: { 
        OR: [
          { companyId: testCompanyId },
          { sectorId: testIndustryId }
        ]
      }
    });
    await prisma.personnelSkill.deleteMany({
      where: { companyId: testCompanyId }
    });
    await prisma.digitalProcess.deleteMany({
      where: { companyId: testCompanyId }
    });
    await prisma.strategyAssessment.deleteMany({
      where: { companyId: testCompanyId }
    });
    // Delete skills after personnel skills
    await prisma.skill.deleteMany({
      where: { name: { startsWith: 'Test Skill' } }
    });
    // Delete process types after digital processes
    await prisma.processType.deleteMany({
      where: { name: { startsWith: 'Test Process Type' } }
    });
    // Delete all companies in the test industry
    await prisma.company.deleteMany({
      where: { industryId: testIndustryId }
    });
    // Now we can safely delete the industry
    await prisma.industry.delete({
      where: { id: testIndustryId }
    });
    await prisma.$disconnect();
  });

  describe('getDashboardMetrics', () => {
    it('should return complete dashboard metrics for a valid company', async () => {
      const metrics = await analyticsService.getDashboardMetrics(testCompanyId);

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
      expect(metrics.sectorComparison.companyMaturity).toBe(0);
      expect(metrics.sectorComparison.sectorAvgMaturity).toBe(0);
      expect(metrics.sectorComparison.sectorName).toBe('Test Industry');
    });

    it('should throw AnalyticsError for non-existent company', async () => {
      const nonExistentCompanyId = 999999;
      await expect(analyticsService.getDashboardMetrics(nonExistentCompanyId))
        .rejects
        .toThrow(AnalyticsError);
    });

    it('should handle missing data gracefully', async () => {
      // Create a new company without any associated data
      const emptyCompany = await prisma.company.create({
        data: {
          name: `Empty Test Company ${Date.now()}`,
          address: '456 Empty St',
          phone: '555-9999',
          industryId: testIndustryId
        }
      });

      const metrics = await analyticsService.getDashboardMetrics(emptyCompany.id);

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
      await prisma.company.delete({
        where: { id: emptyCompany.id }
      });
    });
  });
});
