import { Suspense } from 'react';
import EditCompanyForm from './EditCompanyForm';

type PageProps = {
  params: { id: string }
}

// Server Component
async function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-4 ml-64">Loading company editor...</div>}>
      <EditCompanyForm companyId={params.id} />
    </Suspense>
  );
}

export default Page;


           