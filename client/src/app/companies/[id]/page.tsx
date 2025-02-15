'use client';

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/state/api';
import { useParams, useRouter } from 'next/navigation';
import { Company } from '@/types';

const CompanyDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { companies } = useApiStore();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (id) {
      const selectedCompany = companies.find((c) => c.id === id);
      setCompany(selectedCompany || null);
    }
  }, [id, companies]);

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 ml-64">
      <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
      <div>
        <p><strong>Location:</strong> {company.location}</p>
        <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{company.website}</a></p>
        <p><strong>Phone Number:</strong> {company.phone}</p>
        <p><strong>Capabilities:</strong> {company.capabilities}</p>
        <p><strong>Rating:</strong> {company.rating}</p>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
