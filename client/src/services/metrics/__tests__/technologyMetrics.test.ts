import { MetricCategory, MetricType, QuestionMetricMap } from '@/types/metrics';
import { TechnologyMetricsCalculator } from '../technologyMetrics';
import { mockQuestionMap, mockTechnologyResponse } from './mockData';
import { TechnologyResponse } from '../types';

describe('TechnologyMetricsCalculator', () => {
  describe('calculate', () => {
    it('should calculate complete technology metrics', () => {
      const result = TechnologyMetricsCalculator.calculate(mockTechnologyResponse, mockQuestionMap);

      // Basic structure checks
      expect(result).toEqual(expect.objectContaining({
        metrics: expect.any(Object),
        confidence: expect.any(Number)
      }));

      // Metrics structure checks
      expect(result.metrics).toEqual(expect.objectContaining({
        implementationCount: expect.any(Number),
        averageMaturity: expect.any(Number),
        implementedTechnologies: expect.any(Array),
        maturityScore: expect.any(Number),
        implementationDetails: expect.any(Object)
      }));

      // Implementation details checks
      expect(result.metrics.implementationDetails).toEqual(expect.objectContaining({
        systemTypes: expect.any(Array),
        integrationLevel: expect.any(Number),
        analyticsCapabilities: expect.objectContaining({
          level: expect.any(String),
          capabilities: expect.any(Array)
        }),
        automationStatus: expect.objectContaining({
          level: expect.any(String),
          automatedProcesses: expect.any(Array)
        })
      }));

      // Value range checks
      expect(result.metrics.averageMaturity).toBeGreaterThanOrEqual(0);
      expect(result.metrics.averageMaturity).toBeLessThanOrEqual(1);
      expect(result.metrics.maturityScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics.maturityScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle missing system capabilities', () => {
      const partialResponse: TechnologyResponse = {
        itSystemTypes: ['erp'],
        systemIntegration: mockTechnologyResponse.systemIntegration
      };

      const result = TechnologyMetricsCalculator.calculate(partialResponse, mockQuestionMap);
      expect(result.metrics.implementationCount).toBe(1);
      expect(result.metrics.averageMaturity).toBeGreaterThanOrEqual(0);
      expect(result.metrics.implementationDetails.analyticsCapabilities.level).toBe('basic');
      expect(result.metrics.implementationDetails.analyticsCapabilities.capabilities).toEqual([]);
    });

    it('should handle missing system integration', () => {
      const partialResponse: TechnologyResponse = {
        itSystemTypes: ['erp'],
        systemCapabilities: mockTechnologyResponse.systemCapabilities
      };

      const result = TechnologyMetricsCalculator.calculate(partialResponse, mockQuestionMap);
      expect(result.metrics.implementationDetails.integrationLevel).toBe(0);
    });

    it('should handle empty response', () => {
      const emptyResponse: TechnologyResponse = {};
      const result = TechnologyMetricsCalculator.calculate(emptyResponse, mockQuestionMap);

      expect(result.metrics.implementationCount).toBe(0);
      expect(result.metrics.averageMaturity).toBe(0);
      expect(result.metrics.implementedTechnologies).toEqual([]);
      expect(result.metrics.maturityScore).toBe(0);
      expect(result.metrics.implementationDetails.systemTypes).toEqual([]);
      expect(result.metrics.implementationDetails.integrationLevel).toBe(0);
      expect(result.metrics.implementationDetails.analyticsCapabilities.level).toBe('basic');
      expect(result.metrics.implementationDetails.automationStatus.level).toBe('low');
    });

    it('should handle invalid data types', () => {
      const invalidResponse = {
        itSystemTypes: 'not-an-array',
        systemCapabilities: null,
        systemIntegration: undefined,
        dataAnalytics: 'invalid',
        automationLevel: 123,
        dataStandardization: { value: 'invalid' }
      } as unknown as TechnologyResponse;

      const result = TechnologyMetricsCalculator.calculate(invalidResponse, mockQuestionMap);
      expect(result.metrics.implementationCount).toBe(0);
      expect(result.metrics.averageMaturity).toBe(0);
      expect(result.confidence).toBeLessThan(1);
    });

    it('should calculate analytics capabilities correctly', () => {
      const response: TechnologyResponse = {
        dataAnalytics: [
          { value: 'advanced', name: 'predictive' },
          { value: 'optimized', name: 'diagnostic' },
          { value: 'advanced', name: 'descriptive' },
          { value: 'optimized', name: 'realtime' }
        ]
      };

      const result = TechnologyMetricsCalculator.calculate(response, mockQuestionMap);
      expect(result.metrics.implementationDetails.analyticsCapabilities.level).toBe('advanced');
      expect(result.metrics.implementationDetails.analyticsCapabilities.capabilities).toContain('predictive');
      expect(result.metrics.implementationDetails.analyticsCapabilities.capabilities).toContain('diagnostic');
    });

    it('should calculate automation status correctly', () => {
      const response: TechnologyResponse = {
        automationLevel: [
          { value: 'fully', name: 'process1' },
          { value: 'intelligent', name: 'process2' },
          { value: 'fully', name: 'process3' },
          { value: 'intelligent', name: 'process4' }
        ]
      };

      const result = TechnologyMetricsCalculator.calculate(response, mockQuestionMap);
      expect(result.metrics.implementationDetails.automationStatus.level).toBe('high');
      expect(result.metrics.implementationDetails.automationStatus.automatedProcesses).toHaveLength(4);
    });

    it('should handle malformed question map', () => {
      const malformedMap = {
        systemCapabilities: {
          category: 'technology' as MetricCategory,
          metricType: 'matrix' as MetricType,
          weight: 0.25
          // Missing valueMap
        }
      } as QuestionMetricMap;

      const result = TechnologyMetricsCalculator.calculate(mockTechnologyResponse, malformedMap);
      expect(result.metrics.maturityScore).toBe(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should calculate maturity scores with partial data', () => {
      const partialResponse: TechnologyResponse = {
        systemCapabilities: mockTechnologyResponse.systemCapabilities,
        dataStandardization: mockTechnologyResponse.dataStandardization
      };

      const result = TechnologyMetricsCalculator.calculate(partialResponse, mockQuestionMap);
      expect(result.metrics.maturityScore).toBeGreaterThan(0);
      expect(result.metrics.maturityScore).toBeLessThan(100);
    });

    it('should maintain consistent weights in maturity calculation', () => {
      const response1: TechnologyResponse = {
        systemCapabilities: [{ value: 'basic', name: 'test' }],
        dataAnalytics: [{ value: 'basic', name: 'test' }],
        dataStandardization: { value: 'minimal' }
      };

      const response2: TechnologyResponse = {
        systemCapabilities: [{ value: 'cutting_edge', name: 'test' }],
        dataAnalytics: [{ value: 'optimized', name: 'test' }],
        dataStandardization: { value: 'full' },
        systemIntegration: [{ value: 'full', name: 'test' }],
        automationLevel: [{ value: 'intelligent', name: 'test' }]
      };

      const result1 = TechnologyMetricsCalculator.calculate(response1, mockQuestionMap);
      const result2 = TechnologyMetricsCalculator.calculate(response2, mockQuestionMap);

      expect(result2.metrics.maturityScore).toBeGreaterThan(0);
      expect(result2.metrics.maturityScore).toBeGreaterThan(75);
      expect(result2.metrics.maturityScore).toBeGreaterThan(result1.metrics.maturityScore);
    });
  });
});
