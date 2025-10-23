'use client';

import { useEffect } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error',
  description: 'An error occurred while loading this page.',
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Error</h2>
        <p className="text-gray-600 mb-8">
          An unexpected error occurred while loading this page. Please try again later.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}