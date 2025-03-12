import { 
  MetricQuestion, 
  QuestionMetricMap, 
  EnhancedSurveyResponse,
  DashboardMetrics,
  MetricCategory,
  ProcessedMetrics
} from '@/types/metrics';
import { MetricCalculationService } from './metricCalculationService';

export class SurveyMetricService {
  private static readonly questionMetricMap: QuestionMetricMap = {
    // Core Systems Implementation
    'itSystemTypes': {
      category: 'technology' as MetricCategory,
      metricType: 'multiSelect',
      weight: 1,
      valueMap: {
        'erp': 1, 'crm': 1, 'scm': 1, 'plm': 1, 'mes': 1,
        'wms': 1, 'qms': 1, 'cam': 1, 'cad': 1, 'cmms': 1,
        'bi': 1, 'eam': 1, 'iot': 1.5, 'ai_ml': 1.5,
        'rpa': 1.2, 'dms': 1, 'bpm': 1.2
      }
    },

    // System Coverage
    'systemCoverage': {
      category: 'technology' as MetricCategory,
      metricType: 'matrix',
      weight: 1,
      valueMap: {
        'none': 0, 'minimal': 0.25, 'partial': 0.5,
        'significant': 0.75, 'high': 0.9, 'full': 1
      }
    },

    // System Integration
    'systemIntegration': {
      category: 'technology' as MetricCategory,
      metricType: 'matrix',
      weight: 1.2,
      valueMap: {
        'not': 0, 'manual': 0.3, 'partial': 0.6, 'full': 1
      }
    },

    // System Capabilities
    'systemCapabilities': {
      category: 'technology' as MetricCategory,
      metricType: 'matrix',
      weight: 1.5,
      valueMap: {
        'none': 0, 'basic': 0.25, 'intermediate': 0.5,
        'advanced': 0.75, 'cutting_edge': 1
      }
    },

    // Data Analytics Capabilities
    'dataAnalytics': {
      category: 'technology' as MetricCategory,
      metricType: 'matrix',
      weight: 1.3,
      valueMap: {
        'none': 0, 'planning': 0.2, 'basic': 0.4,
        'advanced': 0.8, 'optimized': 1
      }
    },

    // Automation Level
    'automationLevel': {
      category: 'technology' as MetricCategory,
      metricType: 'matrix',
      weight: 1.4,
      valueMap: {
        'manual': 0, 'partially': 0.3, 'mostly': 0.7,
        'fully': 0.9, 'intelligent': 1
      }
    },

    // Integration Methods
    'integrationMethods': {
      category: 'technology' as MetricCategory,
      metricType: 'multiSelect',
      weight: 1.1,
      valueMap: {
        'apis': 1, 'esb': 1, 'etl': 0.8, 'middleware': 0.9,
        'custom': 0.7, 'manual': 0.3, 'ipaaS': 1
      }
    },

    // Data Standardization
    'dataStandardization': {
      category: 'technology' as MetricCategory,
      metricType: 'single',
      weight: 1.2,
      valueMap: {
        'none': 0, 'minimal': 0.25, 'partial': 0.5,
        'significant': 0.75, 'full': 1
      }
    },

    // Process Questions
    'process_digitization_docs': {
      category: 'process' as MetricCategory,
      metricType: 'level',
      weight: 0.7,
      valueMap: {
        'none': 0,
        'basic': 0.25,
        'partial': 0.5,
        'significant': 0.75,
        'full': 1
      }
    },
    
    'process_digitization_quality': {
      category: 'process' as MetricCategory,
      metricType: 'level',
      weight: 0.8,
      valueMap: {
        'none': 0,
        'basic': 0.25,
        'partial': 0.5,
        'significant': 0.75,
        'full': 1
      }
    },
    'process_automation_production': {
      category: 'process' as MetricCategory,
      metricType: 'level',
      weight: 1,
      valueMap: {
        'manual': 0,
        'semi': 0.3,
        'mostly': 0.7,
        'fully': 1
      }
    },
    'process_automation_maintenance': {
      category: 'process' as MetricCategory,
      metricType: 'level',
      weight: 0.9,
      valueMap: {
        'manual': 0,
        'semi': 0.3,
        'mostly': 0.7,
        'fully': 1
      }
    },

    // Personnel Questions
    'personnel_skilled_count': {
      category: 'personnel' as MetricCategory,
      metricType: 'count',
      weight: 1,
      valueMap: {
        '0-5': 0.2,
        '6-10': 0.4,
        '11-20': 0.6,
        '21-50': 0.8,
        '50+': 1
      }
    },
    'personnel_training_level': {
      category: 'personnel' as MetricCategory,
      metricType: 'proficiency',
      weight: 0.8,
      valueMap: {
        'basic': 0.25,
        'intermediate': 0.5,
        'advanced': 0.75,
        'expert': 1
      }
    },
    'personnel_tech_skills': {
      category: 'personnel' as MetricCategory,
      metricType: 'proficiency',
      weight: 0.9,
      valueMap: {
        'basic': 0.25,
        'intermediate': 0.5,
        'advanced': 0.75,
        'expert': 1
      }
    },

    // Strategy Questions
    'strategy_roadmap': {
      category: 'strategy' as MetricCategory,
      metricType: 'maturity',
      weight: 1,
      valueMap: {
        'none': 0,
        'initial': 0.25,
        'defined': 0.5,
        'managed': 0.75,
        'optimized': 1
      }
    },
    'strategy_budget': {
      category: 'strategy' as MetricCategory,
      metricType: 'maturity',
      weight: 0.9,
      valueMap: {
        'none': 0,
        'minimal': 0.25,
        'adequate': 0.5,
        'significant': 0.75,
        'optimal': 1
      }
    },
    'strategy_implementation': {
      category: 'strategy' as MetricCategory,
      metricType: 'progress',
      weight: 1,
      valueMap: {
        'planning': 0.2,
        'initial': 0.4,
        'inProgress': 0.6,
        'advanced': 0.8,
        'completed': 1
      }
    } as const
  };

