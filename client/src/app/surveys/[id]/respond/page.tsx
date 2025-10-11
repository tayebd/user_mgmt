'use client';

import React, { useState } from 'react';
import { Model } from 'survey-core';
import SurveyDisplay from '@/components/surveys/SurveyDisplay';
import { useUserAuth } from '../../utils/userAuth';

// Import new components
import { SurveyLoader } from '@/components/surveys/SurveyLoader';
import { SurveyLayout } from '@/components/surveys/SurveyLayout';
import { useSurveyResponseHandler } from '@/components/surveys/SurveyResponseHandler';
import { calculateMaxScore, setupSurveyCompletion } from '@/components/surveys/SurveyScoreCalculator';

// Import theme
import { themeJson, customCss } from "./theme";
import { SurveyTheme } from "./themeTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Survey response page that handles survey completion and score calculation
 * Now refactored to use smaller, focused components
 */
export default function RespondPage({ params: rawParams }: PageProps) {
  const { id } = React.use(rawParams) as { id: string };
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const { currentUserId, isLoading: isUserLoading } = useUserAuth();

  const { handleSurveyComplete } = useSurveyResponseHandler({
    surveyId: Number(id),
    currentUserId
  });

  // Function to create and configure survey model
  const createSurveyModel = (surveyJson: string) => {
    try {
      const model = new Model(JSON.parse(surveyJson));

      // Apply theme and styling
      model.applyTheme(themeJson as SurveyTheme);
      model.customCss = customCss;

      // Calculate max score and setup completion
      const maxScore = calculateMaxScore(model);
      setupSurveyCompletion(model, maxScore);

      // Add custom CSS for modern and consistent styling
      model.css = {
        ...(model.css || {}),
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

      return model;
    } catch (error) {
      console.error('Error creating survey model:', error);
      throw new Error('Failed to create survey model');
    }
  };

  // Show loading state for user authentication
  if (isUserLoading) {
    return <div className="container mx-auto py-6">Loading user data...</div>;
  }

  // Show error if user is not authenticated
  if (!currentUserId) {
    return (
      <div className="container mx-auto py-6 text-red-500">
        User authentication required. Please log in to submit a survey response.
      </div>
    );
  }

  return (
    <SurveyLoader surveyId={id}>
      {({ survey, loading, error }) => {
        // Show loading state
        if (loading) {
          return <div className="container mx-auto py-6">Loading survey...</div>;
        }

        // Show error if any
        if (error) {
          return <div className="container mx-auto py-6 text-red-500">{error}</div>;
        }

        // Check if survey data is valid
        if (!survey || !survey.surveyJson) {
          return (
            <div className="container mx-auto py-6 text-red-500">
              Survey data is missing or invalid.
            </div>
          );
        }

        // Create survey model if not already created
        if (!surveyModel) {
          try {
            const model = createSurveyModel(survey.surveyJson);
            setSurveyModel(model);
          } catch (parseError) {
            console.error('Error parsing survey JSON:', parseError);
            return (
              <div className="container mx-auto py-6 text-red-500">
                Error parsing survey data. Please contact support.
              </div>
            );
          }
        }

        // Render survey with layout
        return (
          <SurveyLayout survey={survey}>
            {surveyModel && (
              <SurveyDisplay
                survey={surveyModel}
                onComplete={handleSurveyComplete}
              />
            )}
          </SurveyLayout>
        );
      }}
    </SurveyLoader>
  );
}
