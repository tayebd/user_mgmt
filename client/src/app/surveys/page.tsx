'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
import { PlusCircle, Settings } from 'lucide-react';
import { useApiStore } from '@/state/api';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Survey } from '@/types';

function SurveysPage() {
  const router = useRouter();
  const { surveys, fetchSurveysByUserId } = useApiStore();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const surveys = await fetchSurveysByUserId("user-1");
        const surveysWithResponseCounts = surveys.map(survey => ({
          ...survey,
          responseCount: survey.responses?.length || 0
        }));
        // surveys.forEach(survey => addSurvey(survey));
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    fetchSurveys();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surveys</h1>
        <Button onClick={() => router.push('/surveys/create')}>
          Create Survey
        </Button>
        <Button onClick={() => router.push('/surveys/upload')}>
          Upload Survey
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>Manage and monitor all your surveys</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your surveys</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey: Survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">{survey.title}</TableCell>
                  <TableCell>
                    {survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {survey.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {survey.responseCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/surveys/${survey.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/surveys/${survey.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/surveys/${survey.id}/report`)}
                      >
                        Report
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/surveys/${survey.id}/respond/`)}
                        
                      >
                        Take
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DemoPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Survey Builder</h1>
          <p className="text-gray-600">Create and manage your surveys</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Survey
          </Button>
          <Button onClick={() => router.push('/surveys/upload')}>
            Upload Survey
          </Button>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <SurveysPage />
      </div>
    </div>
  );
}
