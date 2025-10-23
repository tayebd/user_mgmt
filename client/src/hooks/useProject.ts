'use client';

import { useCallback } from 'react';
import { useCRUD, UseCRUDOptions } from './useCRUD';
import { projectService, CreateProjectParams } from '@/services/project-service';
import type { Project, Task } from '@/types';
import { ProjectStatus, TaskStatus, TaskPriority } from '@/types';

/**
 * Map ProjectStatus enum values to API string literal types
 */
function mapProjectStatusToApi(status?: ProjectStatus): 'planning' | 'active' | 'completed' | 'cancelled' | undefined {
  switch (status) {
    case ProjectStatus.NOT_STARTED:
      return 'planning';
    case ProjectStatus.IN_PROGRESS:
      return 'active';
    case ProjectStatus.COMPLETED:
      return 'completed';
    case ProjectStatus.CANCELLED:
      return 'cancelled';
    case ProjectStatus.ON_HOLD:
      return 'planning'; // Map ON_HOLD to planning
    default:
      return undefined;
  }
}

/**
 * Map TaskStatus enum values to API string literal types
 */
function mapTaskStatusToApi(status?: TaskStatus): 'todo' | 'in_progress' | 'completed' | undefined {
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return 'todo';
    case TaskStatus.IN_PROGRESS:
      return 'in_progress';
    case TaskStatus.COMPLETED:
      return 'completed';
    case TaskStatus.BLOCKED:
    case TaskStatus.ON_HOLD:
      return 'todo'; // Map BLOCKED and ON_HOLD to todo
    default:
      return undefined;
  }
}

/**
 * Map TaskPriority enum values to API string literal types
 */
function mapTaskPriorityToApi(priority?: TaskPriority): 'low' | 'medium' | 'high' | undefined {
  switch (priority) {
    case TaskPriority.LOW:
      return 'low';
    case TaskPriority.MEDIUM:
      return 'medium';
    case TaskPriority.HIGH:
      return 'high';
    case TaskPriority.URGENT:
      return 'high'; // Map URGENT to high
    default:
      return undefined;
  }
}

export interface UseProjectReturn extends ReturnType<typeof useCRUD<Project>> {
  // Project-specific actions
  createTask: (projectId: number, task: Partial<Task>) => Promise<Task | null>;
  getTasks: (projectId: number) => Promise<Task[]>;
  updateTask: (taskId: number, task: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: number) => Promise<boolean>;
  completeTask: (taskId: number) => Promise<boolean>;

  // Project lifecycle
  start: (projectId: number) => Promise<boolean>;
  pause: (projectId: number) => Promise<boolean>;
  complete: (projectId: number) => Promise<boolean>;
  archive: (projectId: number) => Promise<boolean>;

  // Collaboration
  assignTeamMember: (projectId: number, userId: number, role: string) => Promise<boolean>;
  removeTeamMember: (projectId: number, userId: number) => Promise<boolean>;
}

/**
 * Project-specific CRUD hook with task management
 */
