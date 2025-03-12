import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SurveyResultsComponent from './SurveyResultsComponent';

/**
 * Validates survey ID from params
 */
async function validateSurveyId(id: string): Promise<string> {
  // Ensure we have an ID
  if (!id?.trim()) {
    throw new Error('Survey ID is required');
  }

  // Parse and validate numeric ID
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new Error('Invalid survey ID format');
  }

  return id;
}

/**
 * Survey results page component.
 * Handles displaying survey results with proper async param validation.
 */
export default async function Page({ params }: { params: { id: string } }) {
  try {
    // Validate and sanitize ID parameter
    const surveyId = await validateSurveyId(params.id);

    return (
      <Suspense fallback={
        <div className="flex h-screen overflow-hidden">
          <div className="w-64 h-screen bg-gray-100 fixed left-0 top-0 border-r"></div>
          <div className="flex-1 p-4 ml-64 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      }>
        <SurveyResultsComponent surveyId={surveyId} />
      </Suspense>
    );
  } catch (error) {
    // Log error for debugging
    console.error('Survey results page error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      params,
      timestamp: new Date().toISOString()
    });

    // Show 404 page for any validation errors
    notFound();

    // TypeScript needs this even though notFound() throws
    return null;
  }
}
