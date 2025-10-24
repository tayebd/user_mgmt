'use client';

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/state/api';
import { useParams } from 'next/navigation';
import { Organization } from '@/types';

const OrganizationDetailPage = () => {
  const params = useParams();
  const id = Number(params?.id);
  if (isNaN(id)) {
    throw new Error('Invalid organization ID');
  }  
  const { organizations } = useApiStore();
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (id) {
      const selectedOrganization = organizations.find((c) => c.id === id);
      setOrganization(selectedOrganization || null);
    }
  }, [id, organizations]);

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 ml-64">
      <h1 className="text-2xl font-bold mb-4">{organization.name}</h1>
      <div>
        <p><strong>Location:</strong> {organization.address}</p>
        <p><strong>Website:</strong> <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{organization.website}</a></p>
        <p><strong>Phone Number:</strong> {organization.phone}</p>
        <p><strong>Capabilities:</strong> {organization.capabilities}</p>
        <p><strong>Rating:</strong> {organization.rating}</p>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;
