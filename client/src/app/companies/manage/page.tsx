'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useCompanies, useCompanyStore } from '@/stores/company-store';
import { Toaster, toast } from 'sonner';

const ManageCompaniesPage = () => {
  const router = useRouter();
  const companies = useCompanies();
  const { fetchCompanies, deleteCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDeleteCompany = async (id: number) => {
    // Show a confirmation toast with action buttons
    toast(
      'Are you sure you want to delete this company?',
      {
        id: `delete-company-${id}`,
        duration: Infinity, // Stay until user takes action
        icon: <Trash2 className="text-red-500" size={18} />,
        action: {
          label: 'Delete',
          onClick: async () => {
            // When user confirms, show a loading toast
            toast.loading('Deleting company...', { id: `deleting-${id}` });
            
            try {
              // Attempt to delete the company
              await deleteCompany(id);
              // On success, update the loading toast to success
              toast.success('Company deleted successfully', { id: `deleting-${id}` });
              // Refresh the companies list
              await fetchCompanies();
            } catch (error) {
              // On error, update the loading toast to error
              console.error('Failed to delete company:', error);
              toast.error('Failed to delete company', { id: `deleting-${id}` });
            }
          },
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {
            // Dismiss the confirmation toast when canceled
            toast.dismiss(`delete-company-${id}`);
          },
        },
        // Style the toast
        style: {
          border: '1px solid #f56565',
          backgroundColor: '#fff5f5',
        },
      }
    );
  };

  return (
    <div className="flex">
      <Toaster richColors closeButton position="top-right" />
      
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Companies</h1>
          <Button 
            onClick={() => router.push('/companies/create')}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add New Company
          </Button>
        </div>
        
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow duration-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-8 gap-4 items-center">
                  {/* Column 1: Logo (1/8) */}
                  <div className="col-span-1 flex justify-center">
                  <Image
                      src={company.iconUrl || company.logo || '/placeholder-logo.png'}
                      alt={`${company.name}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
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
                      <span>{company.address}</span>
                      {company.established && (
                        <>
                          <span>•</span>
                          <span>Est. {new Date(company.established).toDateString()}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {company.descriptions?.find((desc) => desc.language === 'en')?.text || company.capabilities}
                    </p>
                  </div>

                  {/* Column 3: Actions (2/8) */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => router.push(`/companies/edit/${company.id}`)}
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {companies.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No companies found</p>
              <Button 
                onClick={() => router.push('/companies/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Your First Company
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCompaniesPage;
