/**
 * Survey Service Tests
 * Tests for survey API operations and data handling
 */

import { surveyService, type CreateSurveyResponseParams, type SurveyResponse } from '../survey-service';

// Mock the API client
jest.mock('../api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = require('../api-client');

describe('SurveyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSurveys', () => {
    it('should fetch all surveys successfully', async () => {
      const mockSurveys = [
        { id: 1, title: 'Test Survey', description: 'A test survey', active: true },
        { id: 2, title: 'Another Survey', description: 'Another test survey', active: false }
      ];

      mockApiClient.api.get.mockResolvedValue({ data: mockSurveys });

      const result = await surveyService.getAllSurveys();

      expect(mockApiClient.api.get).toHaveBeenCalledWith('/api/surveys');
      expect(result).toEqual(mockSurveys);
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.api.get.mockRejectedValue(new Error('Network error'));

      await expect(surveyService.getAllSurveys()).rejects.toThrow('Network error');
    });

    it('should handle empty response', async () => {
      mockApiClient.api.get.mockResolvedValue({ data: [] });

      const result = await surveyService.getAllSurveys();

      expect(result).toEqual([]);
    });
  });

  describe('getSurveyById', () => {
    it('should fetch a specific survey by ID', async () => {
      const mockSurvey = {
        id: 1,
        title: 'Test Survey',
        description: 'A test survey',
        active: true,
        surveyJson: '{"pages": [{"elements": []}]}'
      };

      mockApiClient.api.get.mockResolvedValue({ data: mockSurvey });

      const result = await surveyService.getSurveyById(1);

      expect(mockApiClient.api.get).toHaveBeenCalledWith('/api/surveys/1');
      expect(result).toEqual(mockSurvey);
    });

    it('should handle not found error', async () => {
      mockApiClient.api.get.mockRejectedValue(new Error('Survey not found'));

      await expect(surveyService.getSurveyById(999)).rejects.toThrow('Survey not found');
    });
  });

  describe('createSurvey', () => {
    const mockSurveyData = {
      title: 'New Survey',
      description: 'A new test survey',
      surveyJson: '{"pages": [{"elements": [{"type": "text", "name": "question1"}]}]}',
      active: false,
      responseCount: 0,
      targetResponses: 10
    };

    it('should create a new survey successfully', async () => {
      const createdSurvey = {
        id: 3,
        ...mockSurveyData,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockApiClient.api.post.mockResolvedValue({ data: createdSurvey });

      const result = await surveyService.createSurvey(mockSurveyData, 1);

      expect(mockApiClient.api.post).toHaveBeenCalledWith('/api/surveys', {
        ...mockSurveyData,
        userId: 1
      });
      expect(result).toEqual(createdSurvey);
    });

    it('should validate survey JSON before sending', async () => {
      const invalidData = {
        ...mockSurveyData,
        surveyJson: 'invalid json'
      };

      await expect(surveyService.createSurvey(invalidData, 1)).rejects.toThrow();
    });

    it('should handle validation errors gracefully', async () => {
      const incompleteData = {
        title: '',
        description: 'Survey without title'
      };

      await expect(surveyService.createSurvey(incompleteData, 1)).rejects.toThrow();
    });
  });

  describe('updateSurvey', () => {
    const mockUpdateData = {
      title: 'Updated Survey',
      description: 'Updated description'
    };

    it('should update an existing survey', async () => {
      const updatedSurvey = {
        id: 1,
        ...mockUpdateData,
        surveyJson: '{"pages": [{"elements": [{"type": "text", "name": "question1"}]}]}',
        active: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockApiClient.api.put.mockResolvedValue({ data: updatedSurvey });

      const result = await surveyService.updateSurvey(1, mockUpdateData);

      expect(mockApiClient.api.put).toHaveBeenCalledWith('/api/surveys/1', mockUpdateData);
      expect(result).toEqual(updatedSurvey);
    });

    it('should handle not found error', async () => {
      mockApiClient.api.put.mockRejectedValue(new Error('Survey not found'));

      await expect(surveyService.updateSurvey(999, mockUpdateData)).rejects.toThrow('Survey not found');
    });
  });

  describe('deleteSurvey', () => {
    it('should delete a survey successfully', async () => {
      mockApiClient.api.delete.mockResolvedValue({ data: { success: true } });

      const result = await surveyService.deleteSurvey(1);

      expect(mockApiClient.api.delete).toHaveBeenCalledWith('/api/surveys/1');
      expect(result).toEqual({ success: true });
    });

    it('should handle not found error', async () => {
      mockApiClient.api.delete.mockRejectedValue(new Error('Survey not found'));

      await expect(surveyService.deleteSurvey(999)).rejects.toThrow('Survey not found');
    });
  });

  describe('createSurveyResponse', () => {
    const mockResponseData: CreateSurveyResponseParams = {
      surveyId: 1,
      responses: [
        {
          question1: 'Answer 1',
          question2: 'Answer 2'
        }
      ]
    };

    it('should create a survey response successfully', async () => {
      const createdResponse = {
        id: 1,
        surveyId: 1,
        responses: mockResponseData.responses,
        submittedAt: new Date(),
        userId: 1
      };

      mockApiClient.api.post.mockResolvedValue({ data: createdResponse });

      const result = await surveyService.createSurveyResponse(mockResponseData, 1);

      expect(mockApiClient.api.post).toHaveBeenCalledWith('/api/surveys/1/responses', {
        surveyId: 1,
        responses: mockResponseData.responses,
        userId: 1
      });
      expect(result).toEqual(createdResponse);
    });

    it('should validate response data structure', async () => {
      const invalidResponseData = {
        surveyId: 1,
        responses: null
      };

      await expect(surveyService.createSurveyResponse(invalidResponseData, 1)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        responses: [
          { question1: 'Answer 1' }
          // Missing surveyId
        ]
      };

      await expect(surveyService.createSurveyResponse(incompleteData, 1)).rejects.toThrow();
    });
  });

  describe('getSurveyResponses', () => {
    it('should fetch all responses for a survey', async () => {
      const mockResponses = [
        {
          id: 1,
          surveyId: 1,
          responses: { question1: 'Answer 1', question2: 'Answer 2' },
          submittedAt: new Date(),
          userId: 1
        },
        {
          id: 2,
          surveyId: 1,
          responses: { question1: 'Answer A', question2: 'Answer B' },
          submittedAt: new Date(),
          userId: 2
        }
      ];

      mockApiClient.api.get.mockResolvedValue({ data: mockResponses });

      const result = await surveyService.getSurveyResponses(1);

      expect(mockApiClient.api.get).toHaveBeenCalledWith('/api/surveys/1/responses');
      expect(result).toEqual(mockResponses);
    });

    it('should handle empty responses list', async () => {
      mockApiClient.api.get.mockResolvedValue({ data: [] });

      const result = await surveyService.getSurveyResponses(1);

      expect(result).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const promises = Array.from({ length: 10 }, (_, index) =>
        surveyService.getSurveyById(index + 1)
      );

      mockApiClient.api.mockImplementation((url) => {
        return Promise.resolve({ data: { id: parseInt(url.split('/').pop() || '1') } });
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every(result => result.id !== undefined)).toBe(true);
    });

    it('should complete operations within reasonable time limits', async () => {
      const startTime = performance.now();

      // Run 20 operations
      for (let i = 0; i < 20; i++) {
        await surveyService.getAllSurveys();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete 20 operations in under 5 seconds
    });
  });

  describe('Data Validation', () => {
    it('should validate JSON structure before sending', async () => {
      const validJson = '{"pages": [{"elements": [{"type": "text", "name": "question1"}]}]}';
      const invalidJson = 'not a valid json';

      const validData = { ...mockSurveyData, surveyJson: validJson };
      const invalidData = { ...mockSurveyData, surveyJson: invalidJson };

      mockApiClient.api.post.mockResolvedValue({ data: { id: 1 } });

      await expect(surveyService.createSurvey(validData, 1)).resolves.toBeDefined();
      await expect(surveyService.createSurvey(invalidData, 1)).rejects.toThrow();
    });

    it('should handle large survey data without issues', async () => {
      const largeJson = JSON.stringify({
        pages: Array.from({ length: 50 }, (_, i) => ({
          elements: Array.from({ length: 10 }, (_, j) => ({
            type: 'text',
            name: `question_${i}_${j}`,
            title: `Question ${i}-${j}`
          }))
        }))
      });

      const largeData = { ...mockSurveyData, surveyJson: largeJson };

      mockApiClient.api.post.mockResolvedValue({ data: { id: 1 } });

      const result = await surveyService.createSurvey(largeData, 1);

      expect(result.id).toBe(1);
    });
  });
});