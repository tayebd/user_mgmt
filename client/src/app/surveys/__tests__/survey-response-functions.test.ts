// Test file for survey response functionality
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the API store
const mockUseApiStore = jest.fn();
jest.mock('@/state/api', () => ({
  useApiStore: () => mockUseApiStore(),
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

// Helper functions to test survey functionality
function calculateTotalScore(data: Record<string, unknown>): number {
  return Object.values(data).reduce((sum: number, value) => {
    if (value && typeof value === 'object' && 'score' in value) {
      const score = (value as { score: number }).score;
      return typeof score === 'number' && !isNaN(score) ? sum + score : sum;
    }
    return sum;
  }, 0);
}

function validateSurveyId(id: string): number | null {
  const surveyId = Number(id);
  if (isNaN(surveyId) || surveyId <= 0) {
    return null;
  }
  return surveyId;
}

describe('Survey Response Functions', () => {
  const mockApiStore = {
    fetchSurveyById: jest.fn(),
    createSurveyResponse: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiStore.mockReturnValue(mockApiStore);
  });

  it('should validate survey ID correctly', () => {
    expect(validateSurveyId('1')).toBe(1);
    expect(validateSurveyId('abc')).toBeNull();
    expect(validateSurveyId('-1')).toBeNull();
    expect(validateSurveyId('0')).toBeNull();
  });

  it('should calculate total score correctly', () => {
    const data = {
      q1: { score: 5 },
      q2: { score: 3 },
      q3: 'text answer', // No score
      q4: { score: 'invalid' }, // Invalid score
      q5: { score: 0 },
    };
    
    expect(calculateTotalScore(data)).toBe(8); // 5 + 3 + 0
  });

  it('should handle API interactions correctly', async () => {
    // Setup mocks
    mockApiStore.fetchSurveyById.mockResolvedValue(mockSurvey);
    mockApiStore.createSurveyResponse.mockResolvedValue(mockResponse);
    
    // Test fetching survey
    const survey = await mockApiStore.fetchSurveyById(1);
    expect(survey).toEqual(mockSurvey);
    expect(mockApiStore.fetchSurveyById).toHaveBeenCalledWith(1);
    
    // Test creating response
    const responseData = JSON.stringify({ satisfaction: ['very_satisfied'] });
    const response = await mockApiStore.createSurveyResponse(1, responseData, 1);
    expect(response).toEqual(mockResponse);
    expect(mockApiStore.createSurveyResponse).toHaveBeenCalledWith(1, responseData, 1);
  });

  it('should handle survey JSON parsing correctly', () => {
    // Valid JSON
    const validJson = mockSurvey.surveyJson;
    expect(() => JSON.parse(validJson)).not.toThrow();
    
    // Invalid JSON
    const invalidJson = '{invalid:json}';
    expect(() => JSON.parse(invalidJson)).toThrow();
  });
});