export function useProject(): UseProjectReturn {
  // CRUD configuration for projects
  const projectCRUD = useCRUD<Project>({
    create: async (data: Partial<Project>) => {
      // Filter data to match CreateProjectParams interface
      const filteredData: CreateProjectParams = {
        name: data.name || '',
        description: data.description || undefined, // Convert null to undefined
        companyId: data.companyId,
        userId: data.userId,
        status: mapProjectStatusToApi(data.status) || 'planning',
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        budget: data.budget,
      };

      const result = await projectService.createProject(filteredData);
      return { data: result || undefined, error: undefined };
    },
    read: async () => {
      const projects = await projectService.getProjects();
      return { data: projects, error: undefined };
    },
    update: async (id: string | number, data: Partial<Project>) => {
      // Filter data to match CreateProjectParams interface
      const filteredData: Partial<CreateProjectParams> = {
        name: data.name,
        description: data.description || undefined, // Convert null to undefined
        companyId: data.companyId,
        userId: data.userId,
        status: data.status ? mapProjectStatusToApi(data.status) : undefined,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        budget: data.budget,
      };

      const result = await projectService.updateProject(Number(id), filteredData);
      return { data: result || undefined, error: undefined };
    },
    delete: async (id: string | number) => {
      const result = await projectService.deleteProject(Number(id));
      return { data: undefined, error: result ? undefined : 'Failed to delete project' };
    },

    // Success messages
    successMessages: {
      create: 'Project created successfully',
      update: 'Project updated successfully',
      delete: 'Project deleted successfully',
    },

    // Error messages
    errorMessages: {
      create: 'Failed to create project',
      update: 'Failed to update project',
      delete: 'Failed to delete project',
    },

    // Validation
    validateOnCreate: (data) => {
      if (!data.name) return 'Project name is required';
      if (!data.companyId) return 'Company is required';
      if (!data.startDate) return 'Start date is required';
      return null;
    },

    validateOnUpdate: (data) => {
      if (!data.name) return 'Project name is required';
      if (!data.companyId) return 'Company is required';
      return null;
    },

    // Optimistic updates for project management
    optimisticUpdates: true,
  });

  // Task management functions
  const createTask = useCallback(async (projectId: number, task: Partial<Task>): Promise<Task | null> => {
    try {
      const result = await projectService.createTask({
        title: task.title || '',
        description: task.description || '',
        projectId,
        status: 'todo',
        priority: mapTaskPriorityToApi(task.priority) || 'medium',
        dueDate: task.dueDate?.toISOString(),
      });
      if (!result) {
        throw new Error('Failed to create task');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      projectCRUD.setError(errorMessage);
      return null;
    }
  }, [projectCRUD]);

  const getTasks = useCallback(async (projectId: number): Promise<Task[]> => {
    try {
      const tasks = await projectService.getTasksByProject(projectId);
      return tasks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      projectCRUD.setError(errorMessage);
      return [];
    }
  }, [projectCRUD]);

  const updateTask = useCallback(async (taskId: number, task: Partial<Task>): Promise<Task | null> => {
    try {
      const result = await projectService.updateTask(taskId, {
        title: task.title,
        description: task.description || undefined,
        status: mapTaskStatusToApi(task.status),
        priority: mapTaskPriorityToApi(task.priority),
        dueDate: task.dueDate?.toISOString(),
      });
      if (!result) {
        throw new Error('Failed to update task');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      projectCRUD.setError(errorMessage);
      return null;
    }
  }, [projectCRUD]);

  const deleteTask = useCallback(async (taskId: number): Promise<boolean> => {
    try {
      const result = await projectService.deleteTask(taskId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  const completeTask = useCallback(async (taskId: number): Promise<boolean> => {
    const result = await projectService.updateTaskStatus(taskId, 'completed');
    return result !== null;
  }, []);

  // Project lifecycle functions
  const start = useCallback(async (projectId: number): Promise<boolean> => {
    try {
      const result = await projectService.updateProject(projectId, {
        status: 'active',
      });
      if (!result) {
        throw new Error('Failed to start project');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start project';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  const pause = useCallback(async (projectId: number): Promise<boolean> => {
    try {
      const result = await projectService.updateProject(projectId, {
        status: 'planning',
      });
      if (!result) {
        throw new Error('Failed to pause project');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause project';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  const complete = useCallback(async (projectId: number): Promise<boolean> => {
    try {
      const result = await projectService.updateProject(projectId, {
        status: 'completed',
      });
      if (!result) {
        throw new Error('Failed to complete project');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete project';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  const archive = useCallback(async (projectId: number): Promise<boolean> => {
    try {
      const result = await projectService.updateProject(projectId, {
        status: 'cancelled',
      });
      if (!result) {
        throw new Error('Failed to archive project');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive project';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  // Collaboration functions (placeholders for future implementation)
  const assignTeamMember = useCallback(async (projectId: number, userId: number, role: string): Promise<boolean> => {
    try {
      // Note: This would need to be implemented in the service
      throw new Error('Team member assignment not yet implemented');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign team member';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  const removeTeamMember = useCallback(async (projectId: number, userId: number): Promise<boolean> => {
    try {
      // Note: This would need to be implemented in the service
      throw new Error('Team member removal not yet implemented');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove team member';
      projectCRUD.setError(errorMessage);
      return false;
    }
  }, [projectCRUD]);

  return {
    // CRUD actions from base hook
    ...projectCRUD,

    // Project-specific actions
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    completeTask,

    // Lifecycle
    start,
    pause,
    complete,
    archive,

    // Collaboration
    assignTeamMember,
    removeTeamMember,
  };
}

export default useProject;