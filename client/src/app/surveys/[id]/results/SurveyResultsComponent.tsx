'use client';

import { Survey, SurveyResponse } from '@/types';
import { ProcessedMetrics, DashboardMetrics } from '@/types/metrics';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Model } from 'survey-core';
import { BarChart, PieChart, Activity, Server, Users, Lightbulb } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/state/api';
import { toast } from 'sonner';

interface SurveyResultsComponentProps {
  surveyId: string;
}

// Helper functions for metrics data extraction
const getAverageMetricScore = (responses: SurveyResponse[], category: string): number => {
  let totalScore = 0;
  let count = 0;
  
  try {
    responses.forEach(response => {
      if (response.processedMetrics) {
        // Handle both string and object formats for processedMetrics
        let metrics: ProcessedMetrics;
        if (typeof response.processedMetrics === 'string') {
          try {
            metrics = JSON.parse(response.processedMetrics) as ProcessedMetrics;
          } catch (e) {
            console.warn('Failed to parse processedMetrics string:', e);
            return; // Skip this response
          }
        } else {
          metrics = response.processedMetrics as unknown as ProcessedMetrics;
        }
        
        if (metrics && metrics.metrics) {
          switch (category) {
            case 'technology':
              if (metrics.metrics.technologyMetrics?.maturityScore) {
                totalScore += metrics.metrics.technologyMetrics.maturityScore;
                count++;
              }
              break;
            case 'process':
              if (metrics.metrics.processMetrics?.digitizationLevel) {
                totalScore += metrics.metrics.processMetrics.digitizationLevel;
                count++;
              }
              break;
            case 'personnel':
              if (metrics.metrics.personnelMetrics?.avgProficiency) {
                totalScore += metrics.metrics.personnelMetrics.avgProficiency * 20; // Convert to 0-100 scale
                count++;
              }
              break;
            case 'strategy':
              if (metrics.metrics.strategyMetrics?.implementationProgress) {
                totalScore += metrics.metrics.strategyMetrics.implementationProgress * 100; // Convert to 0-100 scale
                count++;
              }
              break;
          }
        }
      }
    });
  } catch (error) {
    console.error('Error calculating average metric score:', error);
  }
  
  return count > 0 ? Math.round(totalScore / count) : 0;
};

