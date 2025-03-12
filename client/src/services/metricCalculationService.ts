import { 
  DashboardMetrics, 
  MetricCategory, 
  QuestionMetricMap, 
  ProcessedMetrics,
  EnhancedSurveyResponse 
} from '@/types/metrics';
import { TechnologyResponse } from './metrics/types';
import { MetricCalculationUtils } from './metrics/calculationUtils';
import { TechnologyMetricsCalculator } from './metrics/technologyMetrics';

export class MetricCalculationService {
  static calculateTechnologyMetrics(responses: Record<string, unknown>, questionMap: QuestionMetricMap) {
    return TechnologyMetricsCalculator.calculate(responses as TechnologyResponse, questionMap);
  }

  static calculateProcessMetrics(responses: Record<string, unknown>, questionMap: QuestionMetricMap): {
    metrics: DashboardMetrics['processMetrics'];
    confidence: number;
  } {
    const digitizationValue = responses['processDigitization'];
    const automationValue = responses['processAutomation'];
    const processAreas = Array.isArray(responses['processAreas']) ? responses['processAreas'] : [];

    let digitizationLevel = 0;
    let automationLevel = 0;

    if (typeof digitizationValue === 'number' && digitizationValue >= 1 && digitizationValue <= 5) {
      const valueMap = questionMap['processDigitization']?.valueMap;
      if (valueMap) {
        digitizationLevel = valueMap[digitizationValue.toString()] || 0;
      }
    }

    if (typeof automationValue === 'number' && automationValue >= 1 && automationValue <= 5) {
      const valueMap = questionMap['processAutomation']?.valueMap;
      if (valueMap) {
        automationLevel = valueMap[automationValue.toString()] || 0;
      }
    }

    // Calculate confidence based on the completeness and validity of responses
    const totalQuestions = 2; // digitization and automation
    const answeredQuestions = [
      typeof digitizationValue === 'number' && digitizationValue >= 1 && digitizationValue <= 5,
      typeof automationValue === 'number' && automationValue >= 1 && automationValue <= 5
    ].filter(Boolean).length;

    const confidence = answeredQuestions / totalQuestions;

    return {
      metrics: {
        digitizationLevel,
        automationLevel,
        processAreas
      },
      confidence
    };
  }

  static calculatePersonnelMetrics(responses: Record<string, unknown>, questionMap: QuestionMetricMap): {
    metrics: DashboardMetrics['personnelMetrics'];
    confidence: number;
  } {
    const personnelResponses = Object.entries(responses)
      .filter(([id]) => questionMap[id]?.category === 'personnel');

    const skillCounts = personnelResponses
      .filter(([id]) => questionMap[id]?.metricType === 'count')
      .reduce((acc, [id, value]) => {
        acc[id] = typeof value === 'number' ? value : 0;
        return acc;
      }, {} as Record<string, number>);

    const proficiencyScores = personnelResponses
      .filter(([id]) => questionMap[id]?.metricType === 'proficiency')
      .map(([, value]) => typeof value === 'number' ? value : 0);

    return {
      metrics: {
        totalSkilled: Object.values(skillCounts).reduce((a, b) => a + b, 0),
        avgProficiency: proficiencyScores.length > 0
          ? Number((proficiencyScores.reduce((a, b) => a + b, 0) / proficiencyScores.length).toFixed(1))
          : 0,
        skillDistribution: skillCounts
      },
      confidence: MetricCalculationUtils.calculateConfidenceScore(
        personnelResponses.map(([, value]) => value),
        'personnel'
      )
    };
  }

  static calculateStrategyMetrics(responses: Record<string, unknown>, questionMap: QuestionMetricMap): {
    metrics: DashboardMetrics['strategyMetrics'];
    confidence: number;
  } {
    const strategyResponses = Object.entries(responses)
      .filter(([id]) => questionMap[id]?.category === 'strategy');

    const maturityScores = strategyResponses
      .filter(([id]) => questionMap[id]?.metricType === 'maturity')
      .map(([id, value]) => {
        try {
          if (typeof value === 'number' && value >= 1 && value <= 5) {
            const valueMap = questionMap[id]?.valueMap;
            if (valueMap && valueMap[value.toString()]) {
              return valueMap[value.toString()];
            }
          }
        } catch (error) {
          console.error('Error processing maturity score:', error);
        }
        return 0;
      });

    const progressScores = strategyResponses
      .filter(([id]) => questionMap[id]?.metricType === 'progress')
      .map(([, value]) => typeof value === 'number' ? value : 0);

    const milestones = Object.entries(responses)
      .filter(([id, value]) => {
        try {
          if (!id.toLowerCase().includes('milestone')) return false;
          if (typeof value === 'boolean') return value === true;
          if (typeof value === 'number') return value === 1;
          if (typeof value === 'string') return value.toLowerCase() === 'yes';
          return false;
        } catch (error) {
          console.error('Error processing milestone:', error);
          return false;
        }
      })
      .map(([id]) => {
        const match = id.match(/milestone[_-]?(\d+)|milestone(\d+)/i);
        return match ? (match[1] || match[2]) : '';
      })
      .filter(id => id !== '');

    return {
      metrics: {
        strategyMaturity: maturityScores.length > 0
          ? Number((maturityScores.reduce((a, b) => a + b, 0) / maturityScores.length).toFixed(1))
          : 0,
        implementationProgress: progressScores.length > 0
          ? Number((progressScores.reduce((a, b) => a + b, 0) / progressScores.length).toFixed(1))
          : 0,
        keyMilestones: milestones
      },
      confidence: MetricCalculationUtils.calculateConfidenceScore(
        strategyResponses.map(([, value]) => value),
        'strategy'
      )
    };
  }

  static processResponse(responseData: string | Record<string, unknown>, questionMap: QuestionMetricMap): ProcessedMetrics {
    let responses: Record<string, unknown>;
    try {
      // Parse response JSON if it's a string
      responses = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      console.error('Error processing survey response:', error);
      responses = {};
    }
    
    const techMetrics = this.calculateTechnologyMetrics(responses, questionMap);
    const processMetrics = this.calculateProcessMetrics(responses, questionMap);
    const personnelMetrics = this.calculatePersonnelMetrics(responses, questionMap);
    const strategyMetrics = this.calculateStrategyMetrics(responses, questionMap);

    return {
      timestamp: new Date(),
      metrics: {
        technologyMetrics: techMetrics.metrics,
        processMetrics: processMetrics.metrics,
        personnelMetrics: personnelMetrics.metrics,
        strategyMetrics: strategyMetrics.metrics
      },
      confidenceScores: {
        technology: techMetrics.confidence,
        process: processMetrics.confidence,
        personnel: personnelMetrics.confidence,
        strategy: strategyMetrics.confidence
      }
    };
  }

  static aggregateHistoricalData(responses: EnhancedSurveyResponse[]): DashboardMetrics {
    // Sort responses by timestamp
    const sortedResponses = responses
      .filter(r => r.processedMetrics)
      .sort((a, b) => 
        new Date(b.processedMetrics!.timestamp).getTime() - 
        new Date(a.processedMetrics!.timestamp).getTime()
      );

    if (sortedResponses.length === 0) {
      throw new Error('No processed metrics available');
    }

    // Use the most recent metrics as current values
    const currentMetrics = sortedResponses[0].processedMetrics!.metrics;

    // Calculate trends and update values
    return {
      ...currentMetrics,
      // Add trend calculations here if needed
    };
  }
}
