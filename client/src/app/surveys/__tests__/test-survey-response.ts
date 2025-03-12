import { SurveyResponse } from '@/types';

/**
 * Test data for survey responses
 */
export const testSurveyResponse = {
  // Basic survey response with minimal data
  basic: {
    surveyId: 9,
    responseJson: JSON.stringify({
      question1: 'answer1',
      question2: 'answer2',
      companyId: 263
    }),
    userId: 1
  },
  
  // Comprehensive survey response with technology metrics
  comprehensive: {
    surveyId: 9,
    responseJson: JSON.stringify({
      systemCoverage: [
        { name: 'erp', value: 'full' },
        { name: 'crm', value: 'partial' }
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
      strategyMaturity: 'advanced',
      companyId: 263
    }),
    userId: 1
  }
};

/**
 * Helper function to create a test survey response
 * @param type The type of test response to create
 * @returns A promise that resolves to the created survey response
 */
export async function createTestSurveyResponse(
  type: keyof typeof testSurveyResponse = 'basic'
): Promise<SurveyResponse> {
  const { surveyId, responseJson, userId } = testSurveyResponse[type];
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}/surveyResponses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          userId,
          companyId: 263,
          responseJson
        }),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create test survey response: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating test survey response:', error);
    throw error;
  }
}
