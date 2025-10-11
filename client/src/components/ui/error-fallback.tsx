'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-6">⚠️</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <h2 className="text-sm font-medium text-red-800 mb-2">Error Details</h2>
          <p className="text-sm text-red-700 font-mono">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. You can try the following actions:
        </p>

        <div className="space-y-3">
          <Button
            onClick={resetError}
            className="w-full"
            variant="default"
          >
            Try again
          </Button>

          <Button
            onClick={handleGoHome}
            className="w-full"
            variant="outline"
          >
            Go to home page
          </Button>

          <Button
            onClick={handleReload}
            className="w-full"
            variant="outline"
          >
            Reload page
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If the problem persists, please contact support with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}

// Component-specific error fallbacks
export function SurveyErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Survey Loading Error
      </h3>
      <p className="text-yellow-700 mb-4">
        {error.message || 'Failed to load the survey. Please try again.'}
      </p>
      <Button onClick={resetError} variant="outline">
        Retry Survey
      </Button>
    </div>
  );
}

export function AuthErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        Authentication Required
      </h3>
      <p className="text-blue-700 mb-4">
        {error.message || 'Please log in to access this page.'}
      </p>
      <div className="space-x-2">
        <Button onClick={handleLogin} variant="default">
          Log In
        </Button>
        <Button onClick={resetError} variant="outline">
          Retry
        </Button>
      </div>
    </div>
  );
}