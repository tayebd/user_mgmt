import { SurveyMetricService } from '@/services/surveyMetricService';
import { EnhancedSurveyResponse } from '@/types/metrics';
import { SurveyResponse } from '@/types';

describe('Survey Response Submission', () => {
  // Mock fetch for testing API calls
  global.fetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation((key) => {
          return key === 'organizationId' ? '263' : null;
        }),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should correctly format survey response data for API submission', async () => {
    // Sample survey response data
    const sampleResponseData = {
      question1: 'answer1',
      question2: 'answer2',
      systemCoverage: [
        { name: 'erp', value: 'full' },
        { name: 'crm', value: 'partial' }
      ],
      systemIntegration: [
        { name: 'erp_crm', value: 'full' },
        { name: 'erp_scm', value: 'partial' }
      ],
      organizationId: 1
    };

    // Convert to JSON string as would happen in the app
    const responseJsonString = JSON.stringify(sampleResponseData);

    // Mock the SurveyMetricService.processSurveyResponse method
    const processSpy = jest.spyOn(SurveyMetricService, 'processSurveyResponse');
    processSpy.mockImplementation((response) => {
      return {
        ...response,
        processedMetrics: {
          timestamp: new Date(),
          confidenceScores: { technology: 1, process: 1, personnel: 1, strategy: 1 },
          metrics: {
            technologyMetrics: {
              implementationCount: 2,
              averageMaturity: 0.75,
              implementedTechnologies: ['erp', 'crm'],
              maturityScore: 80,
              implementationDetails: {
                systemTypes: ['erp', 'crm'],
                integrationLevel: 0.8,
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
        }
      } as EnhancedSurveyResponse;
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        surveyId: 9,
        userId: 1,
        organizationId: 1,
        responseJson: responseJsonString,
        processedMetrics: {
          timestamp: new Date(),
          confidenceScores: { technology: 1, process: 1, personnel: 1, strategy: 1 },
          metrics: {
            technologyMetrics: {
              implementationCount: 2,
              averageMaturity: 0.75,
              implementedTechnologies: ['erp', 'crm'],
              maturityScore: 80
            }
          }
        }
      })
    });

    // Mock getAuthToken
    const getAuthToken = jest.fn().mockResolvedValue('mock-token');

    // Create a mock API store function similar to the real one
    const createSurveyResponse = async (
      surveyId: number, 
      surveyResponse: string, 
      userId: number
    ): Promise<SurveyResponse> => {
      try {
        // Validate input parameters
        if (!surveyId || !surveyResponse || !userId) {
          throw new Error('Missing required parameters for survey response');
        }

        // Validate JSON format
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(surveyResponse);
          if (!parsedResponse || typeof parsedResponse !== 'object') {
            throw new Error('Invalid response data format');
          }
        } catch (jsonError) {
          console.error('JSON validation error:', jsonError);
          throw new Error('Invalid survey response format');
        }

        // Ensure organizationId exists in the parsed response
        const organizationId = parsedResponse.organizationId || 1;

        // Process metrics from survey response
        const processedResponse = SurveyMetricService.processSurveyResponse({
          id: 0,
          surveyId,
          responseJson: surveyResponse,
          userId,
          organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10)
        });

        // Get auth token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('Authentication required');
        }

        // Make API request
        const response = await fetch(
          `http://localhost:5000/api/surveys/${surveyId}/surveyResponses`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId,
              organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10),
              responseJson: surveyResponse,
              processedMetrics: processedResponse.processedMetrics
            }),
            credentials: 'include'
          }
        );

        // Handle non-200 responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to save survey response: ${response.status}`);
        }

        const data = await response.json();
        if (!data) {
          throw new Error('No response data received');
        }

        return data as SurveyResponse;
      } catch (error) {
        console.error('Survey response creation error:', error);
        throw error;
      }
    };

    // Test the function
    const result = await createSurveyResponse(9, responseJsonString, 1);

    // Verify the request was made correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Check the fetch call arguments
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/surveys/9/surveyResponses');
    expect(options.method).toBe('POST');
    
    // Parse the request body to verify it's correctly formatted
    const requestBody = JSON.parse(options.body);
    expect(requestBody).toEqual({
      userId: 1,
      organizationId: 1,
      responseJson: responseJsonString,
      processedMetrics: expect.any(Object)
    });
    
    // Verify the response
    expect(result).toEqual({
      id: 1,
      surveyId: 9,
      userId: 1,
      organizationId: 1,
      responseJson: responseJsonString,
      processedMetrics: expect.any(Object)
    });
  });

  it('should handle missing organizationId by using a default value', async () => {
    // Sample response without organizationId
    const sampleResponseData = {
      question1: 'answer1',
      question2: 'answer2'
    };
    
    const responseJsonString = JSON.stringify(sampleResponseData);
    
    // Mock the SurveyMetricService.processSurveyResponse method
    const processSpy = jest.spyOn(SurveyMetricService, 'processSurveyResponse');
    processSpy.mockImplementation((response) => {
      // Cast to unknown first to avoid type errors
      return {
        ...response,
        processedMetrics: {
          timestamp: new Date().toISOString(),
          confidenceScores: { technology: 1, process: 1, personnel: 1, strategy: 1 },
          metrics: {
            technologyMetrics: { 
              implementationCount: 0,
              averageMaturity: 0,
              implementedTechnologies: [],
              maturityScore: 0,
              implementationDetails: {
                systemTypes: [],
                integrationLevel: 0,
                analyticsCapabilities: { dataCollection: false, reporting: false, predictive: false },
                automationStatus: { manual: true, semiAutomated: false, fullyAutomated: false }
              }
            },
            processMetrics: { 
              digitizationLevel: 0,
              processAreas: []
            },
            personnelMetrics: { 
              totalSkilled: 0,
              avgProficiency: 0
            },
            strategyMetrics: { 
              strategyMaturity: 0,
              implementationProgress: 0,
              hasI40Strategy: false,
              nextReviewDate: null
            }
          }
        }
      } as unknown as EnhancedSurveyResponse;
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        surveyId: 9,
        userId: 1,
        organizationId: 1,
        responseJson: responseJsonString
      })
    });

    // Mock getAuthToken
    const getAuthToken = jest.fn().mockResolvedValue('mock-token');

    // Create a mock API store function similar to the real one
    const createSurveyResponse = async (
      surveyId: number, 
      surveyResponse: string, 
      userId: number
    ): Promise<SurveyResponse> => {
      try {
        // Validate input parameters
        if (!surveyId || !surveyResponse || !userId) {
          throw new Error('Missing required parameters for survey response');
        }

        // Validate JSON format
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(surveyResponse);
          if (!parsedResponse || typeof parsedResponse !== 'object') {
            throw new Error('Invalid response data format');
          }
        } catch (jsonError) {
          console.error('JSON validation error:', jsonError);
          throw new Error('Invalid survey response format');
        }

        // Ensure organizationId exists in the parsed response
        const organizationId = parsedResponse.organizationId || 1;

        // Process metrics from survey response
        const processedResponse = SurveyMetricService.processSurveyResponse({
          id: 0,
          surveyId,
          responseJson: surveyResponse,
          userId,
          organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10)
        });

        // Get auth token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('Authentication required');
        }

        // Make API request
        const response = await fetch(
          `http://localhost:5000/api/surveys/${surveyId}/surveyResponses`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId,
              organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10),
              responseJson: surveyResponse,
              processedMetrics: processedResponse.processedMetrics
            }),
            credentials: 'include'
          }
        );

        // Handle non-200 responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to save survey response: ${response.status}`);
        }

        const data = await response.json();
        if (!data) {
          throw new Error('No response data received');
        }

        return data as SurveyResponse;
      } catch (error) {
        console.error('Survey response creation error:', error);
        throw error;
      }
    };

    // Test the function
    const result = await createSurveyResponse(9, responseJsonString, 1);

    // Verify the request was made correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Check the fetch call arguments
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/surveys/9/surveyResponses');
    
    // Parse the request body to verify it's correctly formatted
    const requestBody = JSON.parse(options.body);
    expect(requestBody).toEqual({
      userId: 1,
      organizationId: 1, // Default value should be used
      responseJson: responseJsonString,
      processedMetrics: expect.any(Object)
    });
    
    // Verify the response
    expect(result).toEqual({
      id: 2,
      surveyId: 9,
      userId: 1,
      organizationId: 1,
      responseJson: responseJsonString
    });
  });
});