  static getDefaultQuestions(): MetricQuestion[] {
    return [
      // Technology Questions
      {
        id: 'tech_erp',
        text: 'Do you have an ERP system implemented?',
        metricMapping: this.questionMetricMap['tech_erp'],
        responseType: 'boolean'
      },
      {
        id: 'tech_mes',
        text: 'Do you have a Manufacturing Execution System (MES) implemented?',
        metricMapping: this.questionMetricMap['tech_mes'],
        responseType: 'boolean'
      },
      {
        id: 'tech_maturity_erp',
        text: 'How would you rate the maturity of your ERP implementation?',
        metricMapping: this.questionMetricMap['tech_maturity_erp'],
        responseType: 'scale',
        options: [
          { value: 1, label: 'Basic', metricValue: 0.25 },
          { value: 2, label: 'Intermediate', metricValue: 0.5 },
          { value: 3, label: 'Advanced', metricValue: 0.75 },
          { value: 4, label: 'Leading', metricValue: 1 }
        ]
      },

      // Process Questions
      {
        id: 'process_digitization_docs',
        text: 'What is the level of digital documentation in your processes?',
        metricMapping: this.questionMetricMap['process_digitization_docs'],
        responseType: 'scale',
        options: [
          { value: 1, label: 'Mostly Paper-based', metricValue: 0.25 },
          { value: 2, label: 'Partially Digital', metricValue: 0.5 },
          { value: 3, label: 'Mostly Digital', metricValue: 0.75 },
          { value: 4, label: 'Fully Digital', metricValue: 1 }
        ]
      },
      {
        id: 'process_automation_production',
        text: 'What is the level of automation in your production processes?',
        metricMapping: this.questionMetricMap['process_automation_production'],
        responseType: 'scale',
        options: [
          { value: 1, label: 'Manual', metricValue: 0.25 },
          { value: 2, label: 'Semi-automated', metricValue: 0.5 },
          { value: 3, label: 'Mostly Automated', metricValue: 0.75 },
          { value: 4, label: 'Fully Automated', metricValue: 1 }
        ]
      },

      // Personnel Questions
      {
        id: 'personnel_skilled_count',
        text: 'How many employees are trained in Industry 4.0 technologies?',
        metricMapping: this.questionMetricMap['personnel_skilled_count'],
        responseType: 'number'
      },
      {
        id: 'personnel_tech_skills',
        text: 'What is the average technical proficiency of your workforce?',
        metricMapping: this.questionMetricMap['personnel_tech_skills'],
        responseType: 'scale',
        options: [
          { value: 1, label: 'Basic', metricValue: 0.2 },
          { value: 2, label: 'Intermediate', metricValue: 0.4 },
          { value: 3, label: 'Advanced', metricValue: 0.6 },
          { value: 4, label: 'Expert', metricValue: 0.8 },
          { value: 5, label: 'Master', metricValue: 1 }
        ]
      },

      // Strategy Questions
      {
        id: 'strategy_roadmap',
        text: 'How mature is your Industry 4.0 strategy roadmap?',
        metricMapping: this.questionMetricMap['strategy_roadmap'],
        responseType: 'scale',
        options: [
          { value: 1, label: 'Initial', metricValue: 0.25 },
          { value: 2, label: 'Defined', metricValue: 0.5 },
          { value: 3, label: 'Managed', metricValue: 0.75 },
          { value: 4, label: 'Optimized', metricValue: 1 }
        ]
      },
      {
        id: 'strategy_implementation',
        text: 'What percentage of your Industry 4.0 strategy has been implemented?',
        metricMapping: this.questionMetricMap['strategy_implementation'],
        responseType: 'scale',
        options: [
          { value: 1, label: '0-25%', metricValue: 0.25 },
          { value: 2, label: '26-50%', metricValue: 0.5 },
          { value: 3, label: '51-75%', metricValue: 0.75 },
          { value: 4, label: '76-100%', metricValue: 1 }
        ]
      }
    ];
  }

