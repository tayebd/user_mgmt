/**
 * Project Service
 * Handles all project-related API operations (PV projects, regular projects, tasks)
 * Extracted from the monolithic API store
 */

import { apiClient, ApiResponse } from './api-client';
import { Project, Task, TaskStatus } from '@/types';
import type { PVProject } from '@/shared/types';

export interface CreateProjectParams {
  name: string;
  description?: string;
  organizationId?: number;
  userId?: number;
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export type CreatePVProjectParams = Pick<PVProject,
  'name' | 'panels' | 'arrays' | 'inverters' | 'batteryBanks' |
  'chargeControllers' | 'loads' | 'protectionDevices' | 'wires' |
  'mountingHardware' | 'status' | 'address' | 'latitude' | 'longitude' |
  'timezone' | 'elevation'
>;

export interface CreateTaskParams {
  title: string;
  description?: string;
  projectId?: number;
  userId?: number;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface ProjectSearchParams {
  query?: string;
  status?: string;
  organizationId?: number;
  userId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Project Service Class
 * Provides methods for project and task management
 */
export class ProjectService {
  /**
   * Fetch all projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects');

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to fetch projects:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single project by ID
   */
  async getProjectById(projectId: number): Promise<Project | null> {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to fetch project ${projectId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Create a new project
   */
  async createProject(projectData: CreateProjectParams): Promise<Project | null> {
    const response = await apiClient.post<Project>('/projects', projectData, true);

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to create project:', response.error);
      return null;
    }

    console.log('[Project Service] Project created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: number, projectData: Partial<CreateProjectParams>): Promise<Project | null> {
    const response = await apiClient.put<Project>(`/projects/${projectId}`, projectData, true);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to update project ${projectId}:`, response.error);
      return null;
    }

    console.log(`[Project Service] Project ${projectId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: number): Promise<boolean> {
    const response = await apiClient.delete(`/projects/${projectId}`, true);

    if (!response.ok) {
      console.error(`[Project Service] Failed to delete project ${projectId}:`, response.error);
      return false;
    }

    console.log(`[Project Service] Project ${projectId} deleted successfully`);
    return true;
  }

  /**
   * Search projects with filters
   */
  async searchProjects(params: ProjectSearchParams): Promise<{
    items: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.status) queryParams.append('status', params.status);
    if (params.organizationId) queryParams.append('organizationId', params.organizationId.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/projects/search?${queryParams.toString()}`);

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to search projects:', response.error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };
    }

    return response.data as {
      items: Project[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }

  // PV Project Methods

  /**
   * Fetch all PV projects
   */
  async getPVProjects(): Promise<PVProject[]> {
    const response = await apiClient.get<PVProject[]>('/pv-projects');

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to fetch PV projects:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single PV project by ID
   */
  async getPVProjectById(projectId: number): Promise<PVProject | null> {
    const response = await apiClient.get<PVProject>(`/pv-projects/${projectId}`);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to fetch PV project ${projectId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Create a new PV project
   */
  async createPVProject(projectData: CreatePVProjectParams): Promise<PVProject | null> {
    const response = await apiClient.post<PVProject>('/pv-projects', projectData, true);

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to create PV project:', response.error);
      return null;
    }

    console.log('[Project Service] PV project created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing PV project
   */
  async updatePVProject(projectId: number, projectData: Partial<CreatePVProjectParams>): Promise<PVProject | null> {
    const response = await apiClient.put<PVProject>(`/pv-projects/${projectId}`, projectData, true);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to update PV project ${projectId}:`, response.error);
      return null;
    }

    console.log(`[Project Service] PV project ${projectId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a PV project
   */
  async deletePVProject(projectId: number): Promise<boolean> {
    const response = await apiClient.delete(`/pv-projects/${projectId}`, true);

    if (!response.ok) {
      console.error(`[Project Service] Failed to delete PV project ${projectId}:`, response.error);
      return false;
    }

    console.log(`[Project Service] PV project ${projectId} deleted successfully`);
    return true;
  }

  /**
   * Generate PV project simulation and report
   */
  async generatePVProjectReport(projectId: number): Promise<{
    success: boolean;
    reportUrl?: string;
    simulationResults?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/simulate-and-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await apiClient.getAuthHeaders()),
        },
        body: JSON.stringify({ projectId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`[Project Service] Failed to generate report for PV project ${projectId}:`, error);
        return {
          success: false,
          error: error.message || 'Report generation failed',
        };
      }

      const result = await response.json();
      console.log(`[Project Service] Report generated for PV project ${projectId}:`, result);
      return {
        success: true,
        reportUrl: result.reportUrl,
        simulationResults: result.simulationResults,
      };
    } catch (error) {
      console.error(`[Project Service] Report generation error for PV project ${projectId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Task Methods

  /**
   * Fetch all tasks
   */
  async getTasks(page = 1, limit = 50): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/tasks?page=${page}&limit=${limit}`);

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to fetch tasks:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch tasks for a specific project
   */
  async getTasksByProject(projectId: number): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to fetch tasks for project ${projectId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch tasks for a specific user
   */
  async getTasksByUser(userId: number): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/users/${userId}/tasks`);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to fetch tasks for user ${userId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskParams): Promise<Task | null> {
    const response = await apiClient.post<Task>('/tasks', taskData, true);

    if (!response.ok || !response.data) {
      console.error('[Project Service] Failed to create task:', response.error);
      return null;
    }

    console.log('[Project Service] Task created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: number, taskData: Partial<CreateTaskParams>): Promise<Task | null> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, taskData, true);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to update task ${taskId}:`, response.error);
      return null;
    }

    console.log(`[Project Service] Task ${taskId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<boolean> {
    const response = await apiClient.delete(`/tasks/${taskId}`, true);

    if (!response.ok) {
      console.error(`[Project Service] Failed to delete task ${taskId}:`, response.error);
      return false;
    }

    console.log(`[Project Service] Task ${taskId} deleted successfully`);
    return true;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: number, status: 'todo' | 'in_progress' | 'completed'): Promise<Task | null> {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/status`, { status }, true);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to update task ${taskId} status:`, response.error);
      return null;
    }

    console.log(`[Project Service] Task ${taskId} status updated to ${status}:`, response.data);
    return response.data;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
  } | null> {
    const response = await apiClient.get(`/projects/${projectId}/stats`);

    if (!response.ok || !response.data) {
      console.error(`[Project Service] Failed to fetch stats for project ${projectId}:`, response.error);
      return null;
    }

    return response.data as {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      completionRate: number;
    };
  }

  /**
   * Validate project data
   */
  validateProjectData(data: CreateProjectParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (data.name && data.name.length > 200) {
      errors.push('Project name must be less than 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Project description must be less than 2000 characters');
    }

    if (data.budget && (data.budget < 0 || data.budget > 999999999)) {
      errors.push('Budget must be between 0 and 999,999,999');
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate task data
   */
  validateTaskData(data: CreateTaskParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Task title must be less than 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Task description must be less than 2000 characters');
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const now = new Date();
      if (dueDate < now) {
        errors.push('Due date cannot be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate project completion percentage
   */
  calculateProjectCompletion(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Get overdue tasks
   */
  getOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date();
    return tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) < now &&
      task.status !== TaskStatus.COMPLETED
    );
  }

  /**
   * Get upcoming tasks (due within 7 days)
   */
  getUpcomingTasks(tasks: Task[]): Task[] {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= weekFromNow &&
      task.status !== TaskStatus.COMPLETED
    );
  }
}

// Create singleton instance
export const projectService = new ProjectService();