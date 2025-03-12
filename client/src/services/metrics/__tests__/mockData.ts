import { MetricCategory, MetricType, QuestionMetricMap } from '@/types/metrics';
import { TechnologyResponse } from '../types';

export const mockQuestionMap: QuestionMetricMap = {
  'systemCapabilities': {
    category: 'technology' as MetricCategory,
    metricType: 'matrix' as MetricType,
    weight: 0.25,
    valueMap: {
      'none': 0,
      'basic': 0.25,
      'intermediate': 0.5,
      'advanced': 0.75,
      'cutting_edge': 1
    }
  },
  'systemIntegration': {
    category: 'technology' as MetricCategory,
    metricType: 'matrix' as MetricType,
    weight: 0.2,
    valueMap: {
      'not': 0,
      'manual': 0.25,
      'partial': 0.5,
      'full': 1,
      'na': 0
    }
  },
  'dataAnalytics': {
    category: 'technology' as MetricCategory,
    metricType: 'matrix' as MetricType,
    weight: 0.2,
    valueMap: {
      'none': 0,
      'planning': 0.25,
      'basic': 0.5,
      'advanced': 0.75,
      'optimized': 1
    }
  },
  'automationLevel': {
    category: 'technology' as MetricCategory,
    metricType: 'matrix' as MetricType,
    weight: 0.15,
    valueMap: {
      'manual': 0,
      'partially': 0.5,
      'mostly': 0.75,
      'fully': 1,
      'intelligent': 1
    }
  },
  'dataStandardization': {
    category: 'technology' as MetricCategory,
    metricType: 'single' as MetricType,
    weight: 0.1,
    valueMap: {
      'none': 0,
      'minimal': 0.25,
      'partial': 0.5,
      'significant': 0.75,
      'full': 1
    }
  },
  'processDigitization': {
    category: 'process' as MetricCategory,
    metricType: 'level' as MetricType,
    weight: 0.4,
    valueMap: {
      '1': 0.2,
      '2': 0.4,
      '3': 0.6,
      '4': 0.8,
      '5': 1
    }
  },
  'processAutomation': {
    category: 'process' as MetricCategory,
    metricType: 'level' as MetricType,
    weight: 0.6,
    valueMap: {
      '1': 0.2,
      '2': 0.4,
      '3': 0.6,
      '4': 0.8,
      '5': 1
    }
  },
  'skillLevel_development': {
    category: 'personnel' as MetricCategory,
    metricType: 'proficiency' as MetricType,
    weight: 0.3,
    valueMap: {
      '1': 0.2,
      '2': 0.4,
      '3': 0.6,
      '4': 0.8,
      '5': 1
    }
  },
  'strategyMaturity': {
    category: 'strategy' as MetricCategory,
    metricType: 'maturity' as MetricType,
    weight: 0.5,
    valueMap: {
      '1': 0.2,
      '2': 0.4,
      '3': 0.6,
      '4': 0.8,
      '5': 1
    }
  }
};

export const mockTechnologyResponse: TechnologyResponse = {
  itSystemTypes: ['erp', 'crm', 'scm'],
  systemCapabilities: [
    { value: 'advanced', name: 'realtime_data' },
    { value: 'intermediate', name: 'predictive_analytics' }
  ],
  systemIntegration: [
    { value: 'full', name: 'erpCrm' },
    { value: 'partial', name: 'erpScm' }
  ],
  dataAnalytics: [
    { value: 'advanced', name: 'descriptive' },
    { value: 'optimized', name: 'predictive' }
  ],
  automationLevel: [
    { value: 'fully', name: 'processA' },
    { value: 'intelligent', name: 'processB' }
  ],
  dataStandardization: { value: 'significant' }
};

export const mockProcessResponse = {
  processDigitization: 4,
  processAutomation: 3,
  processAreas: ['area1', 'area2']
};

export const mockPersonnelResponse = {
  'skillLevel_development': 4,
  'skillLevel_operations': 3,
  'skillCount_development': 10,
  'skillCount_operations': 5
};

export const mockStrategyResponse = {
  strategyMaturity: 4,
  strategyProgress: 3,
  milestone1: true,
  milestone2: 1,
  milestone3: 'yes',
  milestone4: false
};
