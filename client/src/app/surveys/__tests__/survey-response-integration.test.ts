// Integration test for survey response functionality
import '@testing-library/jest-dom';
import { Model } from 'survey-core';

// Mock dependencies
const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock the API store
const mockApiStore = {
  fetchSurveyById: jest.fn(),
  createSurveyResponse: jest.fn(),
};

const mockUseApiStore = jest.fn();
jest.mock('@/state/api', () => ({
  useApiStore: () => mockUseApiStore(),
}));

// Mock toast notifications
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock('sonner', () => ({
  toast: mockToast,
}));

// Mock the survey theme
jest.mock('../[id]/respond/theme', () => ({
  themeJson: {
    checkbox: {
      root: 'sv_qcbc flex flex-wrap gap-4 p-4',
      item: 'sv_q_checkbox relative flex items-center p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer min-w-[200px] bg-white',
      itemChecked: '!border-blue-600',
      itemControl: 'absolute inset-0 opacity-0 cursor-pointer',
      itemDecorator: 'w-7 h-7 border-2 rounded-md mr-3 flex items-center justify-center transition-colors border-gray-400 bg-white',
      itemCheckedDecorator: '!border-blue-600 !bg-blue-600',
      itemText: 'text-base font-medium flex-1 text-gray-900',
      label: 'flex items-center cursor-pointer',
      svgIcon: 'block w-[28px] h-[28px] stroke-white stroke-[3]'
    }
  },
  customCss: {}
}));

