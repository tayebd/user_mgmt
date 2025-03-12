import { MetricCalculationService } from '@/services/metricCalculationService';
import { 
  mockQuestionMap,
  mockTechnologyResponse,
  mockProcessResponse,
  mockPersonnelResponse,
  mockStrategyResponse
} from './mockData';
import { EnhancedSurveyResponse } from '@/types/metrics';

describe('MetricCalculationService', () => {
  describe('calculateTechnologyMetrics', () => {
    it('should calculate technology metrics correctly', () => {
      const result = MetricCalculationService.calculateTechnologyMetrics(mockTechnologyResponse, mockQuestionMap);

      expect(result.metrics).toEqual(expect.objectContaining({
        implementationCount: 3,
        implementedTechnologies: ['erp', 'crm', 'scm']
      }));

      // Verify maturity scores are calculated correctly
      expect(result.metrics.averageMaturity).toBeGreaterThan(0);
      expect(result.metrics.maturityScore).toBeGreaterThan(0);
      expect(result.metrics.maturityScore).toBeLessThanOrEqual(100);

      // Verify implementation details
      expect(result.metrics.implementationDetails).toEqual(expect.objectContaining({
        systemTypes: ['erp', 'crm', 'scm'],
        integrationLevel: expect.any(Number)
      }));

      // Verify analytics capabilities
      expect(result.metrics.implementationDetails.analyticsCapabilities).toEqual(expect.objectContaining({
        level: expect.stringMatching(/^(basic|intermediate|advanced)$/),
        capabilities: expect.any(Array)
      }));

      // Verify automation status
      expect(result.metrics.implementationDetails.automationStatus).toEqual(expect.objectContaining({
        level: expect.stringMatching(/^(low|medium|high)$/),
        automatedProcesses: expect.any(Array)
      }));

      // Verify confidence score
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty technology responses', () => {
      const emptyResponse = {};
      const result = MetricCalculationService.calculateTechnologyMetrics(emptyResponse, mockQuestionMap);

      expect(result.metrics.implementationCount).toBe(0);
      expect(result.metrics.averageMaturity).toBe(0);
      expect(result.metrics.implementedTechnologies).toEqual([]);
      expect(result.metrics.maturityScore).toBe(0);
    });

    it('should handle invalid technology responses', () => {
      const invalidResponse = {
        itSystemTypes: 'invalid', // Should be an array
        systemCapabilities: 'invalid', // Should be an array
        dataAnalytics: null,
        automationLevel: undefined,
        dataStandardization: [] // Should be an object
      };

      const result = MetricCalculationService.calculateTechnologyMetrics(invalidResponse, mockQuestionMap);

      expect(result.metrics.implementationCount).toBe(0);
      expect(result.metrics.averageMaturity).toBe(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateProcessMetrics', () => {
    it('should calculate process metrics correctly', () => {
      const result = MetricCalculationService.calculateProcessMetrics(mockProcessResponse, mockQuestionMap);

      expect(result.metrics).toEqual(expect.objectContaining({
        digitizationLevel: expect.any(Number),
        automationLevel: expect.any(Number),
        processAreas: expect.any(Array)
      }));

      expect(result.metrics.digitizationLevel).toBe(0.8); // Value of 4 maps to 0.8
      expect(result.metrics.automationLevel).toBe(0.6); // Value of 3 maps to 0.6
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty process responses', () => {
      const result = MetricCalculationService.calculateProcessMetrics({}, mockQuestionMap);

      expect(result.metrics.digitizationLevel).toBe(0);
      expect(result.metrics.automationLevel).toBe(0);
      expect(result.metrics.processAreas).toEqual([]);
    });
  });

  describe('calculatePersonnelMetrics', () => {
    it('should calculate personnel metrics correctly', () => {
      const result = MetricCalculationService.calculatePersonnelMetrics(mockPersonnelResponse, mockQuestionMap);

      expect(result.metrics).toEqual(expect.objectContaining({
        totalSkilled: expect.any(Number),
        avgProficiency: expect.any(Number),
        skillDistribution: expect.any(Object)
      }));

      expect(result.metrics.avgProficiency).toBeGreaterThan(0);
      expect(result.metrics.avgProficiency).toBeLessThanOrEqual(5);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty personnel responses', () => {
      const result = MetricCalculationService.calculatePersonnelMetrics({}, mockQuestionMap);

      expect(result.metrics.totalSkilled).toBe(0);
      expect(result.metrics.avgProficiency).toBe(0);
      expect(result.metrics.skillDistribution).toEqual({});
    });
  });

  describe('calculateStrategyMetrics', () => {
    it('should calculate strategy metrics correctly', () => {
      const result = MetricCalculationService.calculateStrategyMetrics(mockStrategyResponse, mockQuestionMap);

      expect(result.metrics).toEqual(expect.objectContaining({
        strategyMaturity: expect.any(Number),
        implementationProgress: expect.any(Number),
        keyMilestones: expect.any(Array)
      }));

      expect(result.metrics.strategyMaturity).toBeGreaterThan(0);
      expect(result.metrics.strategyMaturity).toBeLessThanOrEqual(5);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty strategy responses', () => {
      const result = MetricCalculationService.calculateStrategyMetrics({}, mockQuestionMap);

      expect(result.metrics.strategyMaturity).toBe(0);
      expect(result.metrics.implementationProgress).toBe(0);
      expect(result.metrics.keyMilestones).toEqual([]);
    });

    it('should handle different milestone value types', () => {
      const mixedMilestones = {
        milestone1: true,
        milestone2: 1,
        milestone3: 'yes',
        milestone4: 'no',
        milestone5: false,
        milestone6: 0
      };

      const result = MetricCalculationService.calculateStrategyMetrics(mixedMilestones, mockQuestionMap);
      expect(result.metrics.keyMilestones).toContain('1');
      expect(result.metrics.keyMilestones).toContain('2');
      expect(result.metrics.keyMilestones).toContain('3');
      expect(result.metrics.keyMilestones).not.toContain('4');
      expect(result.metrics.keyMilestones).not.toContain('milestone5');
      expect(result.metrics.keyMilestones).not.toContain('milestone6');
    });
  });

  describe('processResponse', () => {
    it('should process a complete survey response correctly', () => {
      const completeResponse = {
        ...mockTechnologyResponse,
        ...mockProcessResponse,
        ...mockPersonnelResponse,
        ...mockStrategyResponse
      };

      const result = MetricCalculationService.processResponse(completeResponse, mockQuestionMap);

      expect(result).toEqual(expect.objectContaining({
        timestamp: expect.any(Date),
        metrics: expect.objectContaining({
          technologyMetrics: expect.any(Object),
          processMetrics: expect.any(Object),
          personnelMetrics: expect.any(Object),
          strategyMetrics: expect.any(Object)
        }),
        confidenceScores: expect.objectContaining({
          technology: expect.any(Number),
          process: expect.any(Number),
          personnel: expect.any(Number),
          strategy: expect.any(Number)
        })
      }));
    });

    it('should handle JSON string input', () => {
      const jsonResponse = JSON.stringify({
        ...mockTechnologyResponse,
        ...mockProcessResponse
      });

      const result = MetricCalculationService.processResponse(jsonResponse, mockQuestionMap);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.metrics.technologyMetrics).toBeDefined();
      expect(result.metrics.processMetrics).toBeDefined();
    });

    it('should handle missing sections gracefully', () => {
      const partialResponse = {
        ...mockTechnologyResponse
      };

      const result = MetricCalculationService.processResponse(partialResponse, mockQuestionMap);
      expect(result.metrics.processMetrics.digitizationLevel).toBe(0);
      expect(result.metrics.personnelMetrics.totalSkilled).toBe(0);
      expect(result.metrics.strategyMetrics.keyMilestones).toEqual([]);
    });
  });

  describe('aggregateHistoricalData', () => {
    it('should aggregate historical responses correctly', () => {
      const historicalResponses: EnhancedSurveyResponse[] = [
        {
          id: 1,
          surveyId: 1,
          userId: 1,
          responseJson: '{}',
          processedMetrics: {
            timestamp: new Date(),
            metrics: {
              technologyMetrics: {
                implementationCount: 3,
                averageMaturity: 0.7,
                implementedTechnologies: ['erp', 'crm'],
                maturityScore: 75,
                implementationDetails: {
                  systemTypes: ['erp', 'crm'],
                  integrationLevel: 0.8,
                  analyticsCapabilities: { level: 'advanced', capabilities: ['predictive'] },
                  automationStatus: { level: 'high', automatedProcesses: ['process1'] }
                }
              },
              processMetrics: {
                digitizationLevel: 0.8,
                automationLevel: 0.7,
                processAreas: ['area1']
              },
              personnelMetrics: {
                totalSkilled: 15,
                avgProficiency: 0.75,
                skillDistribution: { dev: 10, ops: 5 }
              },
              strategyMetrics: {
                strategyMaturity: 0.8,
                implementationProgress: 0.7,
                keyMilestones: ['m1', 'm2']
              }
            },
            confidenceScores: {
              technology: 0.9,
              process: 0.8,
              personnel: 0.85,
              strategy: 0.75
            }
          }
        }
      ];

      const result = MetricCalculationService.aggregateHistoricalData(historicalResponses);
      expect(result).toBeDefined();
      expect(result.technologyMetrics.maturityScore).toBe(75);
      expect(result.processMetrics.digitizationLevel).toBe(0.8);
    });

    it('should throw error for empty historical data', () => {
      expect(() => {
        MetricCalculationService.aggregateHistoricalData([]);
      }).toThrow('No processed metrics available');
    });

    it('should handle responses without processed metrics', () => {
      const invalidResponses: EnhancedSurveyResponse[] = [
        {
          id: 1,
          surveyId: 1,
          userId: 1,
          responseJson: '{}'
        }
      ];

      expect(() => {
        MetricCalculationService.aggregateHistoricalData(invalidResponses);
      }).toThrow('No processed metrics available');
    });
  });
});
