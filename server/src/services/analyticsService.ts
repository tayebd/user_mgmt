import { PrismaClient } from '@prisma/client';
import { addMonths, subMonths, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

// Custom error class for analytics-specific errors
export class AnalyticsError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

interface DashboardMetrics {
  technologyMetrics: {
    implementationCount: number;
    averageMaturity: number | null;
    trendData: {
      date: Date;
      count: number;
      maturityLevel: number;
    }[];
  };
  processMetrics: {
    digitizationLevel: number | null;
    automationLevel: number | null;
    trendData: {
      date: Date;
      digitizationLevel: number;
      automationLevel: number;
    }[];
  };
  personnelMetrics: {
    totalSkilled: number | null;
    avgProficiency: number | null;
    skillDistribution: {
      category: string;
      count: number;
    }[];
  };
  strategyMetrics: {
    hasI40Strategy: boolean | null;
    implementationProgress: number | null;
    strategyMaturity: number | null;
    nextReviewDate: Date | null;
  };
  sectorComparison: {
    organizationMaturity: number | null;
    sectorAvgMaturity: number | null;
    sectorName: string;
  };
}

export class AnalyticsService {
  private validateOrganizationExists = async (organizationId: number): Promise<void> => {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true }
    });

    if (!organization) {
      throw new AnalyticsError('Organization not found', { organizationId });
    }
  };

  private sanitizeNumber = (value: number | null | undefined, defaultValue: number | null = 0): number | null => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return Number(value);
  };

  async getDashboardMetrics(organizationId: number): Promise<DashboardMetrics> {
    try {
      await this.validateOrganizationExists(organizationId);
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);

      // Get organization's industry information
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { industry: true }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const [
        techImplementation,
        techTrend,
        processDigitization,
        processTrend,
        personnelSkills,
        skillDistribution,
        strategyStatus,
        sectorMaturity
      ] = await Promise.all([
        // Current technology implementation metrics
        prisma.technologyImplementation.aggregate({
          where: { organizationId },
          _count: true,
          _avg: {
            maturityLevel: true
          }
        }),

        // Technology implementation trend
        prisma.technologyImplementationFact.findMany({
          where: {
            organizationId,
            date: {
              gte: sixMonthsAgo
            }
          },
          orderBy: { date: 'asc' },
          select: {
            date: true,
            technologyCount: true,
            avgMaturityLevel: true
          }
        }),

        // Current process digitization metrics
        prisma.digitalProcess.aggregate({
          where: { organizationId },
          _avg: {
            digitizationLevel: true,
            automationLevel: true
          }
        }),

        // Process digitization trend
        prisma.processDigitizationFact.findMany({
          where: {
            organizationId,
            date: {
              gte: sixMonthsAgo
            }
          },
          orderBy: { date: 'asc' },
          select: {
            date: true,
            avgDigitizationLevel: true,
            avgAutomationLevel: true
          }
        }),

        // Personnel skills metrics
        prisma.personnelSkill.aggregate({
          where: { organizationId },
          _sum: {
            numberOfPersonnel: true
          },
          _avg: {
            proficiencyLevel: true
          }
        }),

        // Skill distribution
        prisma.personnelSkill.groupBy({
          where: { organizationId },
          by: ['skillId'],
          _sum: {
            numberOfPersonnel: true
          },
          orderBy: {
            _sum: {
              numberOfPersonnel: 'desc'
            }
          },
          take: 5
        }),

        // Latest strategy assessment
        prisma.strategyAssessment.findFirst({
          where: { organizationId },
          orderBy: { assessmentDate: 'desc' }
        }),

        // Sector comparison
        prisma.technologyImplementationFact.aggregate({
          where: {
            sectorId: organization.industryId,
            date: {
              gte: startOfMonth(subMonths(today, 1))
            }
          },
          _avg: {
            avgMaturityLevel: true
          }
        })
      ]);

      // Get skill categories for distribution
      const skillIds = skillDistribution.map(s => s.skillId);
      const skills = await prisma.skill.findMany({
        where: {
          id: {
            in: skillIds
          }
        }
      });

      const skillMap = new Map(skills.map(s => [s.id, s.category]));

      return {
        technologyMetrics: {
          implementationCount: techImplementation._count,
          averageMaturity: this.sanitizeNumber(techImplementation._avg.maturityLevel, null),
          trendData: techTrend.map(t => ({
            date: t.date,
            count: t.technologyCount,
            maturityLevel: Number(t.avgMaturityLevel)
          }))
        },
        processMetrics: {
          digitizationLevel: processDigitization._avg.digitizationLevel,
          automationLevel: processDigitization._avg.automationLevel,
          trendData: processTrend.map(p => ({
            date: p.date,
            digitizationLevel: Number(p.avgDigitizationLevel),
            automationLevel: Number(p.avgAutomationLevel)
          }))
        },
        personnelMetrics: {
          totalSkilled: this.sanitizeNumber(personnelSkills._sum.numberOfPersonnel, 0),
          avgProficiency: this.sanitizeNumber(personnelSkills._avg.proficiencyLevel, null),
          skillDistribution: skillDistribution.map(s => ({
            category: skillMap.get(s.skillId) || 'Unknown',
            count: s._sum.numberOfPersonnel || 0
          }))
        },
        strategyMetrics: {
          hasI40Strategy: strategyStatus?.hasI40Strategy ?? null,
          implementationProgress: strategyStatus?.implementationProgress ?? null,
          strategyMaturity: strategyStatus?.strategyMaturity ?? null,
          nextReviewDate: strategyStatus?.nextReviewDate ?? null
        },
        sectorComparison: {
          organizationMaturity: this.sanitizeNumber(Number(techImplementation._avg.maturityLevel), 0),
          sectorAvgMaturity: this.sanitizeNumber(Number(sectorMaturity._avg.avgMaturityLevel), 0),
          sectorName: organization.industry.name
        }
      };
    } catch (error) {
      if (error instanceof AnalyticsError) {
        throw error;
      }
      throw new AnalyticsError('Failed to fetch dashboard metrics', { error });
    }
  }
}