// Helper function to get implemented technologies from responses
const getImplementedTechnologies = (responses: SurveyResponse[]): string[] => {
  const technologies = new Set<string>();
  
  try {
    responses.forEach(response => {
      if (response.processedMetrics) {
        // Handle both string and object formats for processedMetrics
        let metrics: ProcessedMetrics;
        if (typeof response.processedMetrics === 'string') {
          try {
            metrics = JSON.parse(response.processedMetrics) as ProcessedMetrics;
          } catch (e) {
            console.warn('Failed to parse processedMetrics string:', e);
            return; // Skip this response
          }
        } else {
          metrics = response.processedMetrics as unknown as ProcessedMetrics;
        }
        
        if (metrics?.metrics?.technologyMetrics?.implementedTechnologies) {
          metrics.metrics.technologyMetrics.implementedTechnologies.forEach(tech => {
            if (tech && typeof tech === 'string') {
              technologies.add(tech);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error extracting implemented technologies:', error);
  }
  
  return Array.from(technologies);
};

// Helper function to get process areas from responses
const getProcessAreas = (responses: SurveyResponse[]): string[] => {
  const areas = new Set<string>();
  
  try {
    responses.forEach(response => {
      if (response.processedMetrics) {
        // Handle both string and object formats for processedMetrics
        let metrics: ProcessedMetrics;
        if (typeof response.processedMetrics === 'string') {
          try {
            metrics = JSON.parse(response.processedMetrics) as ProcessedMetrics;
          } catch (e) {
            console.warn('Failed to parse processedMetrics string:', e);
            return; // Skip this response
          }
        } else {
          metrics = response.processedMetrics as unknown as ProcessedMetrics;
        }
        
        if (metrics?.metrics?.processMetrics?.processAreas) {
          metrics.metrics.processMetrics.processAreas.forEach(area => {
            if (area && typeof area === 'string') {
              areas.add(area);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error extracting process areas:', error);
  }
  
  return Array.from(areas);
};

// Helper component for displaying metric cards
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
}

function MetricCard({ icon, title, value, description }: MetricCardProps) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-2 rounded-full bg-gray-50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for displaying technology metrics
function TechnologyMetricsCard({ responses }: { responses: SurveyResponse[] }) {
  const technologies = getImplementedTechnologies(responses);
  
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5 text-blue-500" />
          Technology Implementation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-2">Implemented Technologies</h4>
        {technologies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {technologies.map(tech => (
              <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {tech}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No technology data available</p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for displaying process metrics
function ProcessMetricsCard({ responses }: { responses: SurveyResponse[] }) {
  const processAreas = getProcessAreas(responses);
  
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-green-500" />
          Process Digitization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-2">Digitized Process Areas</h4>
        {processAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {processAreas.map(area => (
              <span key={area} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {area}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No process data available</p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get average confidence score from responses
const getAverageConfidenceScore = (responses: SurveyResponse[], category: string): number => {
  let totalScore = 0;
  let count = 0;
  
  try {
    responses.forEach(response => {
      if (response.processedMetrics) {
        // Handle both string and object formats for processedMetrics
        let metrics: ProcessedMetrics;
        if (typeof response.processedMetrics === 'string') {
          try {
            metrics = JSON.parse(response.processedMetrics) as ProcessedMetrics;
          } catch (e) {
            return; // Skip this response
          }
        } else {
          metrics = response.processedMetrics as unknown as ProcessedMetrics;
        }
        
        if (metrics?.confidenceScores && metrics.confidenceScores[category] !== undefined) {
          totalScore += metrics.confidenceScores[category] * 100; // Convert to percentage
          count++;
        }
      }
    });
  } catch (error) {
    console.error('Error calculating confidence score:', error);
  }
  
  return count > 0 ? Math.round(totalScore / count) : 0;
};

// Helper function to get color based on confidence score
const getConfidenceColor = (score: number): string => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

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

  // The helper functions are now defined at the top of the file

  const calculateStatistics = () => {
    if (!survey || !responses.length || !surveyModel) return {};

    const stats: Record<string, Record<string, number>> = {};
    let invalidResponseCount = 0;

    // Initialize stats for all questions
    surveyModel.getAllQuestions().forEach(question => {
      stats[question.name] = {};
    });

    responses.forEach((response, index) => {
      let parsedResponse: Record<string, any>;
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

        {/* Metrics Dashboard Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Metrics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {responses.length > 0 && responses.some(r => r.processedMetrics) ? (
              <>
                <MetricCard 
                  icon={<Server className="h-8 w-8 text-blue-500" />}
                  title="Technology" 
                  value={getAverageMetricScore(responses, 'technology')}
                  description="Technology maturity score"
                />
                <MetricCard 
                  icon={<Activity className="h-8 w-8 text-green-500" />}
                  title="Process" 
                  value={getAverageMetricScore(responses, 'process')}
                  description="Process digitization level"
                />
                <MetricCard 
                  icon={<Users className="h-8 w-8 text-purple-500" />}
                  title="Personnel" 
                  value={getAverageMetricScore(responses, 'personnel')}
                  description="Team skill proficiency"
                />
                <MetricCard 
                  icon={<Lightbulb className="h-8 w-8 text-yellow-500" />}
                  title="Strategy" 
                  value={getAverageMetricScore(responses, 'strategy')}
                  description="Strategy implementation progress"
                />
              </>
            ) : (
              <div className="col-span-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">No metrics data available for these responses</p>
              </div>
            )}
          </div>

          {/* Detailed Metrics Section */}
          {responses.length > 0 && responses.some(r => r.processedMetrics) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TechnologyMetricsCard responses={responses} />
                <ProcessMetricsCard responses={responses} />
              </div>
              
              {/* Confidence Scores Section */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Confidence Scores</h3>
                <Card className="bg-white hover:shadow-md transition-shadow duration-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['technology', 'process', 'personnel', 'strategy'].map(category => {
                        const confidenceScore = getAverageConfidenceScore(responses, category);
                        return (
                          <div key={category} className="flex flex-col items-center">
                            <div className="relative h-24 w-24 mb-2">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold">{confidenceScore}%</span>
                              </div>
                              <svg className="h-24 w-24" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#eee"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke={getConfidenceColor(confidenceScore)}
                                  strokeWidth="3"
                                  strokeDasharray={`${confidenceScore}, 100`}
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium capitalize">{category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
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
