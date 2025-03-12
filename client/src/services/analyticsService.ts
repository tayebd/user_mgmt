import axios from 'axios';
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
    companyMaturity: z.number().nullable(),
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
  private static handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError?.error || error.message);
    }
    throw error;
  }

  private static validateMetrics(data: unknown): DashboardMetrics {
    try {
      return dashboardMetricsSchema.parse(data);
    } catch (error) {
      console.error('Invalid metrics data:', error);
      throw new Error('Received invalid metrics data from server');
    }
  }

  static async getDashboardMetrics(companyId: number): Promise<DashboardMetrics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
        params: { companyId }
      });
      return this.validateMetrics(response.data.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  static async exportDashboardMetrics(companyId: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/metrics/export`, {
        params: { companyId },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
}
