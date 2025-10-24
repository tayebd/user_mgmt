/**
 * Survey Store
 * Zustand store for survey-related state management
 * Extracted from the monolithic API store
 */

import { create } from 'zustand';
import { Survey, SurveyResponse, CreateSurveyParams } from '@/types';
import { surveyService, CreateSurveyResponseParams } from '@/services/survey-service';

export interface SurveyState {
  // State
  surveys: Survey[];
  currentSurvey: Survey | null;
  surveyResponses: SurveyResponse[];
  currentResponse: SurveyResponse | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalSurveys: number;

  // Filters
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive' | 'draft' | 'published' | 'archived';
  organizationFilter: number | null;
  userFilter: number | null;

  // Survey creation/editing state
  isEditing: boolean;
  draftSurvey: Partial<Survey> | null;
  validationErrors: string[];

  // Response submission state
  isSubmitting: boolean;
  submissionResult: { success: boolean; message: string } | null;

  // Actions
  fetchSurveys: () => Promise<void>;
  fetchSurveysByUserId: (userId: number) => Promise<void>;
  fetchSurveyById: (surveyId: number) => Promise<Survey | null>;
  createSurvey: (surveyData: CreateSurveyParams) => Promise<Survey | null>;
  updateSurvey: (surveyId: number, surveyData: Partial<Survey>) => Promise<Survey | null>;
  deleteSurvey: (surveyId: number) => Promise<boolean>;
  duplicateSurvey: (surveyId: number, newName?: string) => Promise<Survey | null>;

  // Response actions
  fetchSurveyResponses: (surveyId: number) => Promise<void>;
  createSurveyResponse: (params: CreateSurveyResponseParams) => Promise<SurveyResponse | null>;
  getSurveyResponse: (surveyId: number, responseId: number) => Promise<SurveyResponse | null>;

  // Survey management actions
  publishSurvey: (surveyId: number) => Promise<Survey | null>;
  unpublishSurvey: (surveyId: number) => Promise<Survey | null>;

  // Analytics actions
  getSurveyStats: (surveyId: number) => Promise<{
    totalResponses: number;
    completionRate: number;
    averageTime: number;
    lastResponseDate: string;
  }>;
  getSurveyAnalytics: (surveyId: number) => Promise<{
    responseTrends: Array<{ date: string; responses: number }>;
    questionAnalytics: Array<{
      questionId: string;
      questionText: string;
      responseDistribution: Record<string, number>;
      averageRating?: number;
    }>;
    demographicData?: Record<string, string | number | boolean>;
  }>;
  exportSurveyResponses: (surveyId: number, format?: 'csv' | 'json' | 'excel') => Promise<Blob | null>;

  // Editing actions
  startEditingSurvey: (survey?: Survey) => void;
  updateDraftSurvey: (updates: Partial<Survey>) => void;
  validateDraftSurvey: () => boolean;
  saveDraftSurvey: () => Promise<Survey | null>;
  cancelEditing: () => void;

  // Filter actions
  setFilters: (filters: { query?: string; status?: string; organization?: number | null; user?: number | null }) => void;
  setPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  clearSubmissionResult: () => void;
  reset: () => void;
}

const initialState = {
  surveys: [],
  currentSurvey: null,
  surveyResponses: [],
  currentResponse: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalSurveys: 0,
  searchQuery: '',
  statusFilter: 'all' as const,
  organizationFilter: null,
  userFilter: null,
  isEditing: false,
  draftSurvey: null,
  validationErrors: [],
  isSubmitting: false,
  submissionResult: null,
};

