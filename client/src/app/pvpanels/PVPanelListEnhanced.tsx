'use client';

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/state/api';
import type { PVPanel } from '@/../../server/shared/types';
import Sidebar from '@/components/Sidebar';
import { DataTable } from '@/components/shared/data/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PVPanelListEnhanced = () => {
  const { pvPanels, fetchPVPanels }: 
  { pvPanels: PVPanel[]; fetchPVPanels: (page: number, limit: number) => void } = useApiStore();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);

  useEffect(() => {
    fetchPVPanels(page, limit);
  }, [fetchPVPanels, page, limit]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const columns = [
    {
      key: 'maker' as keyof PVPanel,
      title: 'Manufacturer',
      sortable: true,
      render: (value: string, record: PVPanel) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'model' as keyof PVPanel,
      title: 'Model Number',
      sortable: true,
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'description' as keyof PVPanel,
      title: 'Description',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'power' as keyof PVPanel,
      title: 'Power (W)',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary">{value}W</Badge>
      )
    },
    {
      key: 'efficiency' as keyof PVPanel,
      title: 'Efficiency',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline">{value}%</Badge>
      )
    },
    {
      key: 'type' as keyof PVPanel,
      title: 'Type',
      render: (value: string) => {
        const typeColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          'monocrystalline': 'default',
          'polycrystalline': 'secondary',
          'thinfilm': 'outline'
        };
        return (
          <Badge variant={typeColors[value] || 'default'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'actions' as keyof PVPanel,
      title: 'Actions',
      render: (_: any, record: PVPanel) => (
        <div className="flex gap-2">
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
          <h1 className="text-3xl font-bold mb-2">PV Panels</h1>
          <p className="text-gray-600">Manage your solar panel inventory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Panels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pvPanels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Power</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pvPanels.length > 0 
                  ? Math.round(pvPanels.reduce((sum, panel) => sum + (panel.power || 0), 0) / pvPanels.length)
                  : 0}W
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedPanels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{page}</div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={pvPanels}
          columns={columns}
          loading={false}
          pagination={{
            current: page,
            pageSize: limit,
            total: pvPanels.length,
            onChange: (newPage) => setPage(newPage)
          }}
          rowSelection={{
            selectedRowKeys: selectedPanels,
            onChange: (keys) => setSelectedPanels(keys as string[])
          }}
        />
      </div>
    </div>
  );
};

export default PVPanelListEnhanced;