'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProjectsQuery, useGetTasksByUserQuery } from '@/state/api';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import DashboardCharts from '@/components/DashboardCharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const { 
    data: projects, 
    isLoading: projectsLoading,
    error: projectsError
  } = useGetProjectsQuery(undefined, {
    skip: !user?.uid
  });
  
  const { 
    data: tasks, 
    isLoading: tasksLoading,
    error: tasksError 
  } = useGetTasksByUserQuery(user?.uid || '', {
    skip: !user?.uid
  });

  useEffect(() => {
    console.log('Dashboard state:', {
      user: user ? { uid: user.uid, email: user.email } : null,
      loading,
      projectsLoading,
      tasksLoading,
      projectsCount: projects?.length,
      tasksCount: tasks?.length,
      projectsError,
      tasksError
    });

    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
    }
  }, [loading, user, router, projects, tasks, projectsLoading, tasksLoading, projectsError, tasksError]);

  if (loading || projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (projectsError || tasksError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                {projectsError ? 'Error loading projects. ' : ''}
                {tasksError ? 'Error loading tasks. ' : ''}
                Please try refreshing the page.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Charts Section */}
      {tasks && tasks.length > 0 && (
        <DashboardCharts tasks={tasks} />
      )}
      
      {/* Projects Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Projects</h2>
          <button
            onClick={() => router.push('/projects/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            New Project
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {projects?.length === 0 && (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No projects found. Create a new project to get started!</p>
            </div>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Tasks</h2>
          <button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            New Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks?.slice(0, 6).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks?.length === 0 && (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No tasks found. Create a new task to get started!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
