/**
 * Survey Service
 * Handles all survey-related API operations
 * Extracted from the monolithic API store
 */

import { apiClient, ApiResponse } from './api-client';
import { Survey, SurveyResponse, CreateSurveyParams } from '@/types';

export interface CreateSurveyResponseParams {
  surveyId: number;
  replyJson: string;
  userId?: number;
}

export interface SurveyStats {
  totalResponses: number;
  averageScore?: number;
  completionRate: number;
  lastResponseDate?: string;
}

/**
 * Survey Service Class
 * Provides methods for survey CRUD operations and response management
 */
export class SurveyService {
  /**
   * Fetch all surveys
   */
  async getSurveys(): Promise<Survey[]> {
    const response = await apiClient.get<Survey[]>('/surveys');

    if (!response.ok || !response.data) {
      console.error('[Survey Service] Failed to fetch surveys:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch surveys by user ID
   */
  async getSurveysByUserId(userId: number): Promise<Survey[]> {
    const response = await apiClient.get<Survey[]>(`/surveys?userId=${userId}`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch surveys for user ${userId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single survey by ID
   */
  async getSurveyById(surveyId: number): Promise<Survey | null> {
    const response = await apiClient.get<Survey>(`/surveys/${surveyId}`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch survey ${surveyId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Create a new survey
   */
  async createSurvey(surveyData: CreateSurveyParams): Promise<Survey | null> {
    const response = await apiClient.post<Survey>('/surveys', surveyData, true);

    if (!response.ok || !response.data) {
      console.error('[Survey Service] Failed to create survey:', response.error);
      return null;
    }

    console.log('[Survey Service] Survey created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing survey
   */
  async updateSurvey(surveyId: number, surveyData: Partial<Survey>): Promise<Survey | null> {
    const response = await apiClient.put<Survey>(`/surveys/${surveyId}`, surveyData, true);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to update survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Survey ${surveyId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a survey
   */
  async deleteSurvey(surveyId: number): Promise<boolean> {
    const response = await apiClient.delete(`/surveys/${surveyId}`, true);

    if (!response.ok) {
      console.error(`[Survey Service] Failed to delete survey ${surveyId}:`, response.error);
      return false;
    }

    console.log(`[Survey Service] Survey ${surveyId} deleted successfully`);
    return true;
  }

  /**
   * Fetch all responses for a survey
   */
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    const response = await apiClient.get<SurveyResponse[]>(`/surveys/${surveyId}/surveyResponses`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch responses for survey ${surveyId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Create a survey response
   */
  async createSurveyResponse(params: CreateSurveyResponseParams): Promise<SurveyResponse | null> {
    const { surveyId, replyJson, userId } = params;

    const response = await apiClient.post<SurveyResponse>(
      `/surveys/${surveyId}/surveyResponses`,
      {
        responseJson: replyJson,
        userId,
      },
      true
    );

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to create response for survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Response created for survey ${surveyId}:`, response.data);
    return response.data;
  }

  /**
   * Get a specific survey response
   */
  async getSurveyResponse(surveyId: number, responseId: number): Promise<SurveyResponse | null> {
    const response = await apiClient.get<SurveyResponse>(`/surveys/surveyResponses/${responseId}`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch response ${responseId} for survey ${surveyId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Update a survey response
   */
  async updateSurveyResponse(surveyId: number, responseId: number, responseData: Partial<SurveyResponse>): Promise<SurveyResponse | null> {
    const response = await apiClient.put<SurveyResponse>(
      `/surveys/surveyResponses/${responseId}`,
      responseData,
      true
    );

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to update response ${responseId} for survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Response ${responseId} updated for survey ${surveyId}:`, response.data);
    return response.data;
  }

  /**
   * Delete a survey response
   */
  async deleteSurveyResponse(surveyId: number, responseId: number): Promise<boolean> {
    const response = await apiClient.delete(`/surveys/surveyResponses/${responseId}`, true);

    if (!response.ok) {
      console.error(`[Survey Service] Failed to delete response ${responseId} for survey ${surveyId}:`, response.error);
      return false;
    }

    console.log(`[Survey Service] Response ${responseId} deleted for survey ${surveyId}`);
    return true;
  }

  /**
   * Get survey statistics
   */
  async getSurveyStats(surveyId: number): Promise<SurveyStats | null> {
    const response = await apiClient.get(`/surveys/${surveyId}/stats`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch stats for survey ${surveyId}:`, response.error);
      return null;
    }

    return response.data as SurveyStats;
  }

  /**
   * Get survey analytics with processed metrics
   */
  async getSurveyAnalytics(surveyId: number): Promise<Record<string, unknown> | null> {
    const response = await apiClient.get(`/surveys/${surveyId}/analytics`);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to fetch analytics for survey ${surveyId}:`, response.error);
      return null;
    }

    return response.data as Record<string, unknown>;
  }

  /**
   * Export survey responses to different formats
   */
  async exportSurveyResponses(surveyId: number, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<Blob | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${surveyId}/export?format=${format}`, {
        method: 'GET',
        credentials: 'include',
        headers: await apiClient.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`[Survey Service] Failed to export responses for survey ${surveyId}:`, response.statusText);
        return null;
      }

      const blob = await response.blob();
      console.log(`[Survey Service] Survey ${surveyId} exported successfully as ${format}`);
      return blob;
    } catch (error) {
      console.error(`[Survey Service] Export error for survey ${surveyId}:`, error);
      return null;
    }
  }

  /**
   * Duplicate a survey
   */
  async duplicateSurvey(surveyId: number, newName?: string): Promise<Survey | null> {
    const response = await apiClient.post<Survey>(
      `/surveys/${surveyId}/duplicate`,
      { newName },
      true
    );

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to duplicate survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Survey ${surveyId} duplicated successfully:`, response.data);
    return response.data;
  }

  /**
   * Publish a survey (make it active)
   */
  async publishSurvey(surveyId: number): Promise<Survey | null> {
    const response = await apiClient.post<Survey>(`/surveys/${surveyId}/publish`, {}, true);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to publish survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Survey ${surveyId} published successfully:`, response.data);
    return response.data;
  }

  /**
   * Unpublish a survey (make it inactive)
   */
  async unpublishSurvey(surveyId: number): Promise<Survey | null> {
    const response = await apiClient.post<Survey>(`/surveys/${surveyId}/unpublish`, {}, true);

    if (!response.ok || !response.data) {
      console.error(`[Survey Service] Failed to unpublish survey ${surveyId}:`, response.error);
      return null;
    }

    console.log(`[Survey Service] Survey ${surveyId} unpublished successfully:`, response.data);
    return response.data;
  }

  /**
   * Validate survey data
   */
  validateSurveyData(data: CreateSurveyParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Survey title is required');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Survey title must be less than 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Survey description must be less than 2000 characters');
    }

    if (!data.surveyJson) {
      errors.push('Survey questions are required');
    } else {
      try {
        const questions = JSON.parse(data.surveyJson);
        if (!Array.isArray(questions) || questions.length === 0) {
          errors.push('Survey must contain at least one question');
        }
      } catch {
        errors.push('Invalid survey questions format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate survey response data
   */
  validateSurveyResponseData(replyJson: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!replyJson) {
      errors.push('Response data is required');
      return { isValid: false, errors };
    }

    try {
      const response = JSON.parse(replyJson);

      if (!response || typeof response !== 'object') {
        errors.push('Response must be a valid object');
        return { isValid: false, errors };
      }

      // Additional validation can be added here based on survey requirements
      if (Object.keys(response).length === 0) {
        errors.push('Response must contain at least one answer');
      }

    } catch {
      errors.push('Invalid response data format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate survey completion percentage
   */
  calculateCompletionRate(survey: Survey, responses: SurveyResponse[]): number {
    if (!survey.surveyJson || responses.length === 0) {
      return 0;
    }

    try {
      const questions = JSON.parse(survey.surveyJson);
      const totalQuestions = Array.isArray(questions) ? questions.length : 0;

      if (totalQuestions === 0) {
        return 0;
      }

      const completedResponses = responses.filter(response => {
        try {
          const answers = JSON.parse(response.responseJson);
          const answeredQuestions = Object.keys(answers).length;
          return answeredQuestions >= totalQuestions * 0.8; // Consider 80% completion as complete
        } catch {
          return false;
        }
      });

      return Math.round((completedResponses.length / responses.length) * 100);
    } catch {
      return 0;
    }
  }
}

// Create singleton instance
export const surveyService = new SurveyService();