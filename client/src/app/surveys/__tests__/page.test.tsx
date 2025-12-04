import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SurveysPage from '../page';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/state/api';
import { SurveyStatus } from '@/types';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    signOut: jest.fn(),
    isLoading: false,
  }),
}));

// Mock the userAuth hook
jest.mock('@/app/surveys/utils/userAuth', () => ({
  useUserAuth: () => ({
    currentUserId: 'test-user',
    isLoading: false,
  }),
}));
// Using Jest globals from the environment instead of importing from @jest/globals

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/surveys'),
}));

// Mock the state/api module
jest.mock('@/state/api', () => ({
  useApiStore: jest.fn(),
}));

describe('SurveysPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockSurveys = [
    {
      id: '1',
      title: 'Customer Satisfaction Survey',
      status: SurveyStatus.PUBLISHED,
      responses: [{ id: 'r1' }, { id: 'r2' }],
      createdAt: '2025-03-01T12:00:00Z',
    },
    {
      id: '2',
      title: 'Employee Feedback Survey',
      status: SurveyStatus.PUBLISHED,
      responses: [],
      createdAt: '2025-03-05T14:30:00Z',
    },
  ];

  const mockFetchSurveysByUserId = jest.fn().mockResolvedValue(mockSurveys);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Cast to unknown first to avoid type errors
    (useApiStore as unknown as jest.Mock).mockReturnValue({
      surveys: mockSurveys,
      fetchSurveysByUserId: mockFetchSurveysByUserId,
    });
  });

  test('renders the surveys page with correct title', () => {
    render(
      <AuthProvider>
        <SurveysPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: 'Surveys' })).toBeInTheDocument();
    expect(screen.getByText('Create and manage your surveys')).toBeInTheDocument();
  });

  test('renders the surveys table with correct headers', () => {
    render(
      <AuthProvider>
        <SurveysPage />
      </AuthProvider>
    );

    expect(screen.getByText('All Surveys')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Responses')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('displays the correct number of surveys', () => {
    render(<SurveysPage />);
    
    expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
    expect(screen.getByText('Employee Feedback Survey')).toBeInTheDocument();
  });

  test('displays the correct status for each survey', () => {
    render(<SurveysPage />);
    
    const activeStatuses = screen.getAllByText('Active');
    const inactiveStatuses = screen.getAllByText('Inactive');
    
    expect(activeStatuses).toHaveLength(1);
    expect(inactiveStatuses).toHaveLength(1);
  });

  test('displays the correct number of responses for each survey', () => {
    render(<SurveysPage />);
    
    // The first survey has 2 responses
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('2'); // First survey row (index 1 because of header row)
    expect(rows[2]).toHaveTextContent('0'); // Second survey row
  });

  test('calls fetchSurveysByUserId on component mount', async () => {
    render(<SurveysPage />);
    
    await waitFor(() => {
      expect(mockFetchSurveysByUserId).toHaveBeenCalledWith(11);
    });
  });

  test('navigates to create survey page when Create Survey button is clicked', () => {
    render(<SurveysPage />);
    
    const createButton = screen.getByText('Create Survey');
    fireEvent.click(createButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/surveys/create');
  });

  test('navigates to upload survey page when Upload Survey button is clicked', () => {
    render(<SurveysPage />);
    
    const uploadButton = screen.getByText('Upload Survey');
    fireEvent.click(uploadButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/surveys/upload');
  });

  test('navigates to survey view page when View button is clicked', () => {
    render(<SurveysPage />);
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]); // Click the first View button
    
    expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1');
  });

  test('navigates to survey edit page when Edit button is clicked', () => {
    render(<SurveysPage />);
    
    const editButtons = screen.getAllByRole('button', { name: '' }); // Edit buttons have no text, only an icon
    // Find the edit button for the first survey
    const editButton = editButtons.find(button => 
      button.closest('tr')?.textContent?.includes('Customer Satisfaction Survey')
    );
    
    if (editButton) {
      fireEvent.click(editButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/edit');
    } else {
      throw new Error('Edit button not found');
    }
  });

  test('navigates to survey report page when Report button is clicked', () => {
    render(<SurveysPage />);
    
    const reportButtons = screen.getAllByText('Report');
    fireEvent.click(reportButtons[0]); // Click the first Report button
    
    expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/report');
  });

  test('navigates to survey respond page when Take button is clicked', () => {
    render(<SurveysPage />);
    
    const takeButtons = screen.getAllByText('Take');
    fireEvent.click(takeButtons[0]); // Click the first Take button
    
    expect(mockRouter.push).toHaveBeenCalledWith('/surveys/1/respond/');
  });

  test('handles error when fetching surveys fails', async () => {
    // Mock console.error to prevent actual console output during test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock the API to throw an error
    const mockError = new Error('Failed to fetch surveys');
    (useApiStore as unknown as jest.Mock).mockReturnValue({
      surveys: [],
      fetchSurveysByUserId: jest.fn().mockRejectedValue(mockError),
    });
    
    render(<SurveysPage />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching surveys:', mockError);
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles empty surveys array', () => {
    (useApiStore as unknown as jest.Mock).mockReturnValue({
      surveys: [],
      fetchSurveysByUserId: mockFetchSurveysByUserId,
    });
    
    render(<SurveysPage />);
    
    expect(screen.getByText('A list of your surveys')).toBeInTheDocument();
    // No survey rows should be rendered
    expect(screen.queryByText('Customer Satisfaction Survey')).not.toBeInTheDocument();
  });

  test('handles non-array surveys data', async () => {
    // Mock console.error to prevent actual console output during test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock the API to return non-array data
    (useApiStore as unknown as jest.Mock).mockReturnValue({
      surveys: null,
      fetchSurveysByUserId: jest.fn().mockResolvedValue(null),
    });
    
    render(<SurveysPage />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Invalid surveys data:', null);
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
