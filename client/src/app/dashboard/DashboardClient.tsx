'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LineChart, BarChart, PieChart, AreaChart, DonutChart } from './charts'; 
import { KPICard } from './KPICard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Settings, Save, Layout } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsService, type DashboardMetrics } from '@/services/analyticsService';

// Types definitions
type Sector = 'All' | 'Agri-food' | 'Textiles' | 'Manufacturing' | 'Electronics' | 'Automotive';
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface KPI {
  id: string;
  title: string;
  description: string;
  value: number | null;
  previousValue: number | null;
  format: 'percentage' | 'number' | 'level' | 'rating';
  trend: 'up' | 'down' | 'neutral';
  category: 'adoption' | 'maturity' | 'integration' | 'personnel' | 'process' | 'technology';
  visible: boolean;
}

interface ChartWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  title: string;
  kpiId: string;
  visible: boolean;
  gridArea?: string;
}

// Transform metrics to KPIs with proper error handling
const transformMetricsToKPIs = (metrics: DashboardMetrics): KPI[] => {
  if (!metrics) {
    console.error('No metrics data provided');
    return [];
  }
  return [
    {
      id: 'tech-implementation',
      title: 'Technology Implementations',
      description: 'Number of Industry 4.0 technologies implemented',
      value: metrics.technologyMetrics?.implementationCount ?? null,
      previousValue: null, // We'll need to store historical data to show this
      format: 'number',
      trend: 'neutral',
      category: 'technology',
      visible: true
    },
    {
      id: 'tech-maturity',
      title: 'Technology Maturity',
      description: 'Average maturity level of implemented technologies',
      value: metrics.technologyMetrics?.averageMaturity ?? null,
      previousValue: null,
      format: 'level',
      trend: 'neutral',
      category: 'maturity',
      visible: true
    },
    {
      id: 'process-digitization',
      title: 'Process Digitization Level',
      description: 'Average level of process digitization',
      value: metrics.processMetrics?.digitizationLevel ?? null,
      previousValue: null,
      format: 'level',
      trend: 'neutral',
      category: 'process',
      visible: true
    },
    {
      id: 'process-automation',
      title: 'Process Automation Level',
      description: 'Average level of process automation',
      value: metrics.processMetrics?.automationLevel ?? null,
      previousValue: null,
      format: 'level',
      trend: 'neutral',
      category: 'process',
      visible: true
    },
    {
      id: 'skilled-personnel',
      title: 'Skilled Personnel',
      description: 'Total number of personnel with I4.0 skills',
      value: metrics.personnelMetrics?.totalSkilled ?? null,
      previousValue: null,
      format: 'number',
      trend: 'neutral',
      category: 'personnel',
      visible: true
    },
    {
      id: 'personnel-proficiency',
      title: 'Personnel Proficiency',
      description: 'Average proficiency level of personnel',
      value: metrics.personnelMetrics?.avgProficiency ?? null,
      previousValue: null,
      format: 'level',
      trend: 'neutral',
      category: 'personnel',
      visible: true
    },
    {
      id: 'strategy-maturity',
      title: 'Strategy Maturity',
      description: 'Maturity level of I4.0 strategy implementation',
      value: metrics.strategyMetrics?.strategyMaturity ?? null,
      previousValue: null,
      format: 'level',
      trend: 'neutral',
      category: 'maturity',
      visible: true
    },
    {
      id: 'implementation-progress',
      title: 'Implementation Progress',
      description: 'Overall progress in I4.0 implementation',
      value: metrics.strategyMetrics?.implementationProgress ?? null,
      previousValue: null,
      format: 'percentage',
      trend: 'neutral',
      category: 'adoption',
      visible: true
    }
  ];
};

// Default chart widgets
const defaultCharts: ChartWidget[] = [
  {
    id: 'tech-trend',
    type: 'line',
    title: 'Technology Implementation Trend',
    kpiId: 'tech-implementation',
    visible: true
  },
  {
    id: 'process-maturity',
    type: 'bar',
    title: 'Process Maturity Levels',
    kpiId: 'process-digitization',
    visible: true
  },
  {
    id: 'skill-distribution',
    type: 'pie',
    title: 'Skill Distribution',
    kpiId: 'skilled-personnel',
    visible: true
  },
  {
    id: 'strategy-progress',
    type: 'area',
    title: 'Strategy Implementation Progress',
    kpiId: 'implementation-progress',
    visible: true
  }
];

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [charts, setCharts] = useState<ChartWidget[]>(defaultCharts);
  const [selectedSector, setSelectedSector] = useState<Sector>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual organization ID from user context/session
        const metrics = await AnalyticsService.getDashboardMetrics(266);
        setKpis(transformMetricsToKPIs(metrics));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCharts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value as Sector)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sectors</SelectItem>
              <SelectItem value="Agri-food">Agri-food</SelectItem>
              <SelectItem value="Textiles">Textiles</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {loading ? (
          // Show loading skeletons
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="w-full h-[140px] animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))
        ) : error ? (
          // Show error state
          <div className="col-span-full">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : kpis.length === 0 ? (
          // Show empty state
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No metrics data available</p>
          </div>
        ) : (
          // Show KPI cards
          kpis.filter(kpi => kpi.visible).map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={kpi}
              isCustomizing={false}
              onToggleVisibility={() => {}}
            />
          ))
        )}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <SortableContext items={charts.map(chart => chart.id)}>
            {charts.filter(chart => chart.visible).map((chart) => {
              const kpi = kpis.find(k => k.id === chart.kpiId);
              return (
                <Card key={chart.id} className="w-full overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{chart.title}</CardTitle>
                    {kpi && <CardDescription>{kpi.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="h-[250px] lg:h-[300px]">
                    {/* Render appropriate chart based on type with proper props */}
                    {chart.type === 'line' && (
                      <LineChart
                        kpiId={chart.kpiId}
                        timeRange={timeRange}
                        sector={selectedSector}
                      />
                    )}
                    {chart.type === 'bar' && (
                      <BarChart
                        kpiId={chart.kpiId}
                        timeRange={timeRange}
                        sector={selectedSector}
                      />
                    )}
                    {chart.type === 'pie' && (
                      <PieChart
                        kpiId={chart.kpiId}
                        timeRange={timeRange}
                        sector={selectedSector}
                      />
                    )}
                    {chart.type === 'area' && (
                      <AreaChart
                        kpiId={chart.kpiId}
                        timeRange={timeRange}
                        sector={selectedSector}
                      />
                    )}
                    {chart.type === 'donut' && (
                      <DonutChart
                        kpiId={chart.kpiId}
                        timeRange={timeRange}
                        sector={selectedSector}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
