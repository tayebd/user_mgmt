import { PrismaClient, Prisma } from '@prisma/client';
import { ProcessedMetrics, DashboardMetrics, TechnologyMetrics, ProcessMetrics, PersonnelMetrics, StrategyMetrics } from '../types/metrics';

// Define the current metrics version
const CURRENT_METRICS_VERSION = '1.0.0';

// Type guard to ensure ProcessedMetrics type
function isProcessedMetrics(obj: any): obj is ProcessedMetrics {
  return obj && 
    typeof obj === 'object' && 
    'timestamp' in obj && 
    'metrics' in obj && 
    'confidenceScores' in obj &&
    obj.metrics && 
    'technologyMetrics' in obj.metrics;
}

const prisma = new PrismaClient();

/**
 * Mock survey response data based on existing response with ID 12
 */
const mockSurveyResponse = {
  surveyId: 9,
  userId: 1,
  organizationId: 263,
  responseJson: {
    systemCoverage: [
      { name: 'erp', value: 'full' },
      { name: 'crm', value: 'partial' },
      { name: 'scm', value: 'minimal' }
    ],
    systemIntegration: [
      { name: 'erp_crm', value: 'full' },
      { name: 'erp_scm', value: 'partial' }
    ],
    analyticsCapabilities: [
      { name: 'reporting', value: true },
      { name: 'dashboards', value: true },
      { name: 'predictive', value: false }
    ],
    automationLevel: 'medium',
    digitalProcesses: [
      { name: 'sales', value: 'full' },
      { name: 'procurement', value: 'partial' }
    ],
    skillLevels: [
      { name: 'technical', value: 'high' },
      { name: 'analytical', value: 'medium' }
    ],
    strategyMaturity: 'advanced'
  },
  // Mock processed metrics
  processedMetrics: {
    timestamp: new Date().toISOString(),
    metrics: {
      technologyMetrics: {
        implementationCount: 3,
        averageMaturity: 3.5,
        implementedTechnologies: ['erp', 'crm', 'scm'],
        maturityScore: 75,
        implementationDetails: {
          systemTypes: ['ERP', 'CRM', 'SCM'],
          integrationLevel: 70,
          analyticsCapabilities: {
            level: 'intermediate',
            capabilities: ['reporting', 'dashboards']
          },
          automationStatus: {
            level: 'medium',
            automatedProcesses: ['sales', 'procurement']
          }
        }
      },
      processMetrics: {
        digitizationLevel: 65,
        automationLevel: 60,
        processAreas: ['sales', 'procurement']
      },
      personnelMetrics: {
        totalSkilled: 25,
        avgProficiency: 3.5,
        skillDistribution: {
          technical: 0.7,
          analytical: 0.5
        }
      },
      strategyMetrics: {
        strategyMaturity: 4,
        implementationProgress: 0.75,
        keyMilestones: ['strategy_defined', 'implementation_started']
      }
    },
    confidenceScores: {
      technology: 0.85,
      process: 0.8,
      personnel: 0.75,
      strategy: 0.9
    }
  } as ProcessedMetrics
};

/**
 * Function to create a test survey response in the database
 */
async function createTestSurveyResponse() {
  try {
    console.log('Creating test survey response...');
    
    // Check if survey exists
    const survey = await prisma.survey.findUnique({
      where: { id: mockSurveyResponse.surveyId }
    });
    
    if (!survey) {
      throw new Error(`Survey with ID ${mockSurveyResponse.surveyId} not found`);
    }
    
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: mockSurveyResponse.organizationId }
    });
    
    if (!organization) {
      throw new Error(`Organization with ID ${mockSurveyResponse.organizationId} not found`);
    }
    
    // Create survey response
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: mockSurveyResponse.surveyId,
        userId: mockSurveyResponse.userId,
        organizationId: mockSurveyResponse.organizationId,
        responseJson: mockSurveyResponse.responseJson,
        processedMetrics: mockSurveyResponse.processedMetrics as unknown as Prisma.InputJsonValue,
        metricsVersion: CURRENT_METRICS_VERSION,
        lastMetricsUpdate: new Date()
      },
      include: {
        survey: true,
        user: true,
        organization: true
      }
    });
    
    console.log('Successfully created survey response:', {
      id: surveyResponse.id,
      surveyId: surveyResponse.surveyId,
      userId: surveyResponse.userId,
      organizationId: surveyResponse.organizationId,
      createdAt: surveyResponse.createdAt
    });
    
    // Create technology implementations for the metrics
    if (isProcessedMetrics(mockSurveyResponse.processedMetrics)) {
      await createTechnologyImplementations(
        surveyResponse.organizationId,
        mockSurveyResponse.processedMetrics
      );
    } else {
      console.warn('Skipping technology implementations - invalid metrics format');
    }
    
    return surveyResponse;
  } catch (error) {
    console.error('Error creating test survey response:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Function to create technology implementations for the metrics
 */
async function createTechnologyImplementations(
  organizationId: number,
  processedMetrics: ProcessedMetrics
) {
  try {
    console.log('Creating technology implementations...');
    
    // Extract implemented technologies from the metrics
    const implementedTechnologies = processedMetrics.metrics.technologyMetrics.implementedTechnologies;
    
    for (const tech of implementedTechnologies) {
      // Ensure technology type exists
      try {
        // Find technology type by name
        const techType = await prisma.technologyType.findUnique({
          where: { 
            name: tech 
          }
        });
        
        // If technology type doesn't exist, create it
        let techTypeId: number;
        
        if (techType) {
          techTypeId = techType.id;
        } else {
          const newTechType = await prisma.technologyType.create({
            data: {
              name: tech,
              category: 'IT_SYSTEMS',
              description: `${tech} implementation`
            }
          });
          techTypeId = newTechType.id;
        }
      
        // Check if implementation exists
        const existingImpl = await prisma.technologyImplementation.findFirst({
          where: {
            organizationId: organizationId,
            technologyTypeId: techTypeId
          }
        });
        
        // Create or update implementation
        if (existingImpl) {
          // Update existing implementation
          await prisma.technologyImplementation.update({
            where: {
              id: existingImpl.id
            },
            data: {
              maturityLevel: Math.floor(Math.random() * 5) + 1,
              status: 'ACTIVE',
              investmentAmount: Math.floor(Math.random() * 100000)
            }
          });
        } else {
          // Create new implementation
          await prisma.technologyImplementation.create({
            data: {
              organizationId,
              technologyTypeId: techTypeId,
              implementationDate: new Date(),
              maturityLevel: Math.floor(Math.random() * 5) + 1, // Random maturity level between 1-5
              status: 'ACTIVE',
              investmentAmount: Math.floor(Math.random() * 100000) // Random investment amount
            }
          });
        }
      } catch (error) {
        console.error(`Error processing technology ${tech}:`, error);
      }
    }
    
    console.log('Successfully created technology implementations');
  } catch (error) {
    console.error('Error creating technology implementations:', error);
    throw error;
  }
}

// Execute the test
createTestSurveyResponse()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
