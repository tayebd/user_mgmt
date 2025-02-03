import { create } from 'zustand';

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
