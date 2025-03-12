import { DashboardMetrics, QuestionMetricMap } from '@/types/metrics';

export interface SystemCapability {
  value: string;
  name?: string;
}

export interface TechnologyResponse {
  itSystemTypes?: string[];
  systemCapabilities?: SystemCapability[];
  systemIntegration?: SystemCapability[];
  dataAnalytics?: SystemCapability[];
  automationLevel?: SystemCapability[];
  dataStandardization?: { value: string };
  [key: string]: unknown;
}

export interface MetricResult<T> {
  metrics: T;
  confidence: number;
}

export interface AnalyticsCapabilities {
  level: string;
  capabilities: string[];
}

export interface AutomationStatus {
  level: string;
  automatedProcesses: string[];
}

export type TechnologyMetricResult = MetricResult<DashboardMetrics['technologyMetrics']>;
