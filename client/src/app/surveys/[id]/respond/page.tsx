'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Model } from 'survey-core';
import { Survey } from '@/types';
import SurveyDisplay from '@/components/surveys/SurveyDisplay'; 
import { usePathname, useSearchParams } from 'next/navigation'
import { useApiStore } from '@/state/api';

export default function RespondPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyId, setsurveyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { fetchSurveyById, createSurveyResponse } = useApiStore();
 
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const url = `${pathname}?${searchParams}`
        const parts = url.split('/');
        const surveyId = parts[2];
        console.log(surveyId)
        setsurveyId(surveyId);

        // Fetch survey using SurveyJS API or your backend endpoint
        const survey = await fetchSurveyById(surveyId);
      
        // Create a SurveyJS Model from the survey JSON
        // const surveyModel = new Model(JSON.parse(surveyData.surveyJson));
        if (survey) setSurvey(survey);
      } catch (err) {
        setError('Failed to load survey');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [pathname, searchParams]);

  const handleSurveyComplete = async (surveyModel: Model) => {
    try {
      // Get the survey results as a string
      const resultAsStr = JSON.stringify(surveyModel.data);
      console.log(resultAsStr);
      const userId = 'user-1';
      const newSurveyResponse = await createSurveyResponse (
        surveyId,
        resultAsStr,
        userId,
      );

      // Redirect to thank you page
      // router.push(`/surveys/${surveyId}/thank-you`);
    } catch (err) {
      console.error('Failed to submit response:', err);
      // Optionally handle error (show error message, etc.)
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading survey...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-6 text-red-500">{error}</div>;
  }
  if ( survey ) {
    const surveyModel = new Model(JSON.parse(survey.surveyJson));
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
