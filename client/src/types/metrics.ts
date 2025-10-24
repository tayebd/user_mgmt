// Metric Types
export type MetricCategory = 'technology' | 'process' | 'personnel' | 'strategy';
export type MetricType = 'maturity' | 'count' | 'level' | 'proficiency' | 'progress' | 'multiSelect' | 'matrix' | 'single';
export type ResponseType = 'scale' | 'boolean' | 'number' | 'multiSelect';

export interface MetricMapping {
  category: MetricCategory;
  metricType: MetricType;
  weight: number;
  valueMap?: Record<string, number>;
}

export interface MetricQuestion {
  id: string;
  text: string;
  metricMapping: MetricMapping;
  responseType: ResponseType;
  options?: {
    value: string | number;
    label: string;
    metricValue: number;
  }[];
}

export interface DashboardMetrics {
  technologyMetrics: {
    implementationCount: number;
    averageMaturity: number;
    implementedTechnologies: string[];
    maturityScore: number;
    implementationDetails: {
      systemTypes: string[];
      integrationLevel: number;
      analyticsCapabilities: {
        level: string;
        capabilities: string[];
      };
      automationStatus: {
        level: string;
        automatedProcesses: string[];
      };
    };
  };
  processMetrics: {
    digitizationLevel: number;
    automationLevel: number;
    processAreas: string[];
  };
  personnelMetrics: {
    totalSkilled: number;
    avgProficiency: number;
    skillDistribution: Record<string, number>;
  };
  strategyMetrics: {
    strategyMaturity: number;
    implementationProgress: number;
    keyMilestones: string[];
  };
}

export interface ProcessedMetrics {
  timestamp: Date;
  metrics: DashboardMetrics;
  confidenceScores: Record<string, number>;
}

export interface EnhancedSurveyResponse {
  id: number;
  surveyId: number;
  responseJson: string;
  userId: number;
  organizationId: number; // Changed to required field
  processedMetrics?: ProcessedMetrics;
}

export interface QuestionMetricMap {
  [questionId: string]: MetricMapping;
}
