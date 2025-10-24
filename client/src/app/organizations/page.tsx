'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
// import OrganizationManagement from '@/components/Organization/OrganizationManagement';
import { useOrganizations, useOrganizationStore } from '@/stores/organization-store';
import { Organization } from '@/types';

const OrganizationsPage = () => {
  const organizations = useOrganizations();
  const { fetchOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-bold mb-6">Solar Organizations</h1>


        <div className="space-y-4">
          {organizations.map((organization) => (
            <Card key={organization.id} className="hover:shadow-lg transition-shadow duration-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-8 gap-4 items-center">
                  {/* Column 1: Logo (1/8) */}
                  <div className="col-span-1 flex justify-center">
                    <Image
                      src={
                        organization.iconUrl || organization.logo
                          ? (organization.iconUrl || organization.logo)!.startsWith('/')
                            ? (organization.iconUrl || organization.logo)!
                            : `/${organization.iconUrl || organization.logo}`
                          : '/placeholder-logo.png'
                      }
                      alt={`${organization.name} logo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      unoptimized
                    />
                  </div>

                  {/* Column 2: Organization Info (5/8) */}
                  <div className="col-span-5">
                    <h2 className="text-lg font-semibold">
                      <Link
                        href={`/organizations/${organization.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {organization.name}
                      </Link>
                    </h2>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>{organization.address}</span>
                      <span>•</span>
                      <span>Est. {organization.established?.toDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {organization.descriptions?.find((desc) => desc.language === 'en')?.text}
                      <button className="text-blue-600 font-medium ml-1 hover:underline">
                        Show More
                      </button>
                    </p>
                  </div>

                  {/* Column 3: Badge (1/8) */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium whitespace-nowrap">
                      {organization.badge}
                    </span>
                    <span className="text-gray-600 text-xs mt-1 text-center">Screened & Verified</span>
                  </div>

                  {/* Column 4: Rating (1/8) */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{organization.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm whitespace-nowrap">{organization.reviews} Reviews</span>
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

export default OrganizationsPage;
