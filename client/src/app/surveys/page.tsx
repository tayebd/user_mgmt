'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Edit, ClipboardList, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useApiStore } from '@/state/api';
import Sidebar from '@/components/Sidebar';
import { Survey, SurveyStatus } from '@/types';

function SurveysPage() {
  const router = useRouter();
  const { surveys = [], fetchSurveysByUserId } = useApiStore();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const data = await fetchSurveysByUserId(1);
        if (Array.isArray(data)) {
          const surveysWithResponseCounts = data.map(survey => ({
            ...survey,
            responseCount: survey.responses?.length || 0
          }));
        } else {
          console.error('Invalid surveys data:', data);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    fetchSurveys();
  }, [fetchSurveysByUserId]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-bold mb-6">Surveys</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Create and manage your surveys</p>
          </div>
          <div className="space-x-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/surveys/create')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/surveys/upload')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload Survey
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Array.isArray(surveys) && surveys.map((survey: Survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow duration-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-8 gap-4 items-center">
                  {/* Column 1: Icon (1/8) */}
                  <div className="col-span-1 flex justify-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ClipboardList className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>

                  {/* Column 2: Survey Info (5/8) */}
                  <div className="col-span-5">
                    <h2 className="text-lg font-semibold">
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {survey.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {/* Using current date as fallback since Survey type doesn't have createdAt */}
                      Created: {new Date().toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="mr-4">
                        {survey.status === SurveyStatus.ACTIVE ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-1 h-4 w-4" />
                        {survey.responses?.length || 0} responses
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Actions (2/8) */}
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                      onClick={() => router.push(`/surveys/${survey.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => router.push(`/surveys/${survey.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => router.push(`/surveys/${survey.id}/respond/`)}
                    >
                      Take
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SurveysPageContainer() {
  return <SurveysPage />;
}
