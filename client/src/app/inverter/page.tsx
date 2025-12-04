'use client';

import InverterFormEnhanced from './InverterFormEnhanced';
import Sidebar from '@/components/Sidebar';

export default function InverterPage() {
  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement API call to save inverter data
      console.log('Saving Inverter:', data);
    } catch (error) {
      console.error("Error saving inverter data:", error);
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
        <InverterFormEnhanced
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          title="Add New Inverter"
        />
      </div>
    </div>
  );
}