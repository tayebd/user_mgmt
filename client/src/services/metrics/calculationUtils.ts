import { SystemCapability } from './types';

export class MetricCalculationUtils {
  static normalizeValue(value: number, min: number, max: number): number {
    return Number(((value - min) / (max - min)).toFixed(1));
  }

  static calculateMatrixScore(data: SystemCapability[] | undefined, valueMap?: Record<string, number>): number {
    if (!data || !Array.isArray(data) || !valueMap) return 0;
    
    const scores = data.map(item => valueMap[item.value] || 0);
    return scores.length > 0
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      : 0;
  }

  static calculateSingleScore(data: { value: string } | undefined, valueMap?: Record<string, number>): number {
    if (!data || !valueMap || typeof data.value !== 'string') return 0;
    return valueMap[data.value] || 0;
  }

  static calculateResponseConsistency(responses: (string | number | boolean | null | undefined)[]): number {
    if (responses.length < 2) return 1;
    
    const numericResponses = responses.filter((r): r is number => typeof r === 'number');
    if (numericResponses.length < 2) return 1;
    
    const avg = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length;
    const variance = numericResponses.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / numericResponses.length;
    
    return Number((1 / (1 + variance)).toFixed(1));
  }

  static calculateConfidenceScore(responses: unknown[], category: string): number {
    if (!Array.isArray(responses) || responses.length === 0) return 0;
    
    const validResponses = responses.filter(r => r !== null && r !== undefined);
    if (validResponses.length === 0) return 0;
    
    const responseConsistency = this.calculateResponseConsistency(
      validResponses.map(r => (typeof r === 'number' ? r : 0))
    );
    
    return Number(((validResponses.length / responses.length) * responseConsistency).toFixed(1));
  }
}
