import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Zod schema for validating API responses
const trendDataSchema = z.object({
  date: z.string().or(z.date()),
  count: z.number(),
  maturityLevel: z.number()
});

const skillDistributionSchema = z.object({
  category: z.string(),
  count: z.number()
});

// Enhanced schema for processed metrics
const processedMetricsSchema = z.object({
  timestamp: z.string().or(z.date()),
  metrics: z.object({
    technologyMetrics: z.object({
      implementationCount: z.number(),
      averageMaturity: z.number(),
      implementedTechnologies: z.array(z.string())
    }),
    processMetrics: z.object({
      digitizationLevel: z.number(),
      automationLevel: z.number(),
      processAreas: z.array(z.string())
    }),
    personnelMetrics: z.object({
      totalSkilled: z.number(),
      avgProficiency: z.number(),
      skillDistribution: z.record(z.string(), z.number())
    }),
    strategyMetrics: z.object({
      strategyMaturity: z.number(),
      implementationProgress: z.number(),
      keyMilestones: z.array(z.string())
    })
  }),
  confidenceScores: z.record(z.string(), z.number())
});

const enhancedSurveyResponseSchema = z.object({
  id: z.number(),
  surveyId: z.number(),
  responseJson: z.string(),
  userId: z.number(),
  processedMetrics: processedMetricsSchema.optional()
});

const dashboardMetricsSchema = z.object({
  technologyMetrics: z.object({
    implementationCount: z.number(),
    averageMaturity: z.number().nullable(),
    trendData: z.array(trendDataSchema)
  }),
  processMetrics: z.object({
    digitizationLevel: z.number(),
    automationLevel: z.number(),
    trendData: z.array(z.object({
      date: z.string().or(z.date()),
      digitizationLevel: z.number(),
      automationLevel: z.number()
    }))
  }),
  personnelMetrics: z.object({
    totalSkilled: z.number(),
    avgProficiency: z.number(),
    skillDistribution: z.array(skillDistributionSchema)
  }),
  strategyMetrics: z.object({
    hasI40Strategy: z.boolean().nullable(),
    implementationProgress: z.number().nullable(),
    strategyMaturity: z.number().nullable(),
    nextReviewDate: z.string().or(z.date()).nullable()
  }),
  sectorComparison: z.object({
    organizationMaturity: z.number().nullable(),
    sectorAvgMaturity: z.number().nullable(),
    sectorName: z.string()
  })
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

export type ProcessedMetrics = z.infer<typeof processedMetricsSchema>;
export type EnhancedSurveyResponse = z.infer<typeof enhancedSurveyResponseSchema>;

export class AnalyticsService {
  private static async handleApiError(response: Response): Promise<never> {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  private static validateMetrics(data: unknown): DashboardMetrics {
    try {
      return dashboardMetricsSchema.parse(data);
    } catch (error) {
      console.error('Invalid metrics data:', error);
      throw new Error('Received invalid metrics data from server');
    }
  }

  static async getDashboardMetrics(organizationId: number): Promise<DashboardMetrics> {
    const url = new URL(`${API_BASE_URL}/dashboard/metrics`);
    url.searchParams.append('organizationId', organizationId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    const data = await response.json();
    return this.validateMetrics(data.data);
  }

  static async exportDashboardMetrics(organizationId: number): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/dashboard/metrics/export`);
    url.searchParams.append('organizationId', organizationId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    return await response.blob();
  }
}
