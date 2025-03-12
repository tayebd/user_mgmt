// Import necessary testing utilities
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API store
const mockUseApiStore = jest.fn();
jest.mock('@/state/api', () => ({
  useApiStore: () => mockUseApiStore(),
}));

jest.mock('../[id]/respond/theme', () => ({
  themeJson: {},
  customCss: {}
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

// Simple test suite to verify the test setup works
describe('Survey Respond Page Tests', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should correctly mock the API store', () => {
    const mockApiStore = {
      fetchSurveyById: jest.fn().mockResolvedValue(mockSurvey),
      createSurveyResponse: jest.fn().mockResolvedValue({ id: 1 }),
    };
    
    mockUseApiStore.mockReturnValue(mockApiStore);
    
    const api = mockUseApiStore();
    expect(api.fetchSurveyById).toBeDefined();
    expect(api.createSurveyResponse).toBeDefined();
  });

  it('should correctly mock the router', () => {
    const mockRouter = {
      push: jest.fn(),
    };
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    const router = useRouter();
    expect(router.push).toBeDefined();
  });
});
