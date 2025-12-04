'use client';

import PVPanelFormEnhanced from './PVPanelFormEnhanced';
import Sidebar from '@/components/Sidebar';

export default function PVPanelsPage() {
  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement API call to save solar panel data
      console.log('Saving PV Panel:', data);
    } catch (error) {
      console.error("Error saving solar panel data:", error);
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
        <PVPanelFormEnhanced
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          title="Add New Solar Panel"
        />
      </div>
    </div>
  );
}