  static processSurveyResponse(response: EnhancedSurveyResponse | null): EnhancedSurveyResponse {
    // Create a properly structured empty metrics object with all required fields
    const emptyMetrics: ProcessedMetrics = {
      timestamp: new Date(),
      confidenceScores: {
        technology: 1,
        process: 1,
        personnel: 1,
        strategy: 1
      },
      metrics: {
        technologyMetrics: {
          implementationCount: 0,
          averageMaturity: 0,
          implementedTechnologies: [],
          maturityScore: 0,
          implementationDetails: {
            systemTypes: [],
            integrationLevel: 0,
            analyticsCapabilities: { level: 'basic', capabilities: [] },
            automationStatus: { level: 'low', automatedProcesses: [] }
          }
        },
        processMetrics: {
          digitizationLevel: 0,
          automationLevel: 0,
          processAreas: []
        },
        personnelMetrics: {
          totalSkilled: 0,
          avgProficiency: 0,
          skillDistribution: {}
        },
        strategyMetrics: {
          strategyMaturity: 0,
          implementationProgress: 0,
          keyMilestones: []
        }
      }
    };

    // Handle null or invalid response cases
    if (!response) {
      return {
        id: 0,
        userId: 0,
        surveyId: 0,
        companyId: 1, // Default company ID
        responseJson: '{}',
        processedMetrics: emptyMetrics
      };
    }

    try {
      // Parse response JSON if it's a string
      let responseData: Record<string, unknown>;
      try {
        responseData = typeof response.responseJson === 'string'
          ? JSON.parse(response.responseJson)
          : response.responseJson as Record<string, unknown>;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Failed to parse response JSON: ${errorMessage}`);
      }

      // Validate response data structure
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response data: expected an object');
      }

      // Calculate base metrics
      const processedMetrics = MetricCalculationService.processResponse(
        responseData,
        this.questionMetricMap
      ) as ProcessedMetrics;

      if (!processedMetrics || typeof processedMetrics !== 'object' || !processedMetrics.metrics) {
        throw new Error('Invalid metrics: MetricCalculationService returned invalid data');
      }

      // Ensure all required metric properties exist with proper structure
      if (!processedMetrics.metrics.technologyMetrics) {
        processedMetrics.metrics.technologyMetrics = {
          implementationCount: 0,
          averageMaturity: 0,
          implementedTechnologies: [],
          maturityScore: 0,
          implementationDetails: {
            systemTypes: [],
            integrationLevel: 0,
            analyticsCapabilities: { level: 'basic', capabilities: [] },
            automationStatus: { level: 'low', automatedProcesses: [] }
          }
        };
      } else {
        // Ensure the technologyMetrics object has all required properties
        processedMetrics.metrics.technologyMetrics = {
          implementationCount: processedMetrics.metrics.technologyMetrics.implementationCount || 0,
          averageMaturity: processedMetrics.metrics.technologyMetrics.averageMaturity || 0,
          implementedTechnologies: processedMetrics.metrics.technologyMetrics.implementedTechnologies || [],
          maturityScore: processedMetrics.metrics.technologyMetrics.maturityScore || 0,
          implementationDetails: processedMetrics.metrics.technologyMetrics.implementationDetails || {
            systemTypes: [],
            integrationLevel: 0,
            analyticsCapabilities: { level: 'basic', capabilities: [] },
            automationStatus: { level: 'low', automatedProcesses: [] }
          }
        };
      }

      // Calculate technology maturity score
      const technologyScore = this.calculateTechnologyScore(responseData);

      // Extract implementation details
      const implementationDetails = this.extractImplementationDetails(responseData);

      // Create a complete response object with all required fields
      const updatedResponse: EnhancedSurveyResponse = {
        id: response.id || 0,
        surveyId: response.surveyId || 0,
        userId: response.userId || 0,
        companyId: response.companyId !== undefined ? response.companyId : 1, // Always ensure a valid companyId
        responseJson: response.responseJson,
        processedMetrics: {
          timestamp: processedMetrics.timestamp || new Date(),
          confidenceScores: processedMetrics.confidenceScores || {
            technology: 1,
            process: 1,
            personnel: 1,
            strategy: 1
          },
          metrics: {
            technologyMetrics: {
              ...processedMetrics.metrics.technologyMetrics,
              maturityScore: technologyScore,
              implementationDetails
            },
            processMetrics: processedMetrics.metrics.processMetrics || {
              digitizationLevel: 0,
              automationLevel: 0,
              processAreas: []
            },
            personnelMetrics: processedMetrics.metrics.personnelMetrics || {
              totalSkilled: 0,
              avgProficiency: 0,
              skillDistribution: {}
            },
            strategyMetrics: processedMetrics.metrics.strategyMetrics || {
              strategyMaturity: 0,
              implementationProgress: 0,
              keyMilestones: []
            }
          }
        }
      };
      
      // Ensure the processedMetrics is properly serializable
      return JSON.parse(JSON.stringify(updatedResponse)) as EnhancedSurveyResponse;
    } catch (error) {
      console.error('Error processing survey response:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process survey response: ${error.message}`);
      } else {
        throw new Error('Failed to process survey response: Unknown error');
      }
    }
  }

  private static calculateTechnologyScore(responseData: Record<string, unknown>): number {
    if (!responseData || typeof responseData !== 'object') return 0;
    try {
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

      // Calculate weighted scores for each category
      Object.entries(weights).forEach(([category, weight]) => {
        if (responseData[category]) {
          const categoryScore = this.calculateCategoryScore(responseData[category] as { name?: string; value: string } | Array<{ name: string; value: string }> | null);
          totalScore += categoryScore * weight;
          totalWeight += weight;
        }
      });

      return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    } catch (error) {
      console.error('Error calculating technology score:', error);
      return 0;
    }
  }

  private static calculateCategoryScore(categoryData: { name?: string; value: string } | Array<{ name: string; value: string }> | null): number {
    // Handle null, undefined, or empty object cases
    if (!categoryData || typeof categoryData !== 'object') return 0;
    
    // If it's an empty object or array, return 0
    if (Array.isArray(categoryData) && categoryData.length === 0) return 0;
    if (!Array.isArray(categoryData) && Object.keys(categoryData).length === 0) return 0;

    // Handle matrix questions
    if (Array.isArray(categoryData)) {
      const scores = categoryData.map((row: { name: string; value: string }) => {
        if (!row || !row.name || !row.value) return 0;
        const mapping = this.questionMetricMap[row.name];
        const valueMap = mapping?.valueMap;
        return valueMap && row.value in valueMap ? valueMap[row.value] : 0;
      });
      return scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;
    }

    // Handle single value questions
    if (!('value' in categoryData) || typeof categoryData.value !== 'string') return 0;
    
    const name = categoryData.name;
    if (!name || typeof name !== 'string') return 0;
    
    const mapping = this.questionMetricMap[name];
    const valueMap = mapping?.valueMap;
    return valueMap && categoryData.value in valueMap ? valueMap[categoryData.value] : 0;
  }

  private static extractImplementationDetails(responseData: Record<string, unknown>): {
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
  } {
    const itSystemTypes = Array.isArray(responseData.itSystemTypes) 
      ? responseData.itSystemTypes as string[]
      : [];

    const systemIntegration = Array.isArray(responseData.systemIntegration)
      ? responseData.systemIntegration as Array<{ value: string }>
      : [];

    const dataAnalytics = typeof responseData.dataAnalytics === 'object' && responseData.dataAnalytics !== null
      ? responseData.dataAnalytics as Record<string, string>
      : undefined;

    const automationLevel = typeof responseData.automationLevel === 'object' && responseData.automationLevel !== null
      ? responseData.automationLevel as Record<string, string>
      : undefined;

    return {
      systemTypes: this.extractSelectedSystems(itSystemTypes),
      integrationLevel: this.calculateIntegrationLevel(systemIntegration),
      analyticsCapabilities: this.extractAnalyticsCapabilities(dataAnalytics),
      automationStatus: this.extractAutomationStatus(automationLevel)
    };
  }

  private static extractSelectedSystems(systemTypes: string[]): string[] {
    return Array.isArray(systemTypes) ? systemTypes.filter(type => type !== 'none') : [];
  }

  private static calculateIntegrationLevel(integrationData: Array<{ value: string }>): number {
    if (!integrationData || !Array.isArray(integrationData)) return 0;
    
    const valueMap: Record<string, number> = {
      'not': 0, 'manual': 0.3, 'partial': 0.6, 'full': 1
    };

    const scores = integrationData.map(item => 
      item.value in valueMap ? valueMap[item.value] : 0
    );
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  private static extractAnalyticsCapabilities(analyticsData: Record<string, string> | undefined): {
    level: string;
    capabilities: string[];
  } {
    if (!analyticsData) return { level: 'basic', capabilities: [] };

    const capabilities = Object.entries(analyticsData)
      .filter(([, value]) => value === 'advanced' || value === 'optimized')
      .map(([key]) => key);

    const level = capabilities.length >= 4 ? 'advanced' :
      capabilities.length >= 2 ? 'intermediate' : 'basic';

    return { level, capabilities };
  }

  private static extractAutomationStatus(automationData: Record<string, string> | undefined): {
    level: string;
    automatedProcesses: string[];
  } {
    if (!automationData) return { level: 'low', automatedProcesses: [] };

    const automatedProcesses = Object.entries(automationData)
      .filter(([, value]) => value === 'fully' || value === 'intelligent')
      .map(([key]) => key);

    const level = automatedProcesses.length >= 4 ? 'high' :
      automatedProcesses.length >= 2 ? 'medium' : 'low';

    return { level, automatedProcesses };
  }

  static getQuestionMetricMap(): QuestionMetricMap {
    return this.questionMetricMap;
  }

  static aggregateCompanyMetrics(responses: EnhancedSurveyResponse[]): DashboardMetrics {
    return MetricCalculationService.aggregateHistoricalData(responses);
  }
}
