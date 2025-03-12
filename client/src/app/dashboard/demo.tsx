import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart } from 'recharts';

import { AnalyticsService, DashboardMetrics } from '@/services/analyticsService';

const IndustryDashboardDemo = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual company ID from user context
        const data = await AnalyticsService.getDashboardMetrics(1);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Handle export
  const handleExport = async () => {
    try {
      // TODO: Replace with actual company ID from user context
      const data = await AnalyticsService.exportDashboardMetrics(1);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-metrics.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting metrics:', err);
      // TODO: Show error toast
    }
  };

  // Define KPI type for type safety
  interface KPI {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }

  // Transform metrics into KPIs with proper error handling
  const kpis: KPI[] = metrics ? [
    {
      title: "Technology Implementation",
      value: `${metrics.technologyMetrics.implementationCount ?? 0}`,
      change: `Maturity: ${(metrics.technologyMetrics.averageMaturity ?? 0).toFixed(1)}/4`,
      trend: (metrics.technologyMetrics.averageMaturity ?? 0) > 2 ? "up" : "down"
    },
    {
      title: "Process Digitization",
      value: `${(metrics.processMetrics.digitizationLevel ?? 0).toFixed(1)}/5`,
      change: `Automation: ${(metrics.processMetrics.automationLevel ?? 0).toFixed(1)}/5`,
      trend: (metrics.processMetrics.digitizationLevel ?? 0) > 3 ? "up" : "down"
    },
    {
      title: "Skilled Personnel",
      value: `${metrics.personnelMetrics.totalSkilled ?? 0}`,
      change: `Avg Proficiency: ${(metrics.personnelMetrics.avgProficiency ?? 0).toFixed(1)}/5`,
      trend: (metrics.personnelMetrics.avgProficiency ?? 0) > 3 ? "up" : "down"
    },
    {
      title: "Strategy Implementation",
      value: `${((metrics.strategyMetrics.implementationProgress ?? 0) * 100).toFixed(1)}%`,
      change: `Maturity: ${metrics.strategyMetrics.maturityLevel ?? 0}/5`,
      trend: (metrics.strategyMetrics.implementationProgress ?? 0) > 0.5 ? "up" : "down"
    }
  ] : [];

  // Transform trend data for charts with proper typing
  const lineData = metrics?.technologyMetrics.trendData.map((item: {
    date: string | Date;
    count: number;
    maturityLevel: number;
  }) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    value: item.count,
    maturityLevel: item.maturityLevel
  })) ?? [];
  
  const barData = metrics?.personnelMetrics.skillDistribution.map((item: {
    category: string;
    count: number;
  }) => ({
    name: item.category,
    value: item.count
  })) ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Industry 4.0 Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={loading}>Customize</Button>
          <Button size="sm" onClick={handleExport} disabled={loading || !metrics}>Export</Button>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <Card key={index} className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Technology Implementation Trend</CardTitle>
                <CardDescription>Monthly evolution of implementations and maturity</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {!loading && <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Count" />
                    <Line type="monotone" dataKey="maturityLevel" stroke="#82ca9d" name="Maturity" />
                  </LineChart>
                </ResponsiveContainer>}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Personnel skills by category</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {!loading && <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>All KPIs</CardTitle>
              <CardDescription>Select KPIs to display on your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p>KPIs configuration panel would appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>Customize display and data options</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings configuration panel would appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import the necessary components
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, Bar } from 'recharts';

export default IndustryDashboardDemo;