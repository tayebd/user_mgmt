// client/components/components/MiscEquipment.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface MiscEquipment {
  id: string;
  manufacturer: string;
  modelNumber: string;
  equipmentType: string;
  description: string;
  notes: string;
  cecListingDate: string;
  lastUpdate: string;
}

const MiscEquipment: React.FC = () => {
  const [miscEquipment, setMiscEquipment] = useState<MiscEquipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiscEquipment = async () => {
      try {
        const response = await fetch('/api/misc-equipment');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MiscEquipment[] = await response.json();
        setMiscEquipment(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMiscEquipment();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Misc Equipment</h1>
      <ul>
        {miscEquipment.map((item) => (
          <li key={item.id}>
            {item.manufacturer} - {item.modelNumber} - {item.equipmentType}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MiscEquipment;