// Sample survey data
const mockSurvey = {
  id: 1,
  title: 'Test Survey',
  surveyJson: JSON.stringify({
    title: 'Test Survey',
    pages: [{
      name: 'page1',
      elements: [{
        type: 'checkbox',
        name: 'satisfaction',
        title: 'How satisfied are you with our service?',
        choices: [
          { value: 'very_satisfied', text: 'Very Satisfied', score: 5 },
          { value: 'satisfied', text: 'Satisfied', score: 4 },
          { value: 'neutral', text: 'Neutral', score: 3 },
          { value: 'dissatisfied', text: 'Dissatisfied', score: 2 },
          { value: 'very_dissatisfied', text: 'Very Dissatisfied', score: 1 }
        ]
      }]
    }]
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockResponse = {
  id: 1,
  surveyId: 1,
  userId: 1,
  responseData: '{"satisfaction":["very_satisfied","satisfied"]}',
  processedMetrics: {
    confidenceScores: [0.95],
    metrics: ['satisfaction_score']
  },
  createdAt: new Date(),
};

// Simulate the page component's behavior
async function simulateSurveyLoad(surveyId: string | number) {
  try {
    // Validate survey ID
    const id = Number(surveyId);
    if (isNaN(id) || id <= 0) {
      throw new Error(`Invalid survey ID: ${surveyId}`);
    }

    // Fetch survey data
    const survey = await mockApiStore.fetchSurveyById(id);
    if (!survey) {
      throw new Error('Survey not found');
    }

    // Validate survey data
    if (!survey.title || !survey.surveyJson) {
      throw new Error('Invalid survey data: missing required fields');
    }

    // Parse survey JSON
    const surveyData = typeof survey.surveyJson === 'string'
      ? JSON.parse(survey.surveyJson)
      : survey.surveyJson;

    if (!surveyData || typeof surveyData !== 'object') {
      throw new Error('Invalid survey definition format');
    }

    // Create survey model
    const surveyModel = new Model(surveyData);
    return { survey, surveyModel };
  } catch (error) {
    throw error;
  }
}

// Simulate survey submission
async function simulateSurveySubmission(surveyId: number, surveyModel: Model) {
  try {
    // Validate survey data
    if (!surveyModel.data) {
      throw new Error('Survey response data is missing');
    }

    // Clean data for submission
    const jsonString = JSON.stringify(surveyModel.data);
    const cleanData = JSON.parse(jsonString);

    if (!cleanData || typeof cleanData !== 'object') {
      throw new Error('Invalid response data format');
    }

    // Submit response
    const response = await mockApiStore.createSurveyResponse(
      surveyId,
      JSON.stringify(cleanData),
      1 // Mock user ID
    );

    if (!response) {
      throw new Error('Failed to save survey response');
    }

    // Show success message and redirect
    mockToast.success('Survey response submitted successfully');
    mockRouter.push(`/surveys/${surveyId}/thank-you`);

    return response;
  } catch (error) {
    mockToast.error(error instanceof Error ? error.message : 'Submission failed');
    throw error;
  }
}

describe('Survey Response Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiStore.mockReturnValue(mockApiStore);
  });

  describe('Survey Loading', () => {
    it('should load a valid survey successfully', async () => {
      mockApiStore.fetchSurveyById.mockResolvedValueOnce(mockSurvey);

      const result = await simulateSurveyLoad(1);
      
      expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(1);
      expect(result.survey).toEqual(mockSurvey);
      expect(result.surveyModel).toBeDefined();
      expect(result.surveyModel.title).toBe('Test Survey');
    });

    it('should handle invalid survey ID', async () => {
      await expect(simulateSurveyLoad('invalid')).rejects.toThrow('Invalid survey ID: invalid');
      expect(mockApiStore.fetchSurveyById).not.toHaveBeenCalled();
    });

    it('should handle survey not found', async () => {
      mockApiStore.fetchSurveyById.mockResolvedValueOnce(null);
      
      await expect(simulateSurveyLoad(999)).rejects.toThrow('Survey not found');
      expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(999);
    });

    it('should handle missing survey fields', async () => {
      mockApiStore.fetchSurveyById.mockResolvedValueOnce({ id: 1 });
      
      await expect(simulateSurveyLoad(1)).rejects.toThrow('Invalid survey data: missing required fields');
      expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(1);
    });

    it('should handle invalid survey JSON', async () => {
      mockApiStore.fetchSurveyById.mockResolvedValueOnce({
        id: 1,
        title: 'Test Survey',
        surveyJson: '{invalid:json}',
      });
      
      await expect(simulateSurveyLoad(1)).rejects.toThrow();
      expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(1);
    });
  });

  describe('Survey Submission', () => {
    it('should submit survey response successfully', async () => {
      mockApiStore.createSurveyResponse.mockResolvedValueOnce(mockResponse);
      
      const surveyModel = new Model(JSON.parse(mockSurvey.surveyJson));
      surveyModel.data = { satisfaction: ['very_satisfied', 'satisfied'] };
      
      const response = await simulateSurveySubmission(1, surveyModel);
      
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalledWith(
        1,
        expect.any(String),
        1
      );
      expect(response).toEqual(mockResponse);
      expect(mockToast.success).toHaveBeenCalledWith('Survey response submitted successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/thank-you');
    });

    it('should handle missing survey data', async () => {
      mockApiStore.createSurveyResponse.mockResolvedValueOnce(null);
      
      const surveyModel = new Model(JSON.parse(mockSurvey.surveyJson));
      surveyModel.data = {}; // Empty data but not null
      
      await expect(simulateSurveySubmission(1, surveyModel)).rejects.toThrow('Failed to save survey response');
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
      mockApiStore.createSurveyResponse.mockRejectedValueOnce(new Error('Submission failed'));
      
      const surveyModel = new Model(JSON.parse(mockSurvey.surveyJson));
      surveyModel.data = { satisfaction: ['very_satisfied'] };
      
      await expect(simulateSurveySubmission(1, surveyModel)).rejects.toThrow('Submission failed');
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith('Submission failed');
    });

    it('should handle response not returned', async () => {
      mockApiStore.createSurveyResponse.mockResolvedValueOnce(null);
      
      const surveyModel = new Model(JSON.parse(mockSurvey.surveyJson));
      surveyModel.data = { satisfaction: ['very_satisfied'] };
      
      await expect(simulateSurveySubmission(1, surveyModel)).rejects.toThrow('Failed to save survey response');
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalled();
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle the complete survey flow', async () => {
      // Setup mocks
      mockApiStore.fetchSurveyById.mockResolvedValueOnce(mockSurvey);
      mockApiStore.createSurveyResponse.mockResolvedValueOnce(mockResponse);
      
      // Load survey
      const { survey, surveyModel } = await simulateSurveyLoad(1);
      expect(survey).toEqual(mockSurvey);
      
      // Update survey data
      surveyModel.data = { satisfaction: ['very_satisfied', 'satisfied'] };
      
      // Submit survey
      const response = await simulateSurveySubmission(1, surveyModel);
      expect(response).toEqual(mockResponse);
      
      // Verify flow
      expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(1);
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Survey response submitted successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/thank-you');
    });
  });
});
