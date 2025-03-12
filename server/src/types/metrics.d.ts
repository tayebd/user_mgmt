import { Prisma } from '@prisma/client';

export type JsonValue = Prisma.JsonValue;
export type InputJsonValue = Prisma.InputJsonValue;

export interface TechnologyMetrics {
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
}

export interface ProcessMetrics {
  digitizationLevel: number;
  automationLevel: number;
  processAreas: string[];
}

export interface PersonnelMetrics {
  totalSkilled: number;
  avgProficiency: number;
  skillDistribution: Record<string, number>;
}

export interface StrategyMetrics {
  strategyMaturity: number;
  implementationProgress: number;
  keyMilestones: string[];
}

export interface DashboardMetrics {
  technologyMetrics: TechnologyMetrics;
  processMetrics: ProcessMetrics;
  personnelMetrics: PersonnelMetrics;
  strategyMetrics: StrategyMetrics;
}

export interface ProcessedMetrics {
  timestamp: string;
  metrics: DashboardMetrics;
  confidenceScores: {
    technology: number;
    process: number;
    personnel: number;
    strategy: number;
  };
}
