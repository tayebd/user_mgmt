'use client';

import React from 'react';
import { Survey } from '@/types';
import { useSurveyStore } from '@/state';

interface SurveyLoaderProps {
  surveyId: string;
  children: (props: {
    survey: Survey | null;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function SurveyLoader({ surveyId, children }: SurveyLoaderProps) {
  const [survey, setSurvey] = React.useState<Survey | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { fetchSurveyById } = useSurveyStore();

  React.useEffect(() => {
    const fetchSurvey = async () => {
      try {
        if (!surveyId) {
          throw new Error('Survey ID is missing');
        }

        const id = Number(surveyId);
        if (isNaN(id) || id <= 0) {
          throw new Error(`Invalid survey ID: ${surveyId}`);
        }

        const surveyData = await fetchSurveyById(id);
        if (!surveyData) {
          throw new Error('Survey not found');
        }

        if (!surveyData.title || !surveyData.surveyJson) {
          throw new Error('Invalid survey data: missing required fields');
        }

        setSurvey(surveyData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load survey';
        setError(errorMessage);
        console.error('Survey loading error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: error?.constructor?.name,
          surveyId,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, fetchSurveyById]);

  return <>{children({ survey, loading, error })}</>;
}