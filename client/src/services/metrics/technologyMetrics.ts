import { QuestionMetricMap } from '@/types/metrics';
import { TechnologyResponse, TechnologyMetricResult, AnalyticsCapabilities, AutomationStatus } from './types';
import { MetricCalculationUtils } from './calculationUtils';

export class TechnologyMetricsCalculator {
  private static extractAnalyticsCapabilities(analyticsData: TechnologyResponse['dataAnalytics']): AnalyticsCapabilities {
    if (!analyticsData || !Array.isArray(analyticsData)) {
      return { level: 'basic', capabilities: [] };
    }

    const capabilities = analyticsData
      .filter(item => item.value === 'advanced' || item.value === 'optimized')
      .map(item => item.name)
      .filter((name): name is string => !!name);

    const level = capabilities.length >= 4 ? 'advanced' :
      capabilities.length >= 2 ? 'intermediate' : 'basic';

    return { level, capabilities };
  }

  private static extractAutomationStatus(automationData: TechnologyResponse['automationLevel']): AutomationStatus {
    if (!automationData || !Array.isArray(automationData)) {
      return { level: 'low', automatedProcesses: [] };
    }

    const automatedProcesses = automationData
      .filter(item => item.value === 'fully' || item.value === 'intelligent')
      .map(item => item.name)
      .filter((name): name is string => !!name);

    const level = automatedProcesses.length >= 4 ? 'high' :
      automatedProcesses.length >= 2 ? 'medium' : 'low';

    return { level, automatedProcesses };
  }

  private static calculateOverallMaturityScore(
    responses: TechnologyResponse,
    questionMap: QuestionMetricMap
  ): number {
    const weights = {
      systemCapabilities: 0.25,
      systemIntegration: 0.2,
      dataAnalytics: 0.2,
      automationLevel: 0.15,
      dataStandardization: 0.1,
      integrationMethods: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      const data = responses[category as keyof TechnologyResponse];
      const valueMap = questionMap[category]?.valueMap;

      if (data && valueMap) {
        const score = Array.isArray(data)
          ? MetricCalculationUtils.calculateMatrixScore(data, valueMap)
          : MetricCalculationUtils.calculateSingleScore(data as { value: string }, valueMap);

        if (score !== null) {
          totalScore += score * weight;
          totalWeight += weight;
        }
      }
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  }

  static calculate(responses: TechnologyResponse, questionMap: QuestionMetricMap): TechnologyMetricResult {
    const techResponses = Object.entries(responses)
      .filter(([id]) => questionMap[id]?.category === 'technology');

    // Calculate system types and implementation count
    const systemTypes = Array.isArray(responses.itSystemTypes) ? responses.itSystemTypes : [];
    const implementationCount = systemTypes.length;

    // Calculate maturity scores from various aspects
    const maturityScores = [
      MetricCalculationUtils.calculateMatrixScore(responses.systemCapabilities, questionMap.systemCapabilities?.valueMap),
      MetricCalculationUtils.calculateMatrixScore(responses.systemIntegration, questionMap.systemIntegration?.valueMap),
      MetricCalculationUtils.calculateMatrixScore(responses.dataAnalytics, questionMap.dataAnalytics?.valueMap),
      MetricCalculationUtils.calculateMatrixScore(responses.automationLevel, questionMap.automationLevel?.valueMap),
      MetricCalculationUtils.calculateSingleScore(responses.dataStandardization, questionMap.dataStandardization?.valueMap)
    ].filter((score): score is number => score !== null);

    const averageMaturity = maturityScores.length > 0
      ? Number((maturityScores.reduce((a, b) => a + b, 0) / maturityScores.length).toFixed(1))
      : 0;

    // Calculate implementation details
    const implementationDetails = {
      systemTypes,
      integrationLevel: MetricCalculationUtils.calculateMatrixScore(
        responses.systemIntegration,
        questionMap.systemIntegration?.valueMap
      ) || 0,
      analyticsCapabilities: this.extractAnalyticsCapabilities(responses.dataAnalytics),
      automationStatus: this.extractAutomationStatus(responses.automationLevel)
    };

    // Calculate overall maturity score (0-100)
    const maturityScore = this.calculateOverallMaturityScore(responses, questionMap);

    return {
      metrics: {
        implementationCount,
        averageMaturity,
        implementedTechnologies: systemTypes,
        maturityScore,
        implementationDetails
      },
      confidence: MetricCalculationUtils.calculateConfidenceScore(
        techResponses.map(([, value]) => value),
        'technology'
      )
    };
  }
}
