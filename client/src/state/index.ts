import { create } from 'zustand';

// Export all stores for easy imports
export { useUserStore } from './user-store';
export { useOrganizationStore } from './organization-store';
export { useSurveyStore } from './survey-store';
export { useProjectStore } from './project-store';

// Export legacy API store for backward compatibility
export { useApiStore } from './api';

// Export types
export type { ApiError, ApiResponse } from '@/lib/api-client';

// Export utilities
export { useErrorHandler } from '@/utils/error-handling';

// Global UI state
export interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsDarkMode: (darkMode: boolean) => void;
}

const useStore = create<GlobalState>((set) => ({
  isSidebarCollapsed: false,
  isDarkMode: false,
  setIsSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
  setIsDarkMode: (darkMode: boolean) => set({ isDarkMode: darkMode }),
}));

export default useStore;
