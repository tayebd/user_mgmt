'use client';

import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardChartsProps {
  tasks: Task[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ tasks }) => {
  // Task Status Distribution
  const statusCounts = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = {
    labels: Object.keys(statusCounts).map(status => status.replace(/_/g, ' ')),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(107, 114, 128, 0.5)', // NOT_STARTED - Gray
          'rgba(59, 130, 246, 0.5)',   // IN_PROGRESS - Blue
          'rgba(34, 197, 94, 0.5)',    // COMPLETED - Green
          'rgba(239, 68, 68, 0.5)',    // ON_HOLD - Red
        ],
        borderColor: [
          'rgb(107, 114, 128)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task Priority Distribution
  const priorityCounts = Object.values(TaskPriority).reduce((acc, priority) => {
    acc[priority] = tasks.filter(task => task.priority === priority).length;
    return acc;
  }, {} as Record<string, number>);

  const priorityChartData = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(priorityCounts),
        backgroundColor: [
          'rgba(107, 114, 128, 0.5)', // LOW - Gray
          'rgba(234, 179, 8, 0.5)',    // MEDIUM - Yellow
          'rgba(249, 115, 22, 0.5)',   // HIGH - Orange
          'rgba(239, 68, 68, 0.5)',    // URGENT - Red
        ],
        borderColor: [
          'rgb(107, 114, 128)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-2xs">
        <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
        <div className="aspect-square">
          <Doughnut data={statusChartData} options={options} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-2xs">
        <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
        <div className="aspect-square">
          <Bar data={priorityChartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
