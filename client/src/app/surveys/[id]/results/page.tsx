'use client';
import { Survey, SurveyResponse } from '@/types';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Model } from 'survey-core';


type tParams = Promise<{ slug: string[] }>;


export default function SurveyResultsPage(props: { params: tParams }) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { slug } = await props.params;
        const surveId = slug[1];
        // Fetch survey and its responses
        const surveyResponse = await fetch(`/api/surveys/${surveId}`);
        const surveyData = await surveyResponse.json();
        
        const responsesResponse = await fetch(`/api/surveys/${surveId}/responses`);
        const responsesData = await responsesResponse.json();

        setSurvey(surveyData);
        setResponses(responsesData);
      } catch (err) {
        setError('Failed to load survey results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  });

  const calculateStatistics = () => {
    if (!survey || !responses.length) return {};

    // Parse the survey JSON definition
    const surveyModel = new Model(JSON.parse(survey.surveyJson));
    const stats: Record<string, Record<string, number>> = {};

    responses.forEach(response => {
      const parsedResponse = JSON.parse(response.responseJson);

      surveyModel.getAllQuestions().forEach(question => {
        const questionName = question.name;
        const answer = parsedResponse[questionName];

        if (answer !== undefined) {
          // Initialize statistics for this question
          if (!stats[questionName]) {
            stats[questionName] = {};
          }

          // Handle different question types
          const answerKey = Array.isArray(answer) ? answer.join(', ') : String(answer);
          stats[questionName][answerKey] = (stats[questionName][answerKey] || 0) + 1;
        }
      });
    });

    return stats;
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading results...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-6 text-red-500">{error}</div>;
  }

  if (!survey) {
    return <div className="container mx-auto py-6">Survey not found</div>;
  }

  const statistics = calculateStatistics();
  const surveyModel = new Model(JSON.parse(survey.surveyJson));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{survey.title} - Results</h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Responses: {responses.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(statistics).map(([questionName, answers]) => {
          const question = surveyModel.getQuestionByName(questionName);
          if (!question) return null;

          return (
            <Card key={questionName}>
              <CardHeader>
                <CardTitle className="text-lg">{question.title || questionName}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(answers).map(([answer, count]) => (
                    <li key={answer} className="flex justify-between">
                      <span>{answer}</span>
                      <span className="font-medium">
                        {count} ({Math.round(count / responses.length * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
