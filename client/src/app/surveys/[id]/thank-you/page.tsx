'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useApiStore } from '@/state/api';
import { Survey } from '@/types';
import { themeConfig } from './theme';
import { JSX } from 'react/jsx-runtime';

/**
 * Thank you page displayed after survey completion
 * Shows a success message and provides navigation options
 */
export default function ThankYouPage({ params }: { params: { id: string } }): JSX.Element {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { fetchSurveyById } = useApiStore();
  const surveyId = params.id;

  useEffect(() => {
    const validateSurvey = async () => {
      try {
        // Validate survey ID
        if (!surveyId?.trim()) {
          throw new Error('Survey ID is missing');
        }

        // Parse and validate numeric ID
        const numericId = Number(surveyId);
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error(`Invalid survey ID: ${surveyId}`);
        }

        // Verify survey exists
        const survey = await fetchSurveyById(numericId);
        if (!survey) {
          throw new Error('Survey not found');
        }

      } catch (error) {
        // Log error with context
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Thank you page error:', {
          error: errorMessage,
          surveyId,
          type: error?.constructor?.name,
          timestamp: new Date().toISOString()
        });
        setError(error instanceof Error ? error.message : 'Invalid survey');
        // Redirect to surveys page after a delay if there's an error
        setTimeout(() => router.push('/surveys'), 3000);
      } finally {
        setLoading(false);
      }
    };

    validateSurvey();
  }, [surveyId, fetchSurveyById, router]);

  // Loading state with skeleton UI
  if (loading) {
    const { root, card, skeleton } = themeConfig.loading;
    return (
      <div className={root}>
        <Card className={card}>
          <CardHeader>
            <div className={skeleton.title} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={skeleton.line1} />
              <div className={skeleton.line2} />
              <div className={skeleton.button} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state with detailed message
  if (error) {
    const { root, title, message, buttons } = themeConfig.card.error;
    return (
      <Card className={root}>
        <CardHeader>
          <CardTitle className={title}>
            <AlertCircle className="h-5 w-5" />
            Error Loading Survey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={message}>{error}</p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className={buttons.secondary}
            >
              Go Back
            </Button>
            <Link href="/surveys">
              <Button className={buttons.primary}>
                Return to Surveys
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state with survey info
  const { root, title, message, surveyTitle, description, buttons } = themeConfig.card.success;
  return (
    <Card className={root}>
      <CardHeader>
        <CardTitle className={title}>
          <CheckCircle2 className="h-5 w-5" />
          Survey Completed Successfully
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {survey && (
            <p className={description}>
              You have completed <span className={surveyTitle}>{survey.title}</span>
            </p>
          )}
          <p className={message}>
            Thank you for your valuable feedback! Your response has been recorded.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href={`/surveys/${surveyId}/results`}>
              <Button 
                variant="outline"
                className={buttons.secondary}
              >
                View Results
              </Button>
            </Link>
            <Link href="/surveys">
              <Button className={buttons.primary}>
                Back to Surveys
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
