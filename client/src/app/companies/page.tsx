'use client';

import React, { useEffect } from 'react';
import { useApiStore } from '@/state/api';
import Link from 'next/link';

const CompaniesPage = () => {
  const { companies, fetchCompanies } = useApiStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="p-4 ml-64">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Company Name</th>
              <th className="py-2 px-4 text-left">Location (City, State)</th>
              <th className="py-2 px-4 text-left">Website</th>
              <th className="py-2 px-4 text-left">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="py-2 px-4">
                  <Link href={`/companies/${company.id}`} className="text-blue-500 hover:underline">
                    {company.name}
                  </Link>
                </td>
                <td className="py-2 px-4">{company.location}</td>
                <td className="py-2 px-4">
                  <Link href={company.website} className="text-blue-500 hover:underline">
                    {company.website}
                  </Link>
                </td>
                <td className="py-2 px-4">{company.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesPage;
