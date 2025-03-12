import { mockQuestionMap, mockTechnologyResponse, mockProcessResponse, mockPersonnelResponse, mockStrategyResponse } from './mockData';
import { MetricCategory, MetricType } from '@/types/metrics';

describe('Mock Data', () => {
  describe('mockQuestionMap', () => {
    it('should have valid metric categories and types', () => {
      Object.values(mockQuestionMap).forEach(mapping => {
        expect(['technology', 'process', 'personnel', 'strategy']).toContain(mapping.category);
        expect(['maturity', 'count', 'level', 'proficiency', 'progress', 'multiSelect', 'matrix', 'single'])
          .toContain(mapping.metricType);
      });
    });

    it('should have valid weights', () => {
      Object.values(mockQuestionMap).forEach(mapping => {
        expect(mapping.weight).toBeGreaterThan(0);
        expect(mapping.weight).toBeLessThanOrEqual(1);
      });
    });

    it('should have valid value maps', () => {
      Object.values(mockQuestionMap).forEach(mapping => {
        if (mapping.valueMap) {
          Object.values(mapping.valueMap).forEach(value => {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
          });
        }
      });
    });
  });

  describe('mockTechnologyResponse', () => {
    it('should have valid system types', () => {
      expect(Array.isArray(mockTechnologyResponse.itSystemTypes)).toBe(true);
      mockTechnologyResponse.itSystemTypes?.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });

    it('should have valid capabilities', () => {
      mockTechnologyResponse.systemCapabilities?.forEach(cap => {
        expect(cap).toHaveProperty('value');
        expect(cap).toHaveProperty('name');
        expect(typeof cap.value).toBe('string');
        expect(typeof cap.name).toBe('string');
      });
    });
  });

  describe('mockProcessResponse', () => {
    it('should have valid process metrics', () => {
      expect(mockProcessResponse.processDigitization).toBeGreaterThan(0);
      expect(mockProcessResponse.processDigitization).toBeLessThanOrEqual(5);
      expect(mockProcessResponse.processAutomation).toBeGreaterThan(0);
      expect(mockProcessResponse.processAutomation).toBeLessThanOrEqual(5);
      expect(Array.isArray(mockProcessResponse.processAreas)).toBe(true);
    });
  });

  describe('mockPersonnelResponse', () => {
    it('should have valid skill levels', () => {
      expect(mockPersonnelResponse.skillLevel_development).toBeGreaterThan(0);
      expect(mockPersonnelResponse.skillLevel_development).toBeLessThanOrEqual(5);
      expect(mockPersonnelResponse.skillLevel_operations).toBeGreaterThan(0);
      expect(mockPersonnelResponse.skillLevel_operations).toBeLessThanOrEqual(5);
    });

    it('should have valid skill counts', () => {
      expect(mockPersonnelResponse.skillCount_development).toBeGreaterThan(0);
      expect(mockPersonnelResponse.skillCount_operations).toBeGreaterThan(0);
    });
  });

  describe('mockStrategyResponse', () => {
    it('should have valid strategy metrics', () => {
      expect(mockStrategyResponse.strategyMaturity).toBeGreaterThan(0);
      expect(mockStrategyResponse.strategyMaturity).toBeLessThanOrEqual(5);
      expect(mockStrategyResponse.strategyProgress).toBeGreaterThan(0);
      expect(mockStrategyResponse.strategyProgress).toBeLessThanOrEqual(5);
    });

    it('should have valid milestone data', () => {
      expect(typeof mockStrategyResponse.milestone1).toBe('boolean');
      expect(typeof mockStrategyResponse.milestone2).toBe('number');
      expect(typeof mockStrategyResponse.milestone3).toBe('string');
    });
  });
});
