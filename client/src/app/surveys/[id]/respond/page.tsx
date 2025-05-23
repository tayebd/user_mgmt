'use client';

import React, { useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from '@/types';
import { SurveyMetricService } from '@/services/surveyMetricService';
import SurveyDisplay from '@/components/surveys/SurveyDisplay'; 
import { useRouter } from 'next/navigation'
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';
import { useUserAuth } from '../../utils/userAuth';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// import "survey-core/survey-core.min.css";
import { themeJson, customCss } from "./theme";
import { SurveyTheme } from "./themeTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Survey response page that handles survey completion and score calculation
 */
export default function RespondPage({ params: rawParams }: PageProps) {
  // Unwrap params Promise with proper type safety
  const { id } = React.use(rawParams) as { id: string };
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyId, setSurveyId] = useState(0);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { fetchSurveyById, createSurveyResponse } = useApiStore();
  const { currentUserId, isLoading: isUserLoading } = useUserAuth();
  const { user } = useAuth();
 

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Extract and validate survey ID
        if (!id) {
          throw new Error('Survey ID is missing');
        }

        const surveyId = Number(id);
        if (isNaN(surveyId) || surveyId <= 0) {
          throw new Error(`Invalid survey ID: ${id}`);
        }

        setSurveyId(surveyId);

        // Fetch and validate survey data
        const survey = await fetchSurveyById(surveyId);
        if (!survey) {
          throw new Error('Survey not found');
        }

        // Validate required survey fields
        if (!survey.title || !survey.surveyJson) {
          throw new Error('Invalid survey data: missing required fields');
        }

        // Validate survey JSON structure
        try {
          const jsonData = typeof survey.surveyJson === 'string'
            ? JSON.parse(survey.surveyJson)
            : survey.surveyJson;

          if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Invalid survey definition format');
          }

          // Create survey model to validate structure
          const surveyModel = new Model(jsonData);
          // Apply the theme with proper type
          surveyModel.applyTheme(themeJson as SurveyTheme);
          surveyModel.customCss = customCss;
        } catch (jsonError) {
          console.error('Survey JSON validation error:', jsonError);
          throw new Error('Invalid survey format');
        }

        setSurvey(survey);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load survey';
        setError(errorMessage);
        console.error('Survey loading error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: error?.constructor?.name,
          surveyId: id,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id, fetchSurveyById]);

  const handleSurveyComplete = async (surveyModel: Model) => {
    // Calculate total score from survey data safely
    const calculateTotalScore = (data: Record<string, unknown>): number => {
      return Object.values(data).reduce((sum: number, value) => {
        if (value && typeof value === 'object' && 'score' in value) {
          const score = (value as { score: number }).score;
          return typeof score === 'number' && !isNaN(score) ? sum + score : sum;
        }
        return sum;
      }, 0);
    };

    const totalScore = surveyModel.data ? calculateTotalScore(surveyModel.data) : 0;

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

      // Get companyId from localStorage or use a default value
      // In a real application, this would come from user authentication or context
      const companyId = localStorage.getItem('companyId') || '263'; // Use default companyId of 1 to prevent foreign key constraint violations
      
      // Add companyId to the survey data for metrics processing
      cleanData.companyId = parseInt(companyId, 10);
      
      // Convert the cleaned data back to a JSON string
      const responseJsonString = JSON.stringify(cleanData);

      // Validate that we have a current user ID
      if (!currentUserId) {
        throw new Error('User authentication required. Please log in to submit a survey response.');
      }

      // Get the current session from Supabase
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
        currentUserId, // Use the actual user ID from authentication
        freshToken // Pass the fresh token to the API call
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
      // router.push(`/surveys/${surveyId}/thank-you`);
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
        // Try to refresh the page to re-authenticate
        toast.error('Authentication error. Refreshing to re-authenticate...');
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2000);
        return;
      }

      // Show user-friendly error
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit survey response. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Loading and error states are now handled at the return statement
  if (survey) {
    // Check if surveyJson exists and is not null/undefined before parsing
    if (!survey.surveyJson) {
      return <div className="container mx-auto py-6 text-red-500">Survey data is missing or invalid.</div>;
    }
    
    // Try to safely parse the JSON
    let surveyModel;
    try {
      surveyModel = new Model(JSON.parse(survey.surveyJson));
      // Apply the theme with proper type
      surveyModel.applyTheme(themeJson as SurveyTheme);
      surveyModel.customCss = customCss;
      // Helper function to safely get score from a choice
      const getChoiceScore = (choice: { value: string; score?: number }): number => {
        const score = choice?.score;
        return typeof score === 'number' && !isNaN(score) ? score : 0;
      };

      // Helper function to calculate max score from choices
      const getMaxScore = (choices: Array<{ value: string; score?: number }> | undefined): number => {
        if (!Array.isArray(choices)) return 0;
        return choices.reduce((max: number, choice) => {
          const score = getChoiceScore(choice);
          return score > max ? score : max;
        }, 0);
      };

      // Calculate max possible score from all questions
      let maxScore = 0;
      try {
        const questions = surveyModel.getAllQuestions();
        maxScore = questions.reduce((total: number, question) => {
          const choices = question.choices as Array<{ value: string; score?: number }> | undefined;
          return total + getMaxScore(choices);
        }, 0);
      } catch (error) {
        console.error('Error calculating max score:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: error?.constructor?.name,
          surveyId: id,
          timestamp: new Date().toISOString()
        });
        maxScore = 0; // Fallback to 0 if calculation fails
      }

      // Set up completion text with score placeholders and improved styling
      surveyModel.completedHtml = `<div class="survey-completion bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-2xl font-bold mb-4 text-gray-900">Survey Completed!</h3>
        <p class="text-lg text-gray-700 mb-2">You got {totalScore} out of {maxScore} points.</p>
        <p class="text-gray-600">Thank you for your valuable feedback!</p>
      </div>`;

      // Add custom CSS for modern and consistent styling
      surveyModel.css = {
        ...(surveyModel.css || {}),
        root: 'survey-container max-w-4xl mx-auto',
        body: 'survey-body bg-white rounded-lg shadow-sm p-6',
        completed: {
          root: 'survey-completed max-w-2xl mx-auto mt-8',
          heading: 'text-2xl font-bold mb-4 text-gray-900',
          text: 'text-lg text-gray-700 leading-relaxed'
        },
        question: {
          title: 'text-lg font-medium text-gray-900 mb-4',
          description: 'text-gray-600 mb-2'
        },
        rating: {
          root: 'flex gap-2 items-center justify-start',
          item: 'px-4 py-2 rounded-md hover:bg-gray-100 transition-colors'
        }
      };

      // Add score calculation function
      const calculateScore = (data: Record<string, unknown>): number => {
        try {
          return Object.values(data).reduce((sum: number, value: unknown) => {
            if (value && typeof value === 'object' && 'score' in value) {
              const score = (value as { score: number }).score;
              return !isNaN(score) ? sum + score : sum;
            }
            return sum;
          }, 0);
        } catch (error) {
          console.error('Score calculation error:', error);
          return 0;
        }
      };

      // Calculate total score on complete
      surveyModel.onComplete.add((sender) => {
        try {
          if (!sender.data) {
            throw new Error('Survey data is missing');
          }

          const totalScore = calculateScore(sender.data);
          
          // Validate scores
          if (totalScore > maxScore) {
            console.warn('Total score exceeds max score:', { totalScore, maxScore });
            maxScore = totalScore; // Adjust max score if needed
          }

          // Update completion text with actual scores
          const roundedTotal = Math.round(totalScore);
          const roundedMax = Math.round(maxScore);
          
          sender.completedHtml = `<div class="survey-completion">
            <h3 class="text-2xl font-bold mb-4 text-gray-900">Survey Completed!</h3>
            <p class="text-lg text-gray-700 mb-2">You got ${roundedTotal} out of ${roundedMax} points.</p>
            <p class="text-gray-600">Thank you for your feedback!</p>
          </div>`;

          // Log scores for debugging
          console.log('Survey scores:', { 
            totalScore: roundedTotal, 
            maxScore: roundedMax,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error in survey completion:', {
            error,
            surveyId,
            timestamp: new Date().toISOString()
          });
          // Fallback to showing completion without scores
          sender.completedHtml = `<div class="survey-completion">
            <h3 class="text-2xl font-bold mb-4 text-gray-900">Survey Completed!</h3>
            <p class="text-gray-600">Thank you for your feedback!</p>
          </div>`;
        }
      });

    } catch (parseError) {
      console.error('Error parsing survey JSON:', parseError);
      return <div className="container mx-auto py-6 text-red-500">Error parsing survey data. Please contact support.</div>;
    }
    
    // Show loading state for both survey and user authentication
  if (loading || isUserLoading) {
    return <div className="container mx-auto py-6">Loading {isUserLoading ? 'user data' : 'survey'}...</div>;
  }

  // Show error if any
  if (error) {
    return <div className="container mx-auto py-6 text-red-500">{error}</div>;
  }

  // Show error if user is not authenticated
  if (!currentUserId) {
    return <div className="container mx-auto py-6 text-red-500">
      User authentication required. Please log in to submit a survey response.
    </div>;
  }

  return (
    <div className="container mx-auto py-6">
      {survey && (
        <>
          <h1 className="text-2xl font-bold mb-6">{survey.title}</h1>
          
          {survey.description && (
            <p className="text-gray-600 mb-6">{survey.description}</p>
          )}

          <SurveyDisplay
            survey={surveyModel}
            onComplete={handleSurveyComplete}
          />
        </>
      )}
    </div>
  );
}
}
