import React from 'react';
// import { Card, CardContent } from "@/components/ui/card";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart as RechartsAreaChart, 
  Area, Sector  } from 'recharts'; // RadialBarChart, RadialBar

// Types definitions
type Sector = 'All' | 'Agri-food' | 'Textiles' | 'Manufacturing' | 'Electronics' | 'Automotive';
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface ChartProps {
  kpiId: string;
  timeRange: TimeRange;
  sector: Sector;
}

// Sample data generators for different chart types
const generateTimeSeriesData = (kpiId: string, timeRange: TimeRange, sector: Sector) => {
  let dataPoints = 0;
  let startValue = 0;
  let increment = 0;
  let volatility = 0;

  // Determine number of data points based on time range
  switch (timeRange) {
    case '7d':
      dataPoints = 7;
      break;
    case '30d':
      dataPoints = 12;
      break;
    case '90d':
      dataPoints = 12;
      break;
    case '1y':
      dataPoints = 12;
      break;
  }

  // Set starting value and increment based on KPI
  if (kpiId.includes('maturity') || kpiId.includes('level')) {
    startValue = 1.5;
    increment = 0.15;
    volatility = 0.1;
  } else if (kpiId.includes('percentage') || kpiId.includes('rate')) {
    startValue = 30;
    increment = 1.5;
    volatility = 3;
  } else if (kpiId.includes('personnel')) {
    startValue = 8000;
    increment = 500;
    volatility = 1000;
  } else {
    startValue = 40;
    increment = 2;
    volatility = 5;
  }

  // Apply sector filter (simulated effect)
  if (sector !== 'All') {
    // Each sector has slightly different starting points and growth rates
    const sectorMultipliers: Record<string, number> = {
      'Agri-food': 0.85,
      'Textiles': 0.9,
      'Manufacturing': 1.2,
      'Electronics': 1.4,
      'Automotive': 1.3
    };
    startValue *= sectorMultipliers[sector] || 1;
    increment *= sectorMultipliers[sector] || 1;
  }

  // Generate data points
  const data = [];
  let currentValue = startValue;

  for (let i = 0; i < dataPoints; i++) {
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility) / 100;
    currentValue += increment * randomFactor;
    
    // Format date label based on time range
    let name = '';
    switch (timeRange) {
      case '7d':
        // Last 7 days
        const date = new Date();
        date.setDate(date.getDate() - (dataPoints - i - 1));
        name = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case '30d':
        // Last 30 days (show weeks)
        name = `Week ${i + 1}`;
        break;
      case '90d':
        // Last 90 days (show months)
        name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
        break;
      case '1y':
        // Last year (show months)
        name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
        break;
    }

    data.push({
      name,
      value: Math.round(currentValue * 10) / 10,
      previous: Math.round((currentValue - increment) * 10) / 10
    });
  }

  return data;
};

const generateSectorData = (kpiId: string) => {
  // Base values for different sectors
  const sectors = ['Agri-food', 'Textiles', 'Manufacturing', 'Electronics', 'Automotive'];
  const baseValues = {
    'Agri-food': 35,
    'Textiles': 42,
    'Manufacturing': 58,
    'Electronics': 72,
    'Automotive': 65
  };
  
  // Modifier based on KPI type
  let modifier = 1;
  if (kpiId.includes('maturity') || kpiId.includes('level')) {
    modifier = 0.05; // Scale down for ratings/levels
  } else if (kpiId.includes('personnel')) {
    modifier = 250; // Scale up for personnel counts
  }

  return sectors.map(sector => ({
    name: sector,
    value: Math.round(baseValues[sector as keyof typeof baseValues] * modifier * (0.9 + Math.random() * 0.2)),
    fill: getColorForSector(sector)
  }));
};

const generateMaturityData = () => {
  return [
    { name: 'Beginner', value: 35, fill: '#FF8042' },
    { name: 'Intermediate', value: 40, fill: '#FFBB28' },
    { name: 'Advanced', value: 20, fill: '#00C49F' },
    { name: 'Expert', value: 5, fill: '#0088FE' }
  ];
};

const getColorForSector = (sector: string) => {
  const colors = {
    'Agri-food': '#0088FE',
    'Textiles': '#00C49F',
    'Manufacturing': '#FFBB28',
    'Electronics': '#FF8042',
    'Automotive': '#8884d8'
  };
  return colors[sector as keyof typeof colors] || '#8884d8';
};

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];

// Line Chart Component
export const LineChart: React.FC<ChartProps> = ({ kpiId, timeRange, sector }) => {
  const data = generateTimeSeriesData(kpiId, timeRange, sector);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          strokeWidth={2} 
        />
        <Line 
          type="monotone" 
          dataKey="previous" 
          stroke="#82ca9d" 
          strokeDasharray="5 5" 
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart Component
export const BarChart: React.FC<ChartProps> = ({ kpiId }) => {   // ,sector
  const data = generateSectorData(kpiId);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Pie Chart Component
export const PieChart: React.FC<ChartProps> = () => {
  const data = generateMaturityData();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Area Chart Component
export const AreaChart: React.FC<ChartProps> = ({ kpiId, timeRange, sector }) => {
  const data = generateTimeSeriesData(kpiId, timeRange, sector);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
        />
        <Area 
          type="monotone" 
          dataKey="previous" 
          stroke="#82ca9d" 
          fillOpacity={1} 
          fill="url(#colorPrevious)" 
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

// Donut Chart Component
export const DonutChart: React.FC<ChartProps> = () => {
  // Sample data for automation levels
  const data = [
    { name: 'Fully Automated', value: 25, fill: '#0088FE' },
    { name: 'Semi-Automated', value: 30, fill: '#00C49F' },
    { name: 'Partial Automation', value: 28, fill: '#FFBB28' },
    { name: 'Manual with Digital', value: 12, fill: '#FF8042' },
    { name: 'Fully Manual', value: 5, fill: '#8884d8' }
  ];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};