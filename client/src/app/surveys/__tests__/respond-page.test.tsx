/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Model } from 'survey-core';
import * as apiStore from '@/state/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import the actual component after mocks are set up
const RespondPage = require('../[id]/respond/page').default;

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

describe('RespondPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockApiStore = {
    fetchSurveyById: jest.fn(),
    createSurveyResponse: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.spyOn(apiStore, 'useApiStore').mockImplementation(() => mockApiStore);
  });

  it('loads and displays the survey correctly', async () => {
    mockApiStore.fetchSurveyById.mockResolvedValueOnce(mockSurvey);

    render(<RespondPage params={Promise.resolve({ id: '1' })} />);

    // Wait for survey to load
    await waitFor(() => {
      expect(screen.getByText('Test Survey')).toBeInTheDocument();
    });

    // Check if all choices are rendered
    expect(screen.getByText('Very Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Dissatisfied')).toBeInTheDocument();
    expect(screen.getByText('Very Dissatisfied')).toBeInTheDocument();
  });

  it('handles survey submission correctly', async () => {
    mockApiStore.fetchSurveyById.mockResolvedValueOnce(mockSurvey);
    mockApiStore.createSurveyResponse.mockResolvedValueOnce(mockResponse);

    render(<RespondPage params={Promise.resolve({ id: '1' })} />);

    // Wait for survey to load
    await waitFor(() => {
      expect(screen.getByText('Test Survey')).toBeInTheDocument();
    });

    // Select multiple options
    const verySatisfied = screen.getByLabelText('Very Satisfied');
    const satisfied = screen.getByLabelText('Satisfied');
    
    fireEvent.click(verySatisfied);
    fireEvent.click(satisfied);

    // Find and click the complete button
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    // Verify API call and navigation
    await waitFor(() => {
      expect(mockApiStore.createSurveyResponse).toHaveBeenCalledWith(
        1,
        expect.any(String),
        1
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/thank-you');
      expect(toast.success).toHaveBeenCalledWith('Survey response submitted successfully');
    });
  });

  it('handles survey loading error', async () => {
    const error = new Error('Failed to load survey');
    mockApiStore.fetchSurveyById.mockRejectedValueOnce(error);

    render(<RespondPage params={Promise.resolve({ id: '1' })} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load survey')).toBeInTheDocument();
    });
  });

  it('handles invalid survey ID', async () => {
    render(<RespondPage params={Promise.resolve({ id: 'invalid' })} />);

    await waitFor(() => {
      expect(screen.getByText('Invalid survey ID: invalid')).toBeInTheDocument();
    });
  });

  it('handles submission error gracefully', async () => {
    mockApiStore.fetchSurveyById.mockResolvedValueOnce(mockSurvey);
    mockApiStore.createSurveyResponse.mockRejectedValueOnce(new Error('Submission failed'));

    render(<RespondPage params={Promise.resolve({ id: '1' })} />);

    // Wait for survey to load
    await waitFor(() => {
      expect(screen.getByText('Test Survey')).toBeInTheDocument();
    });

    // Select an option and submit
    const verySatisfied = screen.getByLabelText('Very Satisfied');
    fireEvent.click(verySatisfied);

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Submission failed');
    });
  });
});
