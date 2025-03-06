'use client';

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/state/api';
import { PVPanel } from '@/types';
import Sidebar from '@/components/Sidebar';

const PVPanelList = () => {
  const { pvPanels, fetchPVPanels }: 
  { pvPanels: PVPanel[]; fetchPVPanels: (page: number, limit: number) => void } = useApiStore();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    fetchPVPanels(page, limit);
  }, [fetchPVPanels, page, limit]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-bold mb-6">PV Panels</h1>

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Number</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nameplate Max Power (W)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pvPanels.map((panel) => (
              <tr key={panel.id}>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{panel.manufacturer}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{panel.modelNumber}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{panel.description}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{panel.power}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button onClick={handlePrevPage} disabled={page === 1} className="px-4 py-2 bg-gray-200 rounded">
            Previous
          </button>
          <button onClick={handleNextPage} className="px-4 py-2 bg-gray-200 rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PVPanelList;
