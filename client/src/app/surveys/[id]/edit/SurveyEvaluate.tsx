'use client';

import React, { useEffect, useState } from 'react';
import { Survey as SurveyType } from '@/types';
import { Model, Serializer, Question } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';
import "survey-core/defaultV2.min.css";

// Add a custom `score` property to choice options
Serializer.addProperty("itemvalue", {
  name: "score:number"
});

interface SurveyEvaluateProps {
  surveyId: string;
}

interface ItemValue {
  value: string;
  score?: number;
}

interface MatrixDataItem {
  value: string | number | boolean | null;  // More specific types for matrix values
  score?: number;
}

interface SurveyQuestionData {
  name: string | number;
  value: string | number | boolean | null;  // More specific types for question values
  score?: number;
  data?: MatrixDataItem[];
}

export default function SurveyEvaluate({ surveyId }: SurveyEvaluateProps): JSX.Element {
  const router = useRouter();
  const { fetchSurveyById, createSurveyResponse } = useApiStore();
  const [survey, setSurvey] = useState<SurveyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);

  /**
   * Calculates the maximum possible score for a set of survey questions
   * @param questions - Array of survey questions to calculate max score for
   * @returns The maximum possible score
   */
  function calculateMaxScore(questions: Question[]): number {
    let maxScore = 0;
    questions.forEach((question: Question): void => {
      if (question.choices) {
        const maxValue = Math.max(...question.choices.map((choice: ItemValue): number => choice.score ?? 0));
        maxScore += maxValue;
      }
      if (question.rateValues) {
        const maxValue = Math.max(...question.rateValues.map((rateValue: ItemValue): number => rateValue.score ?? 0));
        maxScore += maxValue;
      }
      if (question.getType() === "matrix") {
        const maxMatrixValue = Math.max(...question.columns.map((column: ItemValue): number => column.score ?? 0)) * question.rows.length;
        maxScore += maxMatrixValue;
      }
    });
    return maxScore;
  }

  /**
   * Calculates the total score for a set of survey responses
   * @param data - Array of survey question responses
   * @param model - Survey model containing question definitions
   * @returns The total score for the responses
   */
  function calculateTotalScore(data: SurveyQuestionData[], model: Model): number {
    let totalScore = 0;
    data.forEach((response: SurveyQuestionData): void => {
      const question = model.getQuestionByValueName(response.name.toString());
      const responseValue = response.value;

      if (question.choices) {
        const selectedChoice = question.choices.find((choice: ItemValue): boolean => choice.value === responseValue);
        if (selectedChoice?.score !== undefined) {
          totalScore += selectedChoice.score;
        }
      }
      if (question.rateValues) {
        const selectedRate = question.rateValues.find((rate: ItemValue): boolean => rate.value === responseValue);
        if (selectedRate?.score !== undefined) {
          totalScore += selectedRate.score;
        }
      }
      if (question.getType() === "matrix") {
        response.data?.forEach((matrixResponse: MatrixDataItem): void => {
          if (matrixResponse.value && matrixResponse.score !== undefined) {
            totalScore += matrixResponse.score;
          }
        });
      }
    });
    return totalScore;
  }

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const parsedSurveyId = parseInt(surveyId, 10);
        if (isNaN(parsedSurveyId)) {
          throw new Error('Invalid survey ID');
        }

        // Validate survey data
        const surveyData = await fetchSurveyById(parsedSurveyId);
        if (!surveyData) {
          throw new Error('Survey not found');
        }

        // Validate required fields
        if (!surveyData.title) {
          throw new Error('Survey title is missing');
        }

        setSurvey(surveyData);

        // Validate and parse survey JSON
        if (!surveyData.surveyJson) {
          throw new Error('Survey definition is missing');
        }

        try {
          // Parse JSON if it's a string, otherwise validate the structure
          const jsonData = typeof surveyData.surveyJson === 'string'
            ? JSON.parse(surveyData.surveyJson)
            : surveyData.surveyJson;

          // Validate survey structure
          if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Invalid survey definition format');
          }

          const model = new Model(jsonData);

            // Add scoring calculation before completion
          model.onCompleting.add((sender) => {  
            const maxScore = calculateMaxScore(sender.getAllQuestions());
            const plainData = sender.getPlainData({
              calculations: [{ propertyName: "score" }]
            });
            const totalScore = calculateTotalScore(plainData, sender);
            
            sender.setValue("maxScore", maxScore);
            sender.setValue("totalScore", totalScore);
          });

          model.onComplete.add(async (sender) => {
            try {
              // Validate survey data before saving
              if (!sender.data) {
                throw new Error('Survey response data is missing');
              }

              // Extract scores from the data
              const { maxScore, totalScore, ...responseData } = sender.data;

              // Remove any circular references and validate JSON structure
              let cleanData;
              try {
                const jsonString = JSON.stringify(responseData);
                cleanData = JSON.parse(jsonString);
              } catch (jsonError) {
                console.error('JSON serialization error:', jsonError);
                throw new Error('Invalid survey response format');
              }

              // Create a new survey response
              const response = await createSurveyResponse(
                parsedSurveyId,
                JSON.stringify(cleanData),
                1 // TODO: Get actual user ID from session/auth when available
              );

              if (!response) {
                throw new Error('Failed to save survey response');
              }

              toast.success('Survey response saved successfully');
              router.push(`/surveys/${surveyId}/results`);
            } catch (error) {
              // Log detailed error information for debugging
              console.error('Error saving survey response:', {
                error,
                surveyId: parsedSurveyId,
                timestamp: new Date().toISOString()
              });

              // Show user-friendly error message
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to save survey response. Please try again.';
              toast.error(errorMessage);

              // Keep user on the page if saving fails
              return;
            }
          });
          setSurveyModel(model);
        } catch (parseError) {
          console.error('Error parsing survey JSON:', parseError);
          const errorMessage = parseError instanceof Error
            ? `Invalid survey format: ${parseError.message}`
            : 'Invalid survey format';
          setError(errorMessage);
          toast.error('Error loading survey');
        }
      } catch (err) {
        console.error('Error loading survey:', err);
        setError(err instanceof Error ? err.message : 'Failed to load survey');
        toast.error(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, fetchSurveyById, createSurveyResponse, router]);

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

  if (!survey || !surveyModel) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-md">
            Survey not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{survey.title} - Edit</h1>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Survey
          </button>
        </div>

        <Card className="bg-blue-50 hover:shadow-lg transition-shadow duration-200 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <Edit2 className="mr-2 h-5 w-5" />
              Edit Survey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Survey model={surveyModel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}