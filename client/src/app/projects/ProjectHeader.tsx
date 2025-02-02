'use client';

import React from 'react';
import { useGetProjectQuery } from '@/state/api';
import { Plus } from 'lucide-react';

interface ProjectHeaderProps {
  projectId: string;
  onNewTask: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectId, onNewTask }) => {
  const { data: project, isLoading } = useGetProjectQuery(projectId);

  if (isLoading) {
    return (
      <div className="bg-white border-b px-6 py-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white border-b px-6 py-4">
        <div className="text-red-500">Error loading project</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <button
          onClick={onNewTask}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-2xs text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;
