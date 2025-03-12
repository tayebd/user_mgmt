import { MetricCalculationUtils } from '../calculationUtils';
import { SystemCapability } from '../types';

describe('MetricCalculationUtils', () => {
  describe('normalizeValue', () => {
    it('should normalize values correctly', () => {
      expect(MetricCalculationUtils.normalizeValue(5, 0, 10)).toBe(0.5);
      expect(MetricCalculationUtils.normalizeValue(0, 0, 10)).toBe(0);
      expect(MetricCalculationUtils.normalizeValue(10, 0, 10)).toBe(1);
      expect(MetricCalculationUtils.normalizeValue(7.5, 0, 10)).toBe(0.8);
    });

    it('should handle edge cases', () => {
      expect(MetricCalculationUtils.normalizeValue(15, 0, 10)).toBe(1.5);
      expect(MetricCalculationUtils.normalizeValue(-5, 0, 10)).toBe(-0.5);
    });
  });

  describe('calculateMatrixScore', () => {
    const valueMap = {
      'none': 0,
      'basic': 0.25,
      'intermediate': 0.5,
      'advanced': 0.75,
      'expert': 1
    };

    it('should calculate matrix scores correctly', () => {
      const data: SystemCapability[] = [
        { value: 'basic', name: 'skill1' },
        { value: 'advanced', name: 'skill2' }
      ];

      const result = MetricCalculationUtils.calculateMatrixScore(data, valueMap);
      expect(result).toBe(0.5); // (0.25 + 0.75) / 2
    });

    it('should handle empty data', () => {
      expect(MetricCalculationUtils.calculateMatrixScore([], valueMap)).toBe(0);
    });

    it('should handle undefined inputs', () => {
      expect(MetricCalculationUtils.calculateMatrixScore(undefined, valueMap)).toBe(0);
      expect(MetricCalculationUtils.calculateMatrixScore([], undefined)).toBe(0);
    });

    it('should handle unknown values', () => {
      const data: SystemCapability[] = [
        { value: 'unknown', name: 'skill1' },
        { value: 'advanced', name: 'skill2' }
      ];

      const result = MetricCalculationUtils.calculateMatrixScore(data, valueMap);
      expect(result).toBe(0.38); // (0 + 0.75) / 2
    });
  });

  describe('calculateSingleScore', () => {
    const valueMap = {
      'low': 0,
      'medium': 0.5,
      'high': 1
    };

    it('should calculate single scores correctly', () => {
      expect(MetricCalculationUtils.calculateSingleScore({ value: 'medium' }, valueMap)).toBe(0.5);
      expect(MetricCalculationUtils.calculateSingleScore({ value: 'high' }, valueMap)).toBe(1);
    });

    it('should handle undefined inputs', () => {
      expect(MetricCalculationUtils.calculateSingleScore(undefined, valueMap)).toBe(0);
      expect(MetricCalculationUtils.calculateSingleScore({ value: 'medium' }, undefined)).toBe(0);
    });

    it('should handle unknown values', () => {
      expect(MetricCalculationUtils.calculateSingleScore({ value: 'unknown' }, valueMap)).toBe(0);
    });
  });

  describe('calculateResponseConsistency', () => {
    it('should calculate consistency for numeric responses', () => {
      const responses = [1, 2, 3, 4, 5];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle identical responses', () => {
      const responses = [3, 3, 3, 3];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBe(1);
    });

    it('should handle single response', () => {
      const responses = [5];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBe(1);
    });

    it('should handle empty responses', () => {
      const responses: number[] = [];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBe(1);
    });

    it('should handle non-numeric responses', () => {
      const responses = ['yes', true, null, undefined];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBe(1);
    });

    it('should handle mixed responses', () => {
      const responses = [1, 'yes', 3, null, 5];
      const result = MetricCalculationUtils.calculateResponseConsistency(responses);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence score correctly', () => {
      const responses = [1, 2, 3, 4, 5];
      const result = MetricCalculationUtils.calculateConfidenceScore(responses, 'technology');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle empty responses', () => {
      const responses: unknown[] = [];
      const result = MetricCalculationUtils.calculateConfidenceScore(responses, 'technology');
      expect(result).toBe(0);
    });

    it('should handle null/undefined responses', () => {
      const responses = [null, undefined, 1, 2, undefined];
      const result = MetricCalculationUtils.calculateConfidenceScore(responses, 'technology');
      expect(result).toBeLessThan(1);
    });

    it('should handle non-numeric responses', () => {
      const responses = ['yes', true, 'no', false];
      const result = MetricCalculationUtils.calculateConfidenceScore(responses, 'technology');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should maintain consistency across categories', () => {
      const responses = [1, 2, 3, 4, 5];
      const techScore = MetricCalculationUtils.calculateConfidenceScore(responses, 'technology');
      const processScore = MetricCalculationUtils.calculateConfidenceScore(responses, 'process');
      expect(techScore).toBe(processScore);
    });
  });
});
