import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

// KPI type definition (same as in main component)
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

interface KPICardProps {
  kpi: KPI;
  isCustomizing: boolean;
  onToggleVisibility: (id: string) => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, isCustomizing, onToggleVisibility }) => {
  // Format the KPI value based on its type
  const formatValue = (value: number, format: KPI['format']) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value.toLocaleString();
      case 'level':
        return `${value}/4`; // Assuming 4 is the max level
      case 'rating':
        return `${value}/5`; // Assuming 5 is the max rating
      default:
        return value.toString();
    }
  };

  // Calculate percent change
  const percentChange = ((kpi.value - kpi.previousValue) / kpi.previousValue * 100).toFixed(1);
  
  // Determine background color based on category
  const getCategoryColor = (category: KPI['category']) => {
    switch (category) {
      case 'adoption':
        return 'bg-blue-50 dark:bg-blue-950';
      case 'maturity':
        return 'bg-green-50 dark:bg-green-950';
      case 'integration':
        return 'bg-purple-50 dark:bg-purple-950';
      case 'personnel':
        return 'bg-yellow-50 dark:bg-yellow-950';
      case 'process':
        return 'bg-orange-50 dark:bg-orange-950';
      case 'technology':
        return 'bg-indigo-50 dark:bg-indigo-950';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  // Determine text color for trend
  const getTrendColor = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Trend icon
  const TrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className={`${getCategoryColor(kpi.category)} h-full transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{kpi.title}</CardTitle>
          {isCustomizing && (
            <Switch
              checked={kpi.visible}
              onCheckedChange={() => onToggleVisibility(kpi.id)}
              aria-label={`Toggle visibility of ${kpi.title}`}
            />
          )}
        </div>
        <CardDescription>{kpi.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">
            {formatValue(kpi.value, kpi.format)}
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon />
            <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
              {kpi.trend !== 'neutral' ? `${percentChange}%` : 'No change'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Previous: {formatValue(kpi.previousValue, kpi.format)}
        </div>
      </CardContent>
    </Card>
  );
};