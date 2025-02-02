'use client';

import React from 'react';
import { useGetSolarCompaniesQuery } from '@/state/api';
import Header from '@/components/Header';

import { SolarCompany } from '@/types';

const SolarCompaniesPage = () => {
  const { data: solarCompanies, isLoading, error } = useGetSolarCompaniesQuery();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !solarCompanies) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading solar companies data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header name="Solar Companies" />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Solar Companies</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solarCompanies.map((company: SolarCompany) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {company.website}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolarCompaniesPage;
