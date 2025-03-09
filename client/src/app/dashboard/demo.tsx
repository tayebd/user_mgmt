import React from 'react'; //{ useState } 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart } from 'recharts';

// Simple demo to show the dashboard layout
const IndustryDashboardDemo = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample KPI data
  const kpis = [
    {
      title: "Companies with I4.0 Solutions",
      value: "42.7%",
      change: "+4.5%",
      trend: "up"
    },
    {
      title: "Digital Maturity Rate",
      value: "2.4/4",
      change: "+0.3",
      trend: "up"
    },
    {
      title: "Personnel Mastering I4.0",
      value: "15,438",
      change: "+2,488",
      trend: "up"
    },
    {
      title: "Production Automation",
      value: "45.7%",
      change: "+4.2%",
      trend: "up"
    }
  ];
  
  // Sample data for charts
  const lineData = [
    { name: 'Jan', value: 35 },
    { name: 'Feb', value: 38 },
    { name: 'Mar', value: 40 },
    { name: 'Apr', value: 43 },
    { name: 'May', value: 45 }
  ];
  
  const barData = [
    { name: 'Agri-food', value: 35 },
    { name: 'Textiles', value: 42 },
    { name: 'Manufacturing', value: 58 },
    { name: 'Electronics', value: 72 },
    { name: 'Automotive', value: 65 }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Industry 4.0 Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Customize</Button>
          <Button size="sm">Export</Button>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
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
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Industry 4.0 Adoption Trend</CardTitle>
                <CardDescription>Monthly evolution of adoption rate</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>I4.0 Adoption by Sector</CardTitle>
                <CardDescription>Comparison across industries</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
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