import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/utils/error-handling';

// Import shared types from server
import type { Survey, SurveyResponse, CreateSurveyParams } from '@/types';
import { SurveyMetricService } from '@/services/surveyMetricService';

interface SurveyState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  surveyResponses: SurveyResponse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSurveys: () => Promise<void>;
  fetchSurveyById: (surveyId: number) => Promise<Survey>;
  createSurvey: (survey: CreateSurveyParams) => Promise<Survey>;
  updateSurvey: (surveyId: number, survey: Partial<Survey>) => Promise<void>;
  createSurveyResponse: (
    surveyId: number,
    responseJson: string,
    userId: number,
    authToken?: string
  ) => Promise<SurveyResponse>;
  fetchSurveyResponses: (surveyId: number) => Promise<SurveyResponse[]>;
  clearError: () => void;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  currentSurvey: null,
  surveyResponses: [],
  isLoading: false,
  error: null,

  fetchSurveys: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getSurveys();
      if (Array.isArray(response.data)) {
        set({ surveys: response.data as Survey[], isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch surveys');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSurveyById: async (surveyId: number): Promise<Survey> => {
    try {
      const response = await apiClient.getSurveyById(surveyId);

      if (!response.data || !(response.data as Survey).id) {
        throw new Error('Invalid survey data received');
      }

      set({ currentSurvey: response.data as Survey });
      return response.data as Survey;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch survey');
      throw new Error(errorMessage);
    }
  },

  createSurvey: async (surveyData: CreateSurveyParams): Promise<Survey> => {
    try {
      const response = await apiClient.createSurvey(surveyData);

      if (!response.data || !(response.data as Survey).id) {
        throw new Error('Invalid survey data received from server');
      }

      // Update store
      const { surveys } = get();
      set({ surveys: [...surveys, response.data as Survey] });

      return response.data as Survey;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create survey');
      throw new Error(errorMessage);
    }
  },

  updateSurvey: async (surveyId: number, surveyData: Partial<Survey>): Promise<void> => {
    try {
      const response = await apiClient.put(`/surveys/${surveyId}`, surveyData);

      if (!response.data) {
        throw new Error('Failed to update survey');
      }

      // Update store
      const { surveys } = get();
      set({
        surveys: surveys.map(s => s.id === surveyId ? response.data as Survey : s),
        currentSurvey: response.data as Survey,
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update survey');
      throw new Error(errorMessage);
    }
  },

  createSurveyResponse: async (
    surveyId: number,
    responseJson: string,
    userId: number,
    authToken?: string
  ): Promise<SurveyResponse> => {
    try {
      // Validate input parameters
      if (!surveyId || !responseJson) {
        throw new Error('Missing required parameters for survey response');
      }

      // Validate JSON format
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseJson);
        if (!parsedResponse || typeof parsedResponse !== 'object') {
          throw new Error('Invalid response data format');
        }
      } catch (jsonError) {
        throw new Error('Invalid survey response format');
      }

      // Ensure organizationId exists in the parsed response
      const organizationId = parsedResponse.organizationId || 1;

      // Process metrics from survey response
      const processedResponse = SurveyMetricService.processSurveyResponse({
        id: 0, // Temporary ID
        surveyId,
        responseJson,
        organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10),
        userId,
      });

      const requestBody = {
        userId,
        organizationId: typeof organizationId === 'number' ? organizationId : parseInt(String(organizationId), 10),
        responseJson: typeof responseJson === 'string' ? responseJson : JSON.stringify(responseJson),
        processedMetrics: processedResponse.processedMetrics,
      };

      const response = await apiClient.createSurveyResponse(surveyId, requestBody, authToken);

      if (!response.data) {
        throw new Error('No response data received');
      }

      // Ensure the returned data has a organizationId
      const surveyResponse = response.data as SurveyResponse;
      if (!surveyResponse.organizationId && surveyResponse.organizationId !== 0) {
        surveyResponse.organizationId = parsedResponse.organizationId || 263;
      }

      return surveyResponse;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create survey response');
      throw new Error(errorMessage);
    }
  },

  fetchSurveyResponses: async (surveyId: number): Promise<SurveyResponse[]> => {
    try {
      // Validate survey ID
      if (!surveyId || isNaN(surveyId) || surveyId <= 0) {
        throw new Error('Invalid survey ID');
      }

      const response = await apiClient.get(`/surveys/${surveyId}/surveyResponses`);

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array of survey responses');
      }

      // Validate response data structure
      response.data.forEach((response, index) => {
        if (!response.id || !response.responseJson) {
          console.warn(`Invalid response data at index ${index}:`, response);
        }
      });

      set({ surveyResponses: response.data as SurveyResponse[] });
      return response.data as SurveyResponse[];
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch survey responses');
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));