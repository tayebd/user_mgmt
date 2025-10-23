/**
 * Equipment Store
 * Zustand store for equipment-related state management
 * Extracted from the monolithic API store
 */

import { create } from 'zustand';
import type { PVPanel, Inverter } from '@/types/solar';
import { equipmentService, EquipmentSearchParams } from '@/services/equipment-service';

export interface EquipmentState {
  // PV Panels
  pvPanels: PVPanel[];
  currentPanel: PVPanel | null;
  popularPanels: PVPanel[];
  panelManufacturers: string[];
  panelSearchResults: PVPanel[];

  // Inverters
  inverters: Inverter[];
  currentInverter: Inverter | null;
  popularInverters: Inverter[];
  inverterManufacturers: string[];
  inverterSearchResults: Inverter[];

  // Compatibility
  compatibleInverters: Inverter[];
  compatiblePanels: PVPanel[];

  // Recommendations and comparisons
  panelRecommendations: PVPanel[];
  inverterRecommendations: Inverter[];
  comparisonResults: {
    panels?: { comparison: PVPanel[]; analysis: { bestEfficiency: PVPanel; bestPower: PVPanel; bestValue: PVPanel; mostReliable: PVPanel; } };
    inverters?: { comparison: Inverter[]; analysis: { bestEfficiency: Inverter; bestPower: Inverter; bestValue: Inverter; mostReliable: Inverter; } };
  };

  // Loading and error states
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  // Pagination
  currentPanelPage: number;
  totalPanelPages: number;
  totalPanels: number;
  currentInverterPage: number;
  totalInverterPages: number;
  totalInverters: number;

  // Search filters
  panelSearchFilters: EquipmentSearchParams;
  inverterSearchFilters: EquipmentSearchParams;

  // Actions - PV Panels
  fetchPVPanels: (page?: number, limit?: number) => Promise<void>;
  fetchPVPanelById: (panelId: number) => Promise<PVPanel | null>;
  fetchPopularPVPanels: (limit?: number) => Promise<void>;
  fetchPVPanelManufacturers: () => Promise<void>;
  searchPVPanels: (params: EquipmentSearchParams) => Promise<void>;
  clearPanelSearchResults: () => void;

  // Actions - Inverters
  fetchInverters: (page?: number, limit?: number) => Promise<void>;
  fetchInverterById: (inverterId: number) => Promise<Inverter | null>;
  fetchPopularInverters: (limit?: number) => Promise<void>;
  fetchInverterManufacturers: () => Promise<void>;
  searchInverters: (params: EquipmentSearchParams) => Promise<void>;
  clearInverterSearchResults: () => void;

  // Actions - Compatibility
  fetchCompatibleInverters: (panelId: number) => Promise<void>;
  fetchCompatiblePanels: (inverterId: number) => Promise<void>;

  // Actions - Recommendations and comparisons
  getEquipmentRecommendations: (requirements: {
    targetPower: number;
    budget: number;
    roofType: string;
    orientation: string;
    priority: string;
    constraints?: string[];
  }) => Promise<void>;
  comparePVPanels: (panelIds: number[]) => Promise<void>;
  compareInverters: (inverterIds: number[]) => Promise<void>;
  calculateSystemPerformance: (config: {
    panelId: number;
    inverterId: number;
    panelCount: number;
    location: { latitude: number; longitude: number };
    installationDetails: { tilt: number; azimuth: number; shading?: number };
  }) => Promise<{
    estimatedAnnualProduction: number;
    monthlyProduction: number[];
    performanceRatio: number;
    specificYield: number;
    co2Savings: number;
  } | null>;

  // Actions - Filters
  setPanelSearchFilters: (filters: Partial<EquipmentSearchParams>) => void;
  setInverterSearchFilters: (filters: Partial<EquipmentSearchParams>) => void;

  // Utility actions
  clearError: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  // PV Panels
  pvPanels: [],
  currentPanel: null,
  popularPanels: [],
  panelManufacturers: [],
  panelSearchResults: [],

  // Inverters
  inverters: [],
  currentInverter: null,
  popularInverters: [],
  inverterManufacturers: [],
  inverterSearchResults: [],

  // Compatibility
  compatibleInverters: [],
  compatiblePanels: [],

  // Recommendations
  panelRecommendations: [],
  inverterRecommendations: [],
  comparisonResults: {},

  // Loading states
  isLoading: false,
  isSearching: false,
  error: null,

  // Pagination
  currentPanelPage: 1,
  totalPanelPages: 1,
  totalPanels: 0,
  currentInverterPage: 1,
  totalInverterPages: 1,
  totalInverters: 0,

