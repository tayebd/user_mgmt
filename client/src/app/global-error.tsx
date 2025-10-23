'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">System Error</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Critical Error</h2>
            <p className="text-gray-600 mb-8">
              A critical error occurred in the application. Please refresh the page or contact support if the problem persists.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Refresh page
              </button>
              <button
                onClick={reset}
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}