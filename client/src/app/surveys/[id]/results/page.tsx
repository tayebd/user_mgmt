import { Suspense } from 'react';
import SurveyResultsComponent from './SurveyResultsComponent';

type PageProps = {
  params: { id: string }
}

// Async Server Component
async function Page({ params }: PageProps) {
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
      <SurveyResultsComponent surveyId={params.id} />
    </Suspense>
  );
}

export default Page;
