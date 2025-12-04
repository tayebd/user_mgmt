import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsService, AnalyticsError } from '../services/analyticsService';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

type DashboardRequest = Request<{}, {}, {}, { organizationId: string }>;

interface DashboardResponse {
  success: boolean;
  data: {
    technologyMetrics: {
      implementationCount: number;
      averageMaturity: number;
      trendData: Array<{
        date: Date;
        count: number;
        maturityLevel: number;
      }>;
    };
    processMetrics: {
      digitizationLevel: number;
      automationLevel: number;
      trendData: Array<{
        date: Date;
        digitizationLevel: number;
        automationLevel: number;
      }>;
    };
    personnelMetrics: {
      totalSkilled: number;
      avgProficiency: number;
      skillDistribution: Array<{
        category: string;
        count: number;
      }>;
    };
    strategyMetrics: {
      hasStrategy: boolean;
      implementationProgress: number;
      maturityLevel: number;
      nextReviewDate: Date | null;
    };
    sectorComparison: {
      organizationMaturity: number;
      sectorAvgMaturity: number;
      sectorName: string;
    };
  };
}

const router = Router();
const analyticsService = new AnalyticsService();

// Validation schema for query parameters
const dashboardQuerySchema = z.object({
  organizationId: z.string().transform((val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid organization ID');
    }
    return parsed;
  })
});

// Error handler wrapper following our error handling requirements
const asyncHandler = (fn: (req: DashboardRequest, res: Response, next: NextFunction) => Promise<void>) => async (req: DashboardRequest, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error instanceof AnalyticsError) {
      console.error('Analytics error:', error.message, error.details);
      res.status(400).json({
        error: error.message,
        details: error.details
      });
    } else {
      console.error('Dashboard route error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// GET /api/dashboard/metrics
router.get('/metrics',
  validateRequest({ query: dashboardQuerySchema }),
  asyncHandler(async (req: DashboardRequest, res: Response) => {
    const organizationId = parseInt(req.query.organizationId, 10);
    if (isNaN(organizationId)) {
      res.status(400).json({
        error: 'Invalid organization ID',
        details: 'Organization ID must be a valid number'
      });
      return;
    }
    const metrics = await analyticsService.getDashboardMetrics(organizationId);
    res.json({
      success: true,
      data: metrics
    });
  })
);

// GET /api/dashboard/metrics/export
router.get('/metrics/export',
  validateRequest({ query: dashboardQuerySchema }),
  asyncHandler(async (req: DashboardRequest, res: Response) => {
    const organizationId = parseInt(req.query.organizationId, 10);
    if (isNaN(organizationId)) {
      res.status(400).json({
        error: 'Invalid organization ID',
        details: 'Organization ID must be a valid number'
      });
      return;
    }
    const metrics = await analyticsService.getDashboardMetrics(organizationId);
    
    // Format data for CSV export
    const csvData = {
      technology: {
        implementationCount: metrics.technologyMetrics.implementationCount,
        averageMaturity: metrics.technologyMetrics.averageMaturity,
        trendData: metrics.technologyMetrics.trendData
      },
      process: {
        digitizationLevel: metrics.processMetrics.digitizationLevel,
        automationLevel: metrics.processMetrics.automationLevel,
        trendData: metrics.processMetrics.trendData
      },
      personnel: {
        totalSkilled: metrics.personnelMetrics.totalSkilled,
        avgProficiency: metrics.personnelMetrics.avgProficiency,
        distribution: metrics.personnelMetrics.skillDistribution
      },
      strategy: {
        hasStrategy: metrics.strategyMetrics.hasI40Strategy,
        implementationProgress: metrics.strategyMetrics.implementationProgress,
        maturityLevel: metrics.strategyMetrics.strategyMaturity
      },
      sector: {
        organizationMaturity: metrics.sectorComparison.organizationMaturity,
        sectorAvgMaturity: metrics.sectorComparison.sectorAvgMaturity,
        sectorName: metrics.sectorComparison.sectorName
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-metrics.json');
    res.json(csvData);
  })
);

export default router;
