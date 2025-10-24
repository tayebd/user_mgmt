import { Model } from 'survey-core';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSurveyStore } from '@/state';

interface SurveyResponseHandlerProps {
  surveyId: number;
  currentUserId: number | null;
}

export const useSurveyResponseHandler = ({ surveyId, currentUserId }: SurveyResponseHandlerProps) => {
  const { createSurveyResponse } = useSurveyStore();

  const handleSurveyComplete = async (surveyModel: Model) => {
    try {
      // Validate survey data
      if (!surveyModel.data) {
        throw new Error('Survey response data is missing');
      }

      // Remove any circular references and validate JSON structure
      let cleanData;
      try {
        const jsonString = JSON.stringify(surveyModel.data);
        cleanData = JSON.parse(jsonString);

        if (!cleanData || typeof cleanData !== 'object') {
          throw new Error('Invalid response data format');
        }
      } catch (jsonError) {
        console.error('JSON validation error:', jsonError);
        throw new Error('Invalid response format');
      }

      // Get organizationId from localStorage or use a default value
      const organizationId = localStorage.getItem('organizationId') || '263';

      // Add organizationId to the survey data for metrics processing
      cleanData.organizationId = parseInt(organizationId, 10);

      // Convert the cleaned data back to a JSON string
      const responseJsonString = JSON.stringify(cleanData);

      // Validate that we have a current user ID
      if (!currentUserId) {
        throw new Error('User authentication required. Please log in to submit a survey response.');
      }

      // Get the current session from Supabase
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error('User authentication required. Please log in to submit a survey response.');
        return;
      }

      const freshToken = session.access_token;

      // Save survey response with metrics processing
      const response = await createSurveyResponse(
        surveyId,
        responseJsonString,
        currentUserId,
        freshToken
      );

      if (!response) {
        throw new Error('Failed to save survey response');
      }

      // Log metrics for monitoring and debugging
      if (response.processedMetrics) {
        console.log('Survey metrics processed:', {
          confidence: response.processedMetrics.confidenceScores,
          metrics: response.processedMetrics.metrics,
          timestamp: new Date().toISOString()
        });
      } else {
        console.warn('Survey response saved but no metrics were processed');
      }

      // Show success message and redirect
      toast.success('Survey response submitted successfully');
    } catch (error) {
      // Log detailed error for debugging
      console.error('Survey submission error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
        surveyId,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      });

      // Check for authentication errors specifically
      if (error instanceof Error &&
        (error.message.includes('Authentication required') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized'))) {
        toast.error('Authentication error. Refreshing to re-authenticate...');
        return;
      }

      // Show user-friendly error
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to submit survey response. Please try again.';
      toast.error(errorMessage);
    }
  };

  return { handleSurveyComplete };
};