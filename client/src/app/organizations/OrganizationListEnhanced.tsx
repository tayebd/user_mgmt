'use client';

import React, { useEffect, useState } from 'react';
import { useOrganizations, useOrganizationStore } from '@/stores/organization-store';
import { Organization } from '@/types';
import Sidebar from '@/components/Sidebar';
import { DataTable } from '@/components/shared/data/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const OrganizationListEnhanced = () => {
  const organizations = useOrganizations();
  const { fetchOrganizations } = useOrganizationStore();
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const columns = [
    {
      key: 'name' as keyof Organization,
      title: 'Organization Name',
      sortable: true,
      render: (value: string, record: Organization) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'address' as keyof Organization,
      title: 'Location',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'established' as keyof Organization,
      title: 'Established',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">
          {new Date(value).getFullYear()}
        </Badge>
      )
    },
    {
      key: 'rating' as keyof Organization,
      title: 'Rating',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <span className="font-bold">{value}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'reviews' as keyof Organization,
      title: 'Reviews',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary">{value} Reviews</Badge>
      )
    },
    {
      key: 'badge' as keyof Organization,
      title: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          'Verified': 'default',
          'Screened': 'secondary',
          'Pending': 'outline'
        };
        return (
          <Badge variant={statusColors[value] || 'default'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'actions' as keyof Organization,
      title: 'Actions',
      render: (_: any, record: Organization) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Solar Organizations</h1>
          <p className="text-gray-600">Manage your solar organization directory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.length > 0 
                  ? (organizations.reduce((sum, org) => sum + (org.rating || 0), 0) / organizations.length).toFixed(1)
                  : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedOrganizations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.filter(org => org.badge === 'Verified').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={organizations}
          columns={columns}
          loading={false}
          rowSelection={{
            selectedRowKeys: selectedOrganizations,
            onChange: (keys) => setSelectedOrganizations(keys as string[])
          }}
        />
      </div>
    </div>
  );
};

export default OrganizationListEnhanced;