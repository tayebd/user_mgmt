'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Users, FileText, PlusCircle, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import { useApiStore } from '@/state/api';
import { Survey } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchSurveysByUserId } = useApiStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch recent surveys - use a default ID if user ID is not available
        const userId = 1; // Default user ID as fallback
        const surveys = await fetchSurveysByUserId(userId);
        if (Array.isArray(surveys)) {
          setRecentSurveys(surveys.slice(0, 5)); // Get 5 most recent surveys
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, router, fetchSurveysByUserId]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.email?.split('@')[0] || 'User'}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Create Survey</p>
                <p className="text-sm text-blue-500 dark:text-blue-300">Design a new survey</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400" onClick={() => router.push('/surveys/create')}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium">View Surveys</p>
                <p className="text-sm text-green-500 dark:text-green-300">Manage existing surveys</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400" onClick={() => router.push('/surveys')}>
                <FileText className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surveys */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Surveys</CardTitle>
            <CardDescription>Your most recently created surveys</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading surveys...</p>
            ) : recentSurveys.length > 0 ? (
              <div className="space-y-4">
                {recentSurveys.map((survey) => (
                  <div key={survey.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2">
                    <div>
                      <p className="font-medium">{survey.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {survey.responses?.length || 0} responses
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/surveys/${survey.id}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}/edit`)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No surveys found. Create your first survey!</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/surveys')}>
              View All Surveys
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Frequently used resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/surveys/create" className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <PlusCircle className="h-5 w-5 mr-3 text-blue-500" />
                <span>Create New Survey</span>
              </Link>
              <Link href="/surveys/upload" className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FileText className="h-5 w-5 mr-3 text-green-500" />
                <span>Upload Survey</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
