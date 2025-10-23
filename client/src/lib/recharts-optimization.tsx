/**
 * Recharts Optimization Utilities
 * Optimized components and utilities for better performance with Recharts
 */

import React, { Suspense, lazy, memo, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from 'recharts';

// Memoized chart components to prevent unnecessary re-renders
export const OptimizedLineChart = memo(({ data, ...props }: any) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
));
OptimizedLineChart.displayName = 'OptimizedLineChart';

export const OptimizedBarChart = memo(({ data, ...props }: any) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
));
OptimizedBarChart.displayName = 'OptimizedBarChart';

export const OptimizedPieChart = memo(({ data, ...props }: any) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry: any, index: number) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));
OptimizedPieChart.displayName = 'OptimizedPieChart';

export const OptimizedAreaChart = memo(({ data, ...props }: any) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </ResponsiveContainer>
));
OptimizedAreaChart.displayName = 'OptimizedAreaChart';

// Common colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

// Chart loading skeleton
export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="w-full" style={{ height }}>
    <Skeleton className="h-full w-full" />
  </div>
);

// Lazy-loaded chart component for heavy dashboards
export const LazyChart = ({
  type,
  data,
  ...props
}: {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  [key: string]: any;
}) => {
  // Use Suspense for code splitting if needed in the future
  const chartComponents = {
    line: OptimizedLineChart,
    bar: OptimizedBarChart,
    pie: OptimizedPieChart,
    area: OptimizedAreaChart
  };

  const ChartComponent = chartComponents[type] || OptimizedLineChart;

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartComponent data={data} {...props} />
    </Suspense>
  );
};

// Data optimization utilities
export const optimizeChartData = (data: any[], maxSize: number = 100) => {
  if (data.length <= maxSize) return data;

  // Sample data for better performance with large datasets
  const step = Math.ceil(data.length / maxSize);
  return data.filter((_, index) => index % step === 0);
};

// Custom tooltip for better UX
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="font-semibold">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Performance monitoring for charts
export const useChartPerformance = () => {
  const renderStart = React.useRef<number>(0);

  React.useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 100) { // Warn if render takes more than 100ms
          console.warn(`Chart render took ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
};

// Chart configuration presets
export const CHART_PRESETS = {
  default: {
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  },
  compact: {
    margin: { top: 0, right: 10, left: 10, bottom: 0 }
  },
  spacious: {
    margin: { top: 20, right: 50, left: 50, bottom: 20 }
  }
} as const;

// Responsive chart wrapper
export const ResponsiveChartWrapper = ({
  children,
  className = "",
  height = "100%",
  minHeight = 200
}: {
  children: React.ReactElement;
  className?: string;
  height?: string | number;
  minHeight?: number;
}) => (
  <div
    className={className}
    style={{ height, minHeight }}
  >
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

// Export optimized Recharts components
export {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Sector
};