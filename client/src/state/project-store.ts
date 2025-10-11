import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { handleApiError, useErrorHandler } from '@/utils/error-handling';

// Import shared types from server
import type { PVProject, PVPanel, Inverter } from '@/shared/types';

interface ProjectState {
  pvProjects: PVProject[];
  currentPVProject: PVProject | null;
  pvPanels: PVPanel[];
  inverters: Inverter[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPVPanels: (page?: number, limit?: number) => Promise<void>;
  fetchPVPanelById: (panelId: number) => Promise<PVPanel>;
  fetchInverters: (page?: number, limit?: number) => Promise<void>;
  fetchPVProject: () => Promise<PVProject>;
  createPVProject: (project: PVProject) => Promise<PVProject>;
  updatePVProject: (projectId: number, project: Partial<PVProject>) => Promise<void>;
  deletePVProject: (projectId: number) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  pvProjects: [],
  currentPVProject: null,
  pvPanels: [],
  inverters: [],
  isLoading: false,
  error: null,

  fetchPVPanels: async (page = 1, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getPVPanels(page, limit);
      if (Array.isArray(response.data)) {
        set({ pvPanels: response.data, isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch PV panels');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPVPanelById: async (panelId: number): Promise<PVPanel> => {
    try {
      const response = await apiClient.getPVPanelById(panelId);

      if (!response.data || !response.data.id) {
        throw new Error('Invalid PV panel data received');
      }

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch PV panel');
      throw new Error(errorMessage);
    }
  },

  fetchInverters: async (page = 1, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getInverters(page, limit);
      if (Array.isArray(response.data)) {
        set({ inverters: response.data, isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch inverters');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPVProject: async (): Promise<PVProject> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getPVProject();

      if (!response.data) {
        throw new Error('Invalid project data received');
      }

      set({ currentPVProject: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch project');
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  createPVProject: async (project: PVProject): Promise<PVProject> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createPVProject(project);

      if (!response.data || !response.data.id) {
        throw new Error('Invalid project data received from server');
      }

      // Update store
      const { pvProjects } = get();
      set({
        pvProjects: [...pvProjects, response.data],
        currentPVProject: response.data,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create project');
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updatePVProject: async (projectId: number, project: Partial<PVProject>): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updatePVProject(projectId, project);

      if (!response.data) {
        throw new Error('Failed to update project');
      }

      // Update store
      const { pvProjects } = get();
      set({
        pvProjects: pvProjects.map(p => p.id === projectId ? response.data : p),
        currentPVProject: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update project');
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deletePVProject: async (projectId: number): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deletePVProject(projectId);

      // Update store
      const { pvProjects } = get();
      set({
        pvProjects: pvProjects.filter(p => p.id !== projectId),
        currentPVProject: null,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete project');
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));