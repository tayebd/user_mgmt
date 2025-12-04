'use client';

import OrganizationFormEnhanced from '../organizations/OrganizationFormEnhanced';
import Sidebar from '@/components/Sidebar';

export default function OrganizationPage() {
  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement API call to save organization data
      console.log('Saving Organization:', data);
    } catch (error) {
      console.error("Error saving organization data:", error);
    }
  };

  const handleCancel = () => {
    // TODO: Navigate back to list
    console.log('Cancelled');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <OrganizationFormEnhanced
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          title="Add New Organization"
        />
      </div>
    </div>
  );
}