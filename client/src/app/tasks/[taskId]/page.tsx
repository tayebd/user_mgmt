'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TaskPriority, TaskStatus } from '@/types';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { useGetTaskQuery } from '@/state/api';

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { taskId } = params;

  const { data: task, isLoading, error } = useGetTaskQuery({ taskId: taskId as string }, {
    skip: !taskId,
  });

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

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="mb-4 text-red-500">Error loading task. Please try again later.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-2xs dark:bg-gray-800">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Description</h2>
              <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Status</h2>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Priority</h2>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span>Start Date:</span>
                </div>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span>Due Date:</span>
                </div>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg bg-white p-6 shadow-2xs dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Assigned To</h2>
            {task.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200">
                  <User className="h-full w-full p-2 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {task.assignedTo.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No one assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
