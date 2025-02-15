'use client';

import React, { useEffect } from 'react';
import { useApiStore } from '@/state/api';
import { Company } from '@/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import CompanyManagement from '@/components/Company/CompanyManagement';

const CompaniesPage = () => {
  const { companies, fetchCompanies }: { companies: Company[]; fetchCompanies: () => void } = useApiStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-bold mb-6">The best Atlanta, GA solar companies in 2025</h1>


        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow duration-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-8 gap-4 items-center">
                  {/* Column 1: Logo (1/8) */}
                  <div className="col-span-1 flex justify-center">
                    <img
                      src={company.iconUrl || company.logo}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain p-1"
                      // className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>

                  {/* Column 2: Company Info (5/8) */}
                  <div className="col-span-5">
                    <h2 className="text-lg font-semibold">
                      <Link
                        href={`/companies/${company.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {company.name}
                      </Link>
                    </h2>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>{company.location}</span>
                      <span>•</span>
                      <span>Est. {company.established}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {company.descriptions.find((desc) => desc.language === 'en')?.text}
                      <button className="text-blue-600 font-medium ml-1 hover:underline">
                        Show More
                      </button>
                    </p>
                  </div>

                  {/* Column 3: Badge (1/8) */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium whitespace-nowrap">
                      {company.badge}
                    </span>
                    <span className="text-gray-600 text-xs mt-1 text-center">Screened & Verified</span>
                  </div>

                  {/* Column 4: Rating (1/8) */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{company.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm whitespace-nowrap">{company.reviews} Reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
