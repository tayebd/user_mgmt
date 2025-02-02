'use client';

import React from 'react';
import { useGetTasksByUserQuery } from '@/state/api';
import { useAuth } from '@/contexts/AuthContext';
import { TaskPriority } from '@/types';
import TaskCard from '@/components/TaskCard';
import Header from '@/components/Header';

interface ReusablePriorityPageProps {
  priority: TaskPriority;
  title: string;
  description: string;
}

const ReusablePriorityPage: React.FC<ReusablePriorityPageProps> = ({
  priority,
  title,
  description,
}) => {
  const { user } = useAuth();
  const { data: tasks, isLoading, error } = useGetTasksByUserQuery(user?.uid || '');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !tasks) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading tasks. Please try again later.</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => task.priority === priority);

  return (
    <div className="container mx-auto px-4 py-8">
      <Header name={title} />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            <p>No {priority.toLowerCase()} priority tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusablePriorityPage;
