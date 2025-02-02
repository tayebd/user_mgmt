import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Project, Task, User, SolarCompany } from '@/types';
import { auth } from '@/lib/firebase';

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

// Helper function to get the current auth token
const getAuthToken = async () => {
  try {
    return await auth.currentUser?.getIdToken(true);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Projects', 'Tasks', 'Users', 'SolarCompanies'],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => ({
        url: 'projects',
        method: 'GET',
      }),
      providesTags: ['Projects'],
    }),

    getProject: build.query<Project, string>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: 'GET',
      }),
      providesTags: ['Projects'],
    }),

    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: 'projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Projects'],
    }),

    updateProject: build.mutation<Project, { projectId: string; project: Partial<Project> }>({
      query: ({ projectId, project }) => ({
        url: `projects/${projectId}`,
        method: 'PATCH',
        body: project,
      }),
      invalidatesTags: ['Projects'],
    }),

    deleteProject: build.mutation<void, string>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects', 'Tasks'],
    }),

    getTasks: build.query<Task[], string>({
      query: (projectId) => ({
        url: `tasks/project/${projectId}`,
        method: 'GET',
      }),
      providesTags: ['Tasks'],
    }),

    getTask: build.query<Task, { taskId: string }>({
      query: ({ taskId }) => ({
        url: `tasks/${taskId}`,
        method: 'GET',
      }),
      providesTags: ['Tasks'],
    }),

    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: 'tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Tasks'],
    }),

    updateTask: build.mutation<Task, { taskId: string; task: Partial<Task> }>({
      query: ({ taskId, task }) => ({
        url: `tasks/${taskId}`,
        method: 'PUT',
        body: task,
      }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTask: build.mutation<void, string>({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),

    getUsers: build.query<User[], void>({
      query: () => ({
        url: 'users',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    getUser: build.query<User, string>({
      query: (userId) => ({
        url: `users/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    getTasksByUser: build.query<Task[], string>({
      query: (userId) => ({
        url: `tasks/user/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Tasks'],
    }),

    searchItems: build.query<SearchResults, string>({
      query: (searchTerm) => ({
        url: `search?q=${encodeURIComponent(searchTerm)}`,
        method: 'GET',
      }),
    }),

    getSolarCompanies: build.query<SolarCompany[], void>({
      query: () => ({
        url: 'solar-companies',
        method: 'GET',
      }),
      providesTags: ['SolarCompanies'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useGetTasksByUserQuery,
  useSearchItemsQuery,
  useGetSolarCompaniesQuery,
} = api;
