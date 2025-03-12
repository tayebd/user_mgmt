'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LineChart, BarChart, PieChart, AreaChart, DonutChart } from '../dashboard/charts'; 
import { KPICard } from '../dashboard/KPICard';
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

// Types definitions
type Sector = 'All' | 'Agri-food' | 'Textiles' | 'Manufacturing' | 'Electronics' | 'Automotive';
type TimeRange = '7d' | '30d' | '90d' | '1y';
// type MaturityLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

interface KPI {
  id: string;
  title: string;
  description: string;
  value: number;
  previousValue: number;
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

// Sample data
const generateSampleData = (): KPI[] => {
  return [
    {
      id: 'companies-with-i40',
      title: 'Companies with Industry 4.0 Solutions',
      description: 'Proportion of companies that have integrated at least one Industry 4.0 technology',
      value: 42.7,
      previousValue: 38.2,
      format: 'percentage',
      trend: 'up',
      category: 'adoption',
      visible: true
    },
    {
      id: 'adoption-rate',
      title: 'Adoption Rate of I4.0 Solutions',
      description: 'Percentage of companies implementing I4.0 technologies in processes',
      value: 38.5,
      previousValue: 35.8,
      format: 'percentage',
      trend: 'up',
      category: 'adoption',
      visible: true
    },
    {
      id: 'digital-maturity',
      title: 'Digital Maturity Rate',
      description: 'Progress level in adopting and integrating I4.0 technologies',
      value: 2.4,
      previousValue: 2.1,
      format: 'level',
      trend: 'up',
      category: 'maturity',
      visible: true
    },
    {
      id: 'skilled-personnel',
      title: 'Personnel Mastering I4.0',
      description: 'Employees with skills to use and manage I4.0 technologies',
      value: 15438,
      previousValue: 12950,
      format: 'number',
      trend: 'up',
      category: 'personnel',
      visible: true
    },
    {
      id: 'strategy-adoption',
      title: 'I4.0 Strategy Adoption Rate',
      description: 'Companies with I4.0 strategy in business plan',
      value: 28.6,
      previousValue: 24.8,
      format: 'percentage',
      trend: 'up',
      category: 'adoption',
      visible: true
    },
    {
      id: 'economic-integration',
      title: 'I4.0 Economic Model Integration',
      description: 'Maturity of I4.0 economic principles integration in companies',
      value: 3.2,
      previousValue: 2.9,
      format: 'rating',
      trend: 'up',
      category: 'integration',
      visible: true
    },
    {
      id: 'support-digitization',
      title: 'Support Processes Digitization',
      description: 'Support processes (HR, Marketing, Accounting) digitization rate',
      value: 53.8,
      previousValue: 48.2,
      format: 'percentage',
      trend: 'up',
      category: 'process',
      visible: true
    },
    {
      id: 'employee-maturity',
      title: 'Employee I4.0 Maturity',
      description: 'Skills assessment for I4.0 concepts and technologies',
      value: 2.8,
      previousValue: 2.5,
      format: 'level',
      trend: 'up',
      category: 'maturity',
      visible: true
    },
    {
      id: 'production-automation',
      title: 'Production Process Automation',
      description: 'Percentage of digitized and automated production processes',
      value: 45.7,
      previousValue: 41.5,
      format: 'percentage',
      trend: 'up',
      category: 'process',
      visible: true
    },
    {
      id: 'product-smartification',
      title: 'Product Smartification Level',
      description: 'Integration of intelligent technologies in products',
      value: 3.1,
      previousValue: 2.7,
      format: 'rating',
      trend: 'up',
      category: 'technology',
      visible: true
    },
    {
      id: 'product-personilisation',
      title: 'Product Personalization Level',
      description: 'Extent of customizable products offered to customers',
      value: 2.6,
      previousValue: 2.3,
      format: 'level',
      trend: 'up',
      category: 'process',
      visible: true
    },
    {
      id: 'it-integration',
      title: 'IT Systems Integration Level',
      description: 'Interconnectivity of different IT systems within industry',
      value: 3.4,
      previousValue: 3.1,
      format: 'rating',
      trend: 'up',
      category: 'integration',
      visible: true
    },
    {
      id: 'it-coverage',
      title: 'IT Systems Coverage',
      description: 'Diversity and deployment of IT tools across areas',
      value: 61.9,
      previousValue: 58.3,
      format: 'percentage',
      trend: 'up',
      category: 'technology',
      visible: true
    },
    {
      id: 'cloud-integration',
      title: 'Cloud Technology Integration',
      description: 'Systems and processes using Cloud services',
      value: 49.2,
      previousValue: 43.7,
      format: 'percentage',
      trend: 'up',
      category: 'technology',
      visible: true
    },
    {
      id: 'data-maturity',
      title: 'Data Management Maturity',
      description: 'Ability to manage, analyze, and protect data',
      value: 3.5,
      previousValue: 3.2,
      format: 'rating',
      trend: 'up',
      category: 'technology',
      visible: true
    },
    {
      id: 'supply-chain-agility',
      title: 'Supply Chain Agility',
      description: 'Ability to adapt to changes in demand and market conditions',
      value: 3.8,
      previousValue: 3.5,
      format: 'rating',
      trend: 'up',
      category: 'process',
      visible: true
    },
    {
      id: 'warehouse-digitization',
      title: 'Warehouse Management Digitization',
      description: 'Percentage of digitized warehouse and inventory management',
      value: 51.4,
      previousValue: 46.8,
      format: 'percentage',
      trend: 'up',
      category: 'process',
      visible: true
    }
  ];
};

// Default chart widgets
const defaultCharts: ChartWidget[] = [
  {
    id: 'adoption-trend',
    type: 'line',
    title: 'Industry 4.0 Adoption Trend',
    kpiId: 'companies-with-i40',
    visible: true
  },
  {
    id: 'sector-comparison',
    type: 'bar',
    title: 'I4.0 Adoption by Sector',
    kpiId: 'strategy-adoption',
    visible: true
  },
  {
    id: 'maturity-distribution',
    type: 'pie',
    title: 'Digital Maturity Distribution',
    kpiId: 'digital-maturity',
    visible: true
  },
  {
    id: 'technology-integration',
    type: 'area',
    title: 'Technology Integration Growth',
    kpiId: 'it-integration',
    visible: true
  },
  {
    id: 'process-automation',
    type: 'donut',
    title: 'Process Automation Distribution',
    kpiId: 'production-automation',
    visible: true
  }
];

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [charts, setCharts] = useState<ChartWidget[]>(defaultCharts);
  const [selectedSector, setSelectedSector] = useState<Sector>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => {
      setKpis(generateSampleData());
      setLoading(false);
    }, 1500);
  }, []);

  // Filter KPIs by sector (simulated)
  const filteredKpis = kpis.filter(kpi => kpi.visible);

  // Handle drag-and-drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    setCharts((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Toggle KPI visibility
  const toggleKpiVisibility = (id: string) => {
    setKpis(kpis.map(kpi => 
      kpi.id === id ? { ...kpi, visible: !kpi.visible } : kpi
    ));
  };

  // Toggle chart visibility
  const toggleChartVisibility = (id: string) => {
    setCharts(charts.map(chart => 
      chart.id === id ? { ...chart, visible: !chart.visible } : chart
    ));
  };

  // Add new chart
  const addNewChart = (chartType: ChartWidget['type'], kpiId: string) => {
    const newChart: ChartWidget = {
      id: `chart-${Date.now()}`,
      type: chartType,
      title: `New ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      kpiId,
      visible: true
    };
    
    setCharts([...charts, newChart]);
  };

  // Sortable Chart Component
  const SortableChartItem: React.FC<{ chart: ChartWidget }> = ({ chart }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: chart.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const relatedKpi = kpis.find(kpi => kpi.id === chart.kpiId);
    
    return (
      <div ref={setNodeRef} style={style} className="mb-4">
        <Card>
          <CardHeader className="pb-2 cursor-move" {...attributes} {...listeners}>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{chart.title}</CardTitle>
              {isCustomizing && (
                <Button variant="ghost" size="sm" onClick={() => toggleChartVisibility(chart.id)}>
                  {chart.visible ? 'Hide' : 'Show'}
                </Button>
              )}
            </div>
            <CardDescription>
              {relatedKpi ? relatedKpi.description : 'Chart visualization'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <div className="h-64">
                {chart.type === 'line' && <LineChart kpiId={chart.kpiId} timeRange={timeRange} sector={selectedSector} />}
                {chart.type === 'bar' && <BarChart kpiId={chart.kpiId} timeRange={timeRange} sector={selectedSector} />}
                {chart.type === 'pie' && <PieChart kpiId={chart.kpiId} timeRange={timeRange} sector={selectedSector} />}
                {chart.type === 'area' && <AreaChart kpiId={chart.kpiId} timeRange={timeRange} sector={selectedSector} />}
                {chart.type === 'donut' && <DonutChart kpiId={chart.kpiId} timeRange={timeRange} sector={selectedSector} />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Industry 4.0 Dashboard</h1>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value as Sector)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Sector" />
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
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}>
            <Layout className="h-4 w-4 mr-2" />
            {layout === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          
          <Button onClick={() => setIsCustomizing(!isCustomizing)}>
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
          
          {isCustomizing && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Widget</DialogTitle>
                  <DialogDescription>
                    Select the type of chart and associated KPI you want to add to your dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chart-type" className="text-right">
                      Chart Type
                    </Label>
                    <Select defaultValue="bar">
                      <SelectTrigger id="chart-type" className="col-span-3">
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="donut">Donut Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kpi" className="text-right">
                      KPI
                    </Label>
                    <Select defaultValue="companies-with-i40">
                      <SelectTrigger id="kpi" className="col-span-3">
                        <SelectValue placeholder="Select KPI" />
                      </SelectTrigger>
                      <SelectContent>
                        {kpis.map(kpi => (
                          <SelectItem key={kpi.id} value={kpi.id}>{kpi.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => addNewChart('bar', 'companies-with-i40')}>
                    Add Widget
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {isCustomizing && (
        <Alert className="mb-6">
          <AlertTitle>Customization Mode Active</AlertTitle>
          <AlertDescription>
            Drag and drop widgets to rearrange them. Use the checkboxes to show or hide KPIs and charts.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          {isCustomizing && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="dashboard">
          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i}>
                  <Skeleton className="h-40 w-full mb-2" />
                </div>
              ))}
            </div>
          ) : (
            // KPI cards
            <div className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col'} gap-6 mb-6`}>
              {filteredKpis.map(kpi => (
                <KPICard 
                  key={kpi.id}
                  kpi={kpi}
                  isCustomizing={isCustomizing}
                  onToggleVisibility={toggleKpiVisibility}
                />
              ))}
            </div>
          )}
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-bold mb-4">Visualization Charts</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={charts.map(chart => chart.id)}>
                <div className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col'} gap-6`}>
                  {charts
                    .filter(chart => chart.visible)
                    .map(chart => (
                      <SortableChartItem key={chart.id} chart={chart} />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>All KPIs</CardTitle>
              <CardDescription>
                View and customize all available Key Performance Indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {kpis.map(kpi => (
                    <div key={kpi.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <h3 className="font-medium">{kpi.title}</h3>
                        <p className="text-sm text-gray-500">{kpi.description}</p>
                      </div>
                      {isCustomizing && (
                        <Switch
                          checked={kpi.visible}
                          onCheckedChange={() => toggleKpiVisibility(kpi.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {isCustomizing && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>
                  Customize the appearance and behavior of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-refresh Data</h3>
                      <p className="text-sm text-gray-500">Automatically refresh data every 5 minutes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Data Labels</h3>
                      <p className="text-sm text-gray-500">Display labels on charts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="font-medium mb-2">Charts</h3>
                    <div className="space-y-2">
                      {charts.map(chart => (
                        <div key={chart.id} className="flex items-center justify-between p-2 border rounded">
                          <span>{chart.title}</span>
                          <Switch
                            checked={chart.visible}
                            onCheckedChange={() => toggleChartVisibility(chart.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
export default Dashboard;
