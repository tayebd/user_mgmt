'use client';

import React, { useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from '@/types';
import SurveyDisplay from '@/components/surveys/SurveyDisplay'; 
import { useRouter } from 'next/navigation'
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';

// import "survey-core/survey-core.min.css";
import { themeJson } from "./theme";

interface PageProps {
  params: { id: string };
}

/**
 * Survey response page that handles survey completion and score calculation
 */
export default function RespondPage({ params }: PageProps) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyId, setsurveyId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { fetchSurveyById, createSurveyResponse } = useApiStore();
 
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Extract and validate survey ID from params
        if (!params.id) {
          throw new Error('Survey ID is missing');
        }

        const surveyId = Number(params.id);
        if (isNaN(surveyId) || surveyId <= 0) {
          throw new Error(`Invalid survey ID: ${params.id}`);
        }

        setsurveyId(surveyId);

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
          surveyModel.applyTheme(themeJson);

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
          surveyId: params.id,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params.id, fetchSurveyById]);

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

      // Save survey response
      const response = await createSurveyResponse(
        surveyId,
        JSON.stringify(cleanData),
        1 // TODO: Get actual user ID from session/auth when available
      );

      if (!response) {
        throw new Error('Failed to save survey response');
      }

      // Show success message and redirect
      toast.success('Survey response submitted successfully');
      router.push(`/surveys/${surveyId}/thank-you`);
    } catch (error) {
      // Log detailed error for debugging
      console.error('Survey submission error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
        surveyId,
        timestamp: new Date().toISOString()
      });

      // Show user-friendly error
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit survey response. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading survey...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-6 text-red-500">{error}</div>;
  }
  if (survey) {
    // Check if surveyJson exists and is not null/undefined before parsing
    if (!survey.surveyJson) {
      return <div className="container mx-auto py-6 text-red-500">Survey data is missing or invalid.</div>;
    }
    
    // Try to safely parse the JSON
    let surveyModel;
    try {
      surveyModel = new Model(JSON.parse(survey.surveyJson));
      surveyModel.applyTheme(themeJson);

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
          surveyId: params.id,
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
} else {
  return (
    <div className="container mx-auto py-6">
      {survey && (
        <>
          <h1 className="text-2xl font-bold mb-6">No Survey</h1>
          <p className="text-gray-600 mb-6">No Survey</p>

        </>
      )}
    </div>
  );
}
}