export const useSurveyStore = create<SurveyState>((set, get) => ({
  ...initialState,

  fetchSurveys: async () => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const surveys = await surveyService.getSurveys();

      set({
        surveys,
        isLoading: false,
        error: null,
      });

      console.log(`[Survey Store] Fetched ${surveys.length} surveys`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch surveys';
      setError(errorMessage);
      setLoading(false);
      console.error('[Survey Store] Failed to fetch surveys:', error);
    }
  },

  fetchSurveysByUserId: async (userId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const surveys = await surveyService.getSurveysByUserId(userId);

      set({
        surveys,
        userFilter: userId,
        isLoading: false,
        error: null,
      });

      console.log(`[Survey Store] Fetched ${surveys.length} surveys for user ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user surveys';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to fetch surveys for user ${userId}:`, error);
    }
  },

  fetchSurveyById: async (surveyId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const survey = await surveyService.getSurveyById(surveyId);

      if (survey) {
        set({
          currentSurvey: survey,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Fetched survey: ${survey.title}`);
      } else {
        setError('Survey not found');
        setLoading(false);
      }

      return survey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to fetch survey ${surveyId}:`, error);
      return null;
    }
  },

  createSurvey: async (surveyData: CreateSurveyParams) => {
    const { setLoading, setError, fetchSurveys } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = surveyService.validateSurveyData(surveyData);
      if (!validation.isValid) {
        set({ validationErrors: validation.errors });
        setLoading(false);
        return null;
      }

      const survey = await surveyService.createSurvey(surveyData);

      if (survey) {
        // Refresh the surveys list
        await fetchSurveys();
        set({
          currentSurvey: survey,
          isLoading: false,
          error: null,
          validationErrors: [],
        });
        console.log(`[Survey Store] Created survey: ${survey.title}`);
      }

      return survey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create survey';
      setError(errorMessage);
      setLoading(false);
      console.error('[Survey Store] Failed to create survey:', error);
      return null;
    }
  },

  updateSurvey: async (surveyId: number, surveyData: Partial<Survey>) => {
    const { setLoading, setError, fetchSurveys, currentSurvey } = get();

    try {
      setLoading(true);
      setError(null);

      const updatedSurvey = await surveyService.updateSurvey(surveyId, surveyData);

      if (updatedSurvey) {
        // Refresh the surveys list
        await fetchSurveys();
        set({
          currentSurvey: updatedSurvey,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Updated survey: ${updatedSurvey.title}`);
      }

      return updatedSurvey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to update survey ${surveyId}:`, error);
      return null;
    }
  },

  deleteSurvey: async (surveyId: number) => {
    const { setLoading, setError, fetchSurveys, currentSurvey } = get();

    try {
      setLoading(true);
      setError(null);

      const success = await surveyService.deleteSurvey(surveyId);

      if (success) {
        // Refresh the surveys list
        await fetchSurveys();

        // Clear current survey if it was the deleted one
        if (currentSurvey?.id === surveyId) {
          set({ currentSurvey: null });
        }

        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Deleted survey: ${surveyId}`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to delete survey ${surveyId}:`, error);
      return false;
    }
  },

  duplicateSurvey: async (surveyId: number, newName?: string) => {
    const { setLoading, setError, fetchSurveys } = get();

    try {
      setLoading(true);
      setError(null);

      const duplicatedSurvey = await surveyService.duplicateSurvey(surveyId, newName);

      if (duplicatedSurvey) {
        // Refresh the surveys list
        await fetchSurveys();
        set({
          currentSurvey: duplicatedSurvey,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Duplicated survey: ${duplicatedSurvey.title}`);
      }

      return duplicatedSurvey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to duplicate survey ${surveyId}:`, error);
      return null;
    }
  },

  fetchSurveyResponses: async (surveyId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const responses = await surveyService.getSurveyResponses(surveyId);

      set({
        surveyResponses: responses,
        isLoading: false,
        error: null,
      });

      console.log(`[Survey Store] Fetched ${responses.length} responses for survey ${surveyId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey responses';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to fetch responses for survey ${surveyId}:`, error);
    }
  },

  createSurveyResponse: async (params: CreateSurveyResponseParams) => {
    const { setSubmitting, setError, clearSubmissionResult } = get();

    try {
      setSubmitting(true);
      setError(null);
      clearSubmissionResult();

      // Validate response data
      const validation = surveyService.validateSurveyResponseData(params.replyJson);
      if (!validation.isValid) {
        set({ validationErrors: validation.errors });
        setSubmitting(false);
        return null;
      }

      const response = await surveyService.createSurveyResponse(params);

      if (response) {
        set({
          currentResponse: response,
          isSubmitting: false,
          error: null,
          validationErrors: [],
          submissionResult: { success: true, message: 'Survey response submitted successfully!' },
        });
        console.log(`[Survey Store] Created response for survey ${params.surveyId}`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit survey response';
      setError(errorMessage);
      set({
        isSubmitting: false,
        submissionResult: { success: false, message: errorMessage },
      });
      console.error(`[Survey Store] Failed to create response for survey ${params.surveyId}:`, error);
      return null;
    }
  },

  getSurveyResponse: async (surveyId: number, responseId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const response = await surveyService.getSurveyResponse(surveyId, responseId);

      if (response) {
        set({
          currentResponse: response,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Fetched response ${responseId} for survey ${surveyId}`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey response';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to fetch response ${responseId} for survey ${surveyId}:`, error);
      return null;
    }
  },

  publishSurvey: async (surveyId: number) => {
    const { setLoading, setError, fetchSurveys } = get();

    try {
      setLoading(true);
      setError(null);

      const survey = await surveyService.publishSurvey(surveyId);

      if (survey) {
        await fetchSurveys();
        set({
          currentSurvey: survey,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Published survey: ${survey.title}`);
      }

      return survey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to publish survey ${surveyId}:`, error);
      return null;
    }
  },

  unpublishSurvey: async (surveyId: number) => {
    const { setLoading, setError, fetchSurveys } = get();

    try {
      setLoading(true);
      setError(null);

      const survey = await surveyService.unpublishSurvey(surveyId);

      if (survey) {
        await fetchSurveys();
        set({
          currentSurvey: survey,
          isLoading: false,
          error: null,
        });
        console.log(`[Survey Store] Unpublished survey: ${survey.title}`);
      }

      return survey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish survey';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Survey Store] Failed to unpublish survey ${surveyId}:`, error);
      return null;
    }
  },

  getSurveyStats: async (surveyId: number) => {
    try {
      const stats = await surveyService.getSurveyStats(surveyId);
      console.log(`[Survey Store] Fetched stats for survey ${surveyId}:`, stats);

      if (!stats) {
        return {
          totalResponses: 0,
          completionRate: 0,
          averageTime: 0,
          lastResponseDate: '',
        };
      }

      // Transform SurveyStats to match expected interface
      return {
        totalResponses: stats.totalResponses,
        completionRate: stats.completionRate,
        averageTime: 0, // Not available in SurveyStats, using default
        lastResponseDate: stats.lastResponseDate || '',
      };
    } catch (error) {
      console.error(`[Survey Store] Failed to fetch stats for survey ${surveyId}:`, error);
      return {
        totalResponses: 0,
        completionRate: 0,
        averageTime: 0,
        lastResponseDate: '',
      };
    }
  },

  getSurveyAnalytics: async (surveyId: number) => {
    try {
      const analytics = await surveyService.getSurveyAnalytics(surveyId);
      console.log(`[Survey Store] Fetched analytics for survey ${surveyId}:`, analytics);

      // Transform Record<string, unknown> to match expected interface
      const transformedAnalytics = {
        responseTrends: (analytics?.responseTrends as Array<{ date: string; responses: number }>) || [],
        questionAnalytics: (analytics?.questionAnalytics as Array<{
          questionId: string;
          questionText: string;
          responseDistribution: Record<string, number>;
          averageRating?: number;
        }>) || [],
        demographicData: (analytics?.demographicData as Record<string, string | number | boolean>) || {},
      };

      return transformedAnalytics;
    } catch (error) {
      console.error(`[Survey Store] Failed to fetch analytics for survey ${surveyId}:`, error);
      return {
        responseTrends: [],
        questionAnalytics: [],
        demographicData: {},
      };
    }
  },

  exportSurveyResponses: async (surveyId: number, format = 'csv') => {
    try {
      const blob = await surveyService.exportSurveyResponses(surveyId, format);
      console.log(`[Survey Store] Exported responses for survey ${surveyId} as ${format}`);
      return blob;
    } catch (error) {
      console.error(`[Survey Store] Failed to export responses for survey ${surveyId}:`, error);
      return null;
    }
  },

  startEditingSurvey: (survey?: Survey) => {
    set({
      isEditing: true,
      draftSurvey: survey ? { ...survey } : {},
      validationErrors: [],
    });
  },

  updateDraftSurvey: (updates: Partial<Survey>) => {
    const { draftSurvey } = get();
    if (draftSurvey) {
      set({
        draftSurvey: { ...draftSurvey, ...updates },
      });
    }
  },

  validateDraftSurvey: () => {
    const { draftSurvey } = get();

    if (!draftSurvey) {
      set({ validationErrors: ['No survey data to validate'] });
      return false;
    }

    const validation = surveyService.validateSurveyData(draftSurvey as CreateSurveyParams);
    set({ validationErrors: validation.errors });
    return validation.isValid;
  },

  saveDraftSurvey: async () => {
    const { draftSurvey, currentSurvey, validateDraftSurvey } = get();

    if (!draftSurvey) {
      return null;
    }

    if (!validateDraftSurvey()) {
      return null;
    }

    if (currentSurvey?.id) {
      // Update existing survey
      return await get().updateSurvey(currentSurvey.id, draftSurvey);
    } else {
      // Create new survey
      return await get().createSurvey(draftSurvey as CreateSurveyParams);
    }
  },

  cancelEditing: () => {
    set({
      isEditing: false,
      draftSurvey: null,
      validationErrors: [],
    });
  },

  setFilters: (filters) => {
    const { searchQuery, statusFilter, organizationFilter, userFilter } = get();

    set({
      searchQuery: filters.query ?? searchQuery,
      statusFilter: (filters.status as 'draft' | 'published' | 'archived') ?? statusFilter,
      organizationFilter: filters.organization ?? organizationFilter,
      userFilter: filters.user ?? userFilter,
      currentPage: 1, // Reset to first page when filters change
    });
  },

  setPage: (page: number) => {
    set({ currentPage: page });
  },

  clearError: () => {
    set({ error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setSubmitting: (submitting: boolean) => {
    set({ isSubmitting: submitting });
  },

  clearSubmissionResult: () => {
    set({ submissionResult: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for easier access to specific state
export const useSurveys = () => useSurveyStore((state) => state.surveys);
export const useCurrentSurvey = () => useSurveyStore((state) => state.currentSurvey);
export const useSurveyResponses = () => useSurveyStore((state) => state.surveyResponses);
export const useSurveyLoading = () => useSurveyStore((state) => state.isLoading);
export const useSurveyError = () => useSurveyStore((state) => state.error);
export const useSurveyFilters = () => useSurveyStore((state) => ({
  searchQuery: state.searchQuery,
  statusFilter: state.statusFilter,
  organizationFilter: state.organizationFilter,
  userFilter: state.userFilter,
  currentPage: state.currentPage,
  totalPages: state.totalPages,
}));
export const useSurveyEditing = () => useSurveyStore((state) => ({
  isEditing: state.isEditing,
  draftSurvey: state.draftSurvey,
  validationErrors: state.validationErrors,
}));