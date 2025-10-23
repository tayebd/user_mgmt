'use client';

import { useCallback } from 'react';
import { useCRUD, UseCRUDOptions } from './useCRUD';
import { surveyService } from '@/services/survey-service';
import type { Survey, SurveyResponse, CreateSurveyParams } from '@/types';
import { SurveyStatus } from '@/types';

export interface UseSurveyReturn extends ReturnType<typeof useCRUD<Survey>> {
  // Survey-specific actions
  createResponse: (surveyId: number, responseJson: string, userId: number, companyId?: number) => Promise<SurveyResponse | null>;
  getResponses: (surveyId: number) => Promise<SurveyResponse[]>;
  updateResponse: (responseId: number, data: Partial<SurveyResponse>) => Promise<SurveyResponse | null>;
  deleteResponse: (responseId: number) => Promise<boolean>;

  // Survey lifecycle
  publish: (surveyId: number) => Promise<boolean>;
  archive: (surveyId: number) => Promise<boolean>;
  duplicate: (surveyId: number, newTitle?: string) => Promise<Survey | null>;

  // Analytics
  getSurveyStats: (surveyId: number) => Promise<{
    totalResponses: number;
    completedResponses: number;
    averageCompletionTime: number;
    responseRate: number;
  } | null>;
}

/**
 * Survey-specific CRUD hook with response management
 */
export function useSurvey(): UseSurveyReturn {
  // CRUD configuration for surveys
  const surveyCRUD = useCRUD<Survey>({
    create: async (data: Partial<Survey>) => {
      // Filter data to match CreateSurveyParams interface
      const filteredData: CreateSurveyParams = {
        title: data.title || '',
        description: data.description || '',
        active: data.active || false,
        userId: data.userId || 0,
        surveyJson: data.surveyJson || '',
        responseCount: data.responseCount || 0,
        targetResponses: data.targetResponses || 0,
      };

      const response = await surveyService.createSurvey(filteredData);
      return { data: response || undefined, error: undefined };
    },
    read: async (id?: string | number) => {
      if (id) {
        const survey = await surveyService.getSurveyById(Number(id));
        return { data: survey || undefined, error: undefined };
      } else {
        const surveys = await surveyService.getSurveys();
        return { data: surveys, error: undefined };
      }
    },
    update: async (id: string | number, data: Partial<Survey>) => {
      const response = await surveyService.updateSurvey(Number(id), data);
      return { data: response || undefined, error: undefined };
    },
    delete: async (id: string | number) => {
      const success = await surveyService.deleteSurvey(Number(id));
      return { data: undefined, error: success ? undefined : 'Failed to delete survey' };
    },

    // Success messages
    successMessages: {
      create: 'Survey created successfully',
      update: 'Survey updated successfully',
      delete: 'Survey deleted successfully',
    },

    // Error messages
    errorMessages: {
      create: 'Failed to create survey',
      update: 'Failed to update survey',
      delete: 'Failed to delete survey',
    },

    // Validation
    validateOnCreate: (data) => {
      if (!data.title) return 'Survey title is required';
      if (!data.description) return 'Survey description is required';
      if (!data.surveyJson) return 'Survey configuration is required';
      if (data.targetResponses && data.targetResponses < 1) return 'Target responses must be at least 1';
      return null;
    },

    validateOnUpdate: (data) => {
      if (!data.title) return 'Survey title is required';
      if (!data.description) return 'Survey description is required';
      if (!data.surveyJson) return 'Survey configuration is required';
      return null;
    },
  });

  // Response management functions
  const createResponse = useCallback(async (
    surveyId: number,
    responseJson: string,
    userId: number,
    companyId?: number
  ): Promise<SurveyResponse | null> => {
    try {
      const response = await surveyService.createSurveyResponse({
        surveyId,
        replyJson: responseJson,
        userId,
      });
      if (!response) {
        throw new Error('Failed to submit survey response');
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit survey response';
      surveyCRUD.setError(errorMessage);
      return null;
    }
  }, [surveyCRUD]);

  const getResponses = useCallback(async (surveyId: number): Promise<SurveyResponse[]> => {
    try {
      const responses = await surveyService.getSurveyResponses(surveyId);
      return responses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey responses';
      surveyCRUD.setError(errorMessage);
      return [];
    }
  }, [surveyCRUD]);

  const updateResponse = useCallback(async (responseId: number, data: Partial<SurveyResponse>): Promise<SurveyResponse | null> => {
    try {
      // Note: This would need to be implemented in the service
      throw new Error('Survey response update not yet implemented');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update survey response';
      surveyCRUD.setError(errorMessage);
      return null;
    }
  }, [surveyCRUD]);

  const deleteResponse = useCallback(async (responseId: number): Promise<boolean> => {
    try {
      // Note: This would need to be implemented in the service
      throw new Error('Survey response deletion not yet implemented');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete survey response';
      surveyCRUD.setError(errorMessage);
      return false;
    }
  }, [surveyCRUD]);

  // Survey lifecycle functions
  const publish = useCallback(async (surveyId: number): Promise<boolean> => {
    try {
      const result = await surveyService.publishSurvey(surveyId);
      if (!result) {
        throw new Error('Failed to publish survey');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish survey';
      surveyCRUD.setError(errorMessage);
      return false;
    }
  }, [surveyCRUD]);

  const archive = useCallback(async (surveyId: number): Promise<boolean> => {
    try {
      const result = await surveyService.updateSurvey(surveyId, { status: SurveyStatus.ARCHIVED });
      if (!result) {
        throw new Error('Failed to archive survey');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive survey';
      surveyCRUD.setError(errorMessage);
      return false;
    }
  }, [surveyCRUD]);

  const duplicate = useCallback(async (surveyId: number, newTitle?: string): Promise<Survey | null> => {
    try {
      const survey = await surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new Error('Failed to fetch survey for duplication');
      }

      const duplicateData: CreateSurveyParams = {
        title: newTitle || `${survey.title} (Copy)`,
        description: survey.description,
        active: survey.active || false,
        userId: survey.userId,
        surveyJson: survey.surveyJson,
        responseCount: survey.responseCount || 0,
        targetResponses: survey.targetResponses,
      };

      const response = await surveyService.createSurvey(duplicateData);
      if (!response) {
        throw new Error('Failed to duplicate survey');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate survey';
      surveyCRUD.setError(errorMessage);
      return null;
    }
  }, [surveyCRUD]);

  // Analytics function
  const getSurveyStats = useCallback(async (surveyId: number): Promise<{
    totalResponses: number;
    completedResponses: number;
    averageCompletionTime: number;
    responseRate: number;
  } | null> => {
    try {
      const responses = await getResponses(surveyId);
      const total = responses.length;
      const completed = responses.filter(r => r.processedMetrics).length;

      return {
        totalResponses: total,
        completedResponses: completed,
        averageCompletionTime: 0, // Would need timestamp data
        responseRate: total > 0 ? (completed / total) * 100 : 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey stats';
      surveyCRUD.setError(errorMessage);
      return null;
    }
  }, [getResponses, surveyCRUD]);

  return {
    // CRUD actions from base hook
    ...surveyCRUD,

    // Survey-specific actions
    createResponse,
    getResponses,
    updateResponse,
    deleteResponse,

    // Lifecycle
    publish,
    archive,
    duplicate,

    // Analytics
    getSurveyStats,
  };
}

export default useSurvey;