  // Search filters
  panelSearchFilters: {
    page: 1,
    limit: 50,
    sortBy: 'power' as const,
    sortOrder: 'desc' as const,
  },
  inverterSearchFilters: {
    page: 1,
    limit: 50,
    sortBy: 'power' as const,
    sortOrder: 'desc' as const,
  },
};

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  ...initialState,

  // PV Panel Actions
  fetchPVPanels: async (page = 1, limit = 50) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const panels = await equipmentService.getPVPanels(page, limit);

      set({
        pvPanels: panels,
        currentPanelPage: page,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Fetched ${panels.length} PV panels (page ${page})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PV panels';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to fetch PV panels:', error);
    }
  },

  fetchPVPanelById: async (panelId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const panel = await equipmentService.getPVPanelById(panelId);

      if (panel) {
        set({
          currentPanel: panel,
          isLoading: false,
          error: null,
        });
        console.log(`[Equipment Store] Fetched PV panel: ${panel.maker} ${panel.model}`);
      } else {
        setError('PV panel not found');
        setLoading(false);
      }

      return panel;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PV panel';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Equipment Store] Failed to fetch PV panel ${panelId}:`, error);
      return null;
    }
  },

  fetchPopularPVPanels: async (limit = 10) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const panels = await equipmentService.getPopularPVPanels(limit);

      set({
        popularPanels: panels,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Fetched ${panels.length} popular PV panels`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch popular PV panels';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to fetch popular PV panels:', error);
    }
  },

  fetchPVPanelManufacturers: async () => {
    try {
      const manufacturers = await equipmentService.getPVPanelManufacturers();

      set({
        panelManufacturers: manufacturers,
      });

      console.log(`[Equipment Store] Fetched ${manufacturers.length} PV panel manufacturers`);
    } catch (error) {
      console.error('[Equipment Store] Failed to fetch PV panel manufacturers:', error);
    }
  },

  searchPVPanels: async (params: EquipmentSearchParams) => {
    const { setLoading, setError, setPanelSearchFilters } = get();

    try {
      setLoading(true);
      setError(null);
      set({ isSearching: true });

      // Update search filters
      setPanelSearchFilters(params);

      const results = await equipmentService.searchPVPanels(params);

      set({
        panelSearchResults: results.items,
        totalPanelPages: results.totalPages,
        totalPanels: results.total,
        currentPanelPage: results.page,
        isSearching: false,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Found ${results.items.length} PV panels for search`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search PV panels';
      setError(errorMessage);
      set({ isSearching: false, isLoading: false });
      console.error('[Equipment Store] Failed to search PV panels:', error);
    }
  },

  clearPanelSearchResults: () => {
    set({
      panelSearchResults: [],
      panelSearchFilters: {
        page: 1,
        limit: 50,
        sortBy: 'power',
        sortOrder: 'desc',
      },
    });
  },

  // Inverter Actions
  fetchInverters: async (page = 1, limit = 50) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const inverters = await equipmentService.getInverters(page, limit);

      set({
        inverters,
        currentInverterPage: page,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Fetched ${inverters.length} inverters (page ${page})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inverters';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to fetch inverters:', error);
    }
  },

  fetchInverterById: async (inverterId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const inverter = await equipmentService.getInverterById(inverterId);

      if (inverter) {
        set({
          currentInverter: inverter,
          isLoading: false,
          error: null,
        });
        console.log(`[Equipment Store] Fetched inverter: ${inverter.maker} ${inverter.model}`);
      } else {
        setError('Inverter not found');
        setLoading(false);
      }

      return inverter;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inverter';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Equipment Store] Failed to fetch inverter ${inverterId}:`, error);
      return null;
    }
  },

  fetchPopularInverters: async (limit = 10) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const inverters = await equipmentService.getPopularInverters(limit);

      set({
        popularInverters: inverters,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Fetched ${inverters.length} popular inverters`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch popular inverters';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to fetch popular inverters:', error);
    }
  },

  fetchInverterManufacturers: async () => {
    try {
      const manufacturers = await equipmentService.getInverterManufacturers();

      set({
        inverterManufacturers: manufacturers,
      });

      console.log(`[Equipment Store] Fetched ${manufacturers.length} inverter manufacturers`);
    } catch (error) {
      console.error('[Equipment Store] Failed to fetch inverter manufacturers:', error);
    }
  },

  searchInverters: async (params: EquipmentSearchParams) => {
    const { setLoading, setError, setInverterSearchFilters } = get();

    try {
      setLoading(true);
      setError(null);
      set({ isSearching: true });

      // Update search filters
      setInverterSearchFilters(params);

      const results = await equipmentService.searchInverters(params);

      set({
        inverterSearchResults: results.items,
        totalInverterPages: results.totalPages,
        totalInverters: results.total,
        currentInverterPage: results.page,
        isSearching: false,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Found ${results.items.length} inverters for search`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search inverters';
      setError(errorMessage);
      set({ isSearching: false, isLoading: false });
      console.error('[Equipment Store] Failed to search inverters:', error);
    }
  },

  clearInverterSearchResults: () => {
    set({
      inverterSearchResults: [],
      inverterSearchFilters: {
        page: 1,
        limit: 50,
        sortBy: 'power',
        sortOrder: 'desc',
      },
    });
  },

  // Compatibility Actions
  fetchCompatibleInverters: async (panelId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const inverters = await equipmentService.getCompatibleInverters(panelId);

      set({
        compatibleInverters: inverters,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Found ${inverters.length} compatible inverters for panel ${panelId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch compatible inverters';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Equipment Store] Failed to fetch compatible inverters for panel ${panelId}:`, error);
    }
  },

  fetchCompatiblePanels: async (inverterId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const panels = await equipmentService.getCompatiblePVPanels(inverterId);

      set({
        compatiblePanels: panels,
        isLoading: false,
        error: null,
      });

      console.log(`[Equipment Store] Found ${panels.length} compatible panels for inverter ${inverterId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch compatible panels';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Equipment Store] Failed to fetch compatible panels for inverter ${inverterId}:`, error);
    }
  },

  // Recommendations and Comparisons
  getEquipmentRecommendations: async (requirements: {
    targetPower: number;
    budget: number;
    roofType: string;
    orientation: string;
    priority: string;
    constraints?: string[];
  }) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      // Transform the requirements to match the service interface
      const serviceRequirements = {
        systemSize: requirements.targetPower / 1000, // Convert W to kW
        roofArea: requirements.roofType ? undefined : undefined, // Would need mapping from roof type to area
        budget: requirements.budget,
        orientation: requirements.orientation,
        tilt: undefined, // Not provided in the current interface
      };

      const recommendations = await equipmentService.getEquipmentRecommendations(serviceRequirements);

      if (recommendations) {
        set({
          panelRecommendations: recommendations.recommendedPanels,
          inverterRecommendations: recommendations.recommendedInverters,
          isLoading: false,
          error: null,
        });
        console.log('[Equipment Store] Generated equipment recommendations');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get equipment recommendations';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to get equipment recommendations:', error);
    }
  },

  comparePVPanels: async (panelIds: number[]) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const comparison = await equipmentService.comparePVPanels(panelIds);

      if (comparison) {
        set((state) => ({
          comparisonResults: {
            ...state.comparisonResults,
            panels: comparison,
          },
          isLoading: false,
          error: null,
        }));
        console.log(`[Equipment Store] Compared ${panelIds.length} PV panels`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare PV panels';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to compare PV panels:', error);
    }
  },

  compareInverters: async (inverterIds: number[]) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const comparison = await equipmentService.compareInverters(inverterIds);

      if (comparison) {
        set((state) => ({
          comparisonResults: {
            ...state.comparisonResults,
            inverters: comparison as { comparison: Inverter[]; analysis: { bestEfficiency: Inverter; bestPower: Inverter; bestValue: Inverter; mostReliable: Inverter; }; },
          },
          isLoading: false,
          error: null,
        }));
        console.log(`[Equipment Store] Compared ${inverterIds.length} inverters`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare inverters';
      setError(errorMessage);
      setLoading(false);
      console.error('[Equipment Store] Failed to compare inverters:', error);
    }
  },

  calculateSystemPerformance: async (config: {
    panelId: number;
    inverterId: number;
    panelCount: number;
    location: { latitude: number; longitude: number };
    installationDetails: { tilt: number; azimuth: number; shading?: number };
  }) => {
    try {
      const performance = await equipmentService.calculateSystemPerformance(config);
      console.log('[Equipment Store] Calculated system performance:', performance);
      return performance;
    } catch (error) {
      console.error('[Equipment Store] Failed to calculate system performance:', error);
      return null;
    }
  },

  // Filter Actions
  setPanelSearchFilters: (filters: Partial<EquipmentSearchParams>) => {
    const { panelSearchFilters } = get();
    set({
      panelSearchFilters: { ...panelSearchFilters, ...filters },
    });
  },

  setInverterSearchFilters: (filters: Partial<EquipmentSearchParams>) => {
    const { inverterSearchFilters } = get();
    set({
      inverterSearchFilters: { ...inverterSearchFilters, ...filters },
    });
  },

  // Utility Actions
  clearError: () => {
    set({ error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for easier access to specific state
export const usePVPanels = () => useEquipmentStore((state) => state.pvPanels);
export const useCurrentPanel = () => useEquipmentStore((state) => state.currentPanel);
export const useInverters = () => useEquipmentStore((state) => state.inverters);
export const useCurrentInverter = () => useEquipmentStore((state) => state.currentInverter);
export const useEquipmentLoading = () => useEquipmentStore((state) => state.isLoading);
export const useEquipmentError = () => useEquipmentStore((state) => state.error);
export const usePopularEquipment = () => useEquipmentStore((state) => ({
  popularPanels: state.popularPanels,
  popularInverters: state.popularInverters,
}));
export const useEquipmentSearch = () => useEquipmentStore((state) => ({
  panelSearchResults: state.panelSearchResults,
  inverterSearchResults: state.inverterSearchResults,
  isSearching: state.isSearching,
  panelSearchFilters: state.panelSearchFilters,
  inverterSearchFilters: state.inverterSearchFilters,
}));