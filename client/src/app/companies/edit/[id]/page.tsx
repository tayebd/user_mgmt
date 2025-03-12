import { Suspense } from 'react';
import EditCompanyForm from './EditCompanyForm';
import { notFound } from 'next/navigation';

// Define strict types for page parameters
type Props = {
  params: { id: string }
}

/**
 * Company edit page component.
 * Handles validation and rendering of the company edit form.
 * Shows 404 page for invalid company IDs.
 */
export default function Page({ params }: Props) {
  // Validate and sanitize ID parameter
  try {
    // Validate ID presence
    const id = params?.id;
    if (!id) {
      console.error('Company ID is missing in URL parameters');
      throw new Error('Company ID is required');
    }

    // Validate ID format and value
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      console.error(`Invalid company ID format: ${id}`);
      throw new Error('Company ID must be a number');
    }

    if (parsedId <= 0) {
      console.error(`Invalid company ID value: ${parsedId}`);
      throw new Error('Company ID must be a positive number');
    }

    // Return the edit form with loading state
    return (
      <Suspense fallback={
        <div className="flex">
          <div className="w-64 h-screen bg-gray-100 fixed left-0 top-0 border-r"></div>
          <div className="flex-1 p-4 ml-64">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      }>
        <EditCompanyForm companyId={id} />
      </Suspense>
    );
  } catch (error) {
    // Log detailed error for debugging
    console.error('Company page access error:', {
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


           