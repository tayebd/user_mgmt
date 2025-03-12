'use client';

import { Survey, SurveyResponse } from '@/types';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Model } from 'survey-core';
import { BarChart, PieChart } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';

interface SurveyResultsComponentProps {
  surveyId: string;
}

export default function SurveyResultsComponent({ surveyId }: SurveyResultsComponentProps) {
  const router = useRouter();
  const { fetchSurveyById, fetchSurveyResponses } = useApiStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Validate survey ID
        if (!surveyId) {
          throw new Error('Survey ID is required');
        }

        const parsedSurveyId = parseInt(surveyId, 10);
        if (isNaN(parsedSurveyId) || parsedSurveyId <= 0) {
          throw new Error('Invalid survey ID format');
        }

        // Fetch survey data
        const surveyData = await fetchSurveyById(parsedSurveyId);
        if (!surveyData) {
          throw new Error('Survey not found');
        }

        // Validate survey JSON
        if (!surveyData.surveyJson) {
          throw new Error('Survey definition is missing');
        }

        let parsedSurveyJson;
        try {
          // Handle both string and object JSON formats
          parsedSurveyJson = typeof surveyData.surveyJson === 'string' 
            ? JSON.parse(surveyData.surveyJson)
            : surveyData.surveyJson;
        } catch (jsonError) {
          console.error('Error parsing survey JSON:', jsonError);
          throw new Error('Invalid survey definition format');
        }

        // Create and validate survey model
        const model = new Model(parsedSurveyJson);
        if (!model.getAllQuestions().length) {
          throw new Error('Survey has no questions defined');
        }

        // Set survey data and model
        setSurvey(surveyData);
        setSurveyModel(model);

        // Fetch and validate responses
        const responsesData = await fetchSurveyResponses(parsedSurveyId);
        if (Array.isArray(responsesData)) {
          setResponses(responsesData);
        } else {
          console.warn('Unexpected response data format:', responsesData);
          setResponses([]);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load survey results';
        setError(errorMessage);
        console.error('Survey results error:', {
          error,
          surveyId,
          timestamp: new Date().toISOString()
        });
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [surveyId, fetchSurveyById, fetchSurveyResponses]);

  const calculateStatistics = () => {
    if (!survey || !responses.length || !surveyModel) return {};

    const stats: Record<string, Record<string, number>> = {};
    let invalidResponseCount = 0;

    // Initialize stats for all questions
    surveyModel.getAllQuestions().forEach(question => {
      stats[question.name] = {};
    });

    responses.forEach((response, index) => {
      let parsedResponse;
      try {
        // Handle both string and object JSON formats
        parsedResponse = typeof response.responseJson === 'string' 
          ? JSON.parse(response.responseJson)
          : response.responseJson;

        if (!parsedResponse || typeof parsedResponse !== 'object') {
          throw new Error('Invalid response data format');
        }

      } catch (error) {
        console.error(`Error parsing response ${index}:`, {
          error,
          responseId: response.id,
          timestamp: new Date().toISOString()
        });
        invalidResponseCount++;
        return; // Skip invalid response
      }

      surveyModel.getAllQuestions().forEach(question => {
        const questionName = question.name;
        const answer = parsedResponse[questionName];

        // Handle different types of answers
        if (answer !== undefined && answer !== null) {
          if (!stats[questionName]) {
            stats[questionName] = {};
          }

          let answerKey;
          if (Array.isArray(answer)) {
            // Handle multi-select answers
            answerKey = answer.length ? answer.join(', ') : 'No selection';
          } else if (typeof answer === 'object') {
            // Handle complex answer types
            answerKey = JSON.stringify(answer);
          } else {
            // Handle simple answer types
            answerKey = String(answer).trim() || 'No answer';
          }

          stats[questionName][answerKey] = (stats[questionName][answerKey] || 0) + 1;
        } else {
          // Track missing answers
          const noAnswerKey = 'No answer';
          stats[questionName][noAnswerKey] = (stats[questionName][noAnswerKey] || 0) + 1;
        }
      });
    });

    // Log statistics about invalid responses
    if (invalidResponseCount > 0) {
      console.warn(`Found ${invalidResponseCount} invalid responses out of ${responses.length} total responses`);
      toast.warning(`${invalidResponseCount} responses were invalid and excluded from the results`);
    }

    return stats;
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">{error}</div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-md">Survey not found</div>
        </div>
      </div>
    );
  }

  const statistics = calculateStatistics();
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{survey.title} - Results</h1>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Survey
          </button>
        </div>
        
        <div className="mb-6">
          <Card className="bg-blue-50 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-blue-700">
                <BarChart className="mr-2 h-5 w-5" />
                Response Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">{responses.length}</span>
                <span className="text-gray-600">Total Responses</span>
                {survey.targetResponses && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({Math.round(responses.length / survey.targetResponses * 100)}% of target)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveyModel && Object.entries(statistics).map(([questionName, answers]) => {
            const question = surveyModel.getQuestionByName(questionName);
            if (!question) return null;

            return (
              <Card key={questionName} className="bg-blue-50 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-700">{question.title || questionName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {Object.entries(answers).map(([answer, count]) => {
                      const percentage = Math.round(count / responses.length * 100);
                      return (
                        <li key={answer} className="">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700">{answer}</span>
                            <span className="font-medium text-blue-600">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
