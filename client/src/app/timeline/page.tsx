'use client';

import React, { useMemo, useState } from 'react';
import { useGetProjectsQuery } from '@/state/api';
import { Project } from '@/types';
import Header from '@/components/Header';
import { DisplayOption, Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

type TaskTypeItems = 'task' | 'milestone' | 'project';

const Timeline = () => {
  const { data: projects, isLoading, error } = useGetProjectsQuery();
  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: 'en-US',
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !projects) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading timeline data. Please try again later.</p>
      </div>
    );
  }

  const ganttTasks = projects.map((project) => {
    const completedTasks = project.tasks.filter((task) => task.status === 'COMPLETED').length;
    const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;

    return {
      start: new Date(project.startDate),
      end: new Date(project.endDate),
      name: project.name,
      id: project.id,
      type: 'project' as TaskTypeItems,
      progress,
      isDisabled: false,
      project: project.id,
      styles: { progressColor: '#0284c7', progressSelectedColor: '#0284c7' },
    };
  });

  // Add tasks to the Gantt chart
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      ganttTasks.push({
        start: new Date(task.createdAt),
        end: new Date(task.dueDate),
        name: task.title,
        id: task.id,
        type: 'task' as TaskTypeItems,
        progress: task.status === 'COMPLETED' ? 100 : task.status === 'IN_PROGRESS' ? 50 : 0,
        isDisabled: false,
        project: project.id,
        styles: {
          progressColor: task.status === 'COMPLETED' ? '#22c55e' : '#eab308',
          progressSelectedColor: task.status === 'COMPLETED' ? '#22c55e' : '#eab308',
        },
      });
    });
  });

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  return (
    <div className="h-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <Header name="Timeline" />
        <select
          value={displayOptions.viewMode}
          onChange={handleViewModeChange}
          className="rounded border border-gray-300 bg-white px-3 py-2 shadow-2xs focus:border-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value={ViewMode.QuarterDay}>Quarter Day</option>
          <option value={ViewMode.HalfDay}>Half Day</option>
          <option value={ViewMode.Day}>Day</option>
          <option value={ViewMode.Week}>Week</option>
          <option value={ViewMode.Month}>Month</option>
          <option value={ViewMode.Year}>Year</option>
        </select>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-2xs dark:bg-gray-800">
        {ganttTasks.length > 0 ? (
          <Gantt
            tasks={ganttTasks}
            viewMode={displayOptions.viewMode}
            locale={displayOptions.locale}
            listCellWidth=""
            columnWidth={60}
            ganttHeight={400}
            barCornerRadius={4}
            barFill={80}
            rowHeight={50}
            handleWidth={8}
            todayColor="rgba(252, 211, 77, 0.3)"
            projectProgressColor="#22c55e"
            projectBackgroundColor="#f3f4f6"
            projectBackgroundSelectedColor="#e5e7eb"
            barProgressColor="#22c55e"
            barProgressSelectedColor="#22c55e"
            barBackgroundColor="#e5e7eb"
            barBackgroundSelectedColor="#d1d5db"
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No projects or tasks to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
