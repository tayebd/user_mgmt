'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.ON_HOLD:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/projects/${task.projectId}/tasks/${task.id}`}
          className="block transform rounded-lg bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800"
        >
          <div className="mb-4">
            <h3 className="mb-2 text-xl font-semibold dark:text-white">{task.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
          </div>

          <div className="mb-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {new Date(task.dueDate) < new Date()
                  ? 'Overdue'
                  : `${Math.ceil(
                      (new Date(task.dueDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days left`}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Assigned to: {task.assignedTo?.name}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TaskList;
