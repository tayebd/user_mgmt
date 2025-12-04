'use client';

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/state/api';
import type { Inverter } from '@/../../server/shared/types';
import Sidebar from '@/components/Sidebar';
import { DataTable } from '@/components/shared/data/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InverterListEnhanced = () => {
  const { inverters, fetchInverters }: 
  { inverters: Inverter[]; fetchInverters: (page: number, limit: number) => void } = useApiStore();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedInverters, setSelectedInverters] = useState<string[]>([]);

  useEffect(() => {
    fetchInverters(page, limit);
  }, [fetchInverters, page, limit]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const columns = [
    {
      key: 'maker' as keyof Inverter,
      title: 'Manufacturer',
      sortable: true,
      render: (value: string, record: Inverter) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'model' as keyof Inverter,
      title: 'Model Number',
      sortable: true,
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'description' as keyof Inverter,
      title: 'Description',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'phaseType' as keyof Inverter,
      title: 'Phase Type',
      render: (value: string) => {
        const phaseColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          'Single Phase': 'default',
          'Three Phase': 'secondary',
          'Split Phase': 'outline'
        };
        return (
          <Badge variant={phaseColors[value] || 'default'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'outputVoltage' as keyof Inverter,
      title: 'Output Voltage',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline">{value}V</Badge>
      )
    },
    {
      key: 'maxOutputCurrent' as keyof Inverter,
      title: 'Max Current',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary">{value}A</Badge>
      )
    },
    {
      key: 'maxOutputPower' as keyof Inverter,
      title: 'Power Rating',
      sortable: true,
      render: (value: number) => (
        <div className="font-semibold">
          {(value / 1000).toFixed(1)} kW
        </div>
      )
    },
    {
      key: 'efficiency' as keyof Inverter,
      title: 'Efficiency',
      sortable: true,
      render: (value: number) => (
        <Badge variant="default">{value}%</Badge>
      )
    },
    {
      key: 'actions' as keyof Inverter,
      title: 'Actions',
      render: (_: any, record: Inverter) => (
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
          <h1 className="text-3xl font-bold mb-2">Inverters</h1>
          <p className="text-gray-600">Manage your solar inverter inventory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Inverters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inverters.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Power</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inverters.length > 0 
                  ? (inverters.reduce((sum, inverter) => sum + (inverter.maxOutputPower || 0), 0) / inverters.length / 1000).toFixed(1)
                  : 0} kW
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedInverters.length}</div>
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
          data={inverters}
          columns={columns}
          loading={false}
          pagination={{
            current: page,
            pageSize: limit,
            total: inverters.length,
            onChange: (newPage) => setPage(newPage)
          }}
          rowSelection={{
            selectedRowKeys: selectedInverters,
            onChange: (keys) => setSelectedInverters(keys as string[])
          }}
        />
      </div>
    </div>
  );
};

export default InverterListEnhanced;