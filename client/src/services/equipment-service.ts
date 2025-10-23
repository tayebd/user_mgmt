/**
 * Equipment Service
 * Handles all equipment-related API operations (PV panels, inverters, etc.)
 * Extracted from the monolithic API store
 */

import { apiClient, ApiResponse } from './api-client';
import type { PVPanel, Inverter } from '@/shared/types';

export interface EquipmentSearchParams {
  query?: string;
  manufacturer?: string;
  minPower?: number;
  maxPower?: number;
  efficiency?: number;
  technology?: string;
  page?: number;
  limit?: number;
  sortBy?: 'power' | 'efficiency' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface EquipmentSearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Equipment Service Class
 * Provides methods for PV panel and inverter operations
 */
export class EquipmentService {
  /**
   * Fetch PV panels with pagination
   */
  async getPVPanels(page = 1, limit = 50): Promise<PVPanel[]> {
    const response = await apiClient.get<PVPanel[]>(`/pv-panels?page=${page}&limit=${limit}`);

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch PV panels:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single PV panel by ID
   */
  async getPVPanelById(panelId: number): Promise<PVPanel | null> {
    const response = await apiClient.get<PVPanel>(`/pv-panels/${panelId}`);

    if (!response.ok || !response.data) {
      console.error(`[Equipment Service] Failed to fetch PV panel ${panelId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Search PV panels with filters
   */
  async searchPVPanels(params: EquipmentSearchParams): Promise<EquipmentSearchResult<PVPanel>> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.manufacturer) queryParams.append('manufacturer', params.manufacturer);
    if (params.minPower) queryParams.append('minPower', params.minPower.toString());
    if (params.maxPower) queryParams.append('maxPower', params.maxPower.toString());
    if (params.efficiency) queryParams.append('efficiency', params.efficiency.toString());
    if (params.technology) queryParams.append('technology', params.technology);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get<EquipmentSearchResult<PVPanel>>(
      `/pv-panels/search?${queryParams.toString()}`
    );

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to search PV panels:', response.error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };
    }

    return response.data;
  }

  /**
   * Fetch inverters with pagination
   */
  async getInverters(page = 1, limit = 50): Promise<Inverter[]> {
    const response = await apiClient.get<Inverter[]>(`/inverters?page=${page}&limit=${limit}`);

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch inverters:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single inverter by ID
   */
  async getInverterById(inverterId: number): Promise<Inverter | null> {
    const response = await apiClient.get<Inverter>(`/inverters/${inverterId}`);

    if (!response.ok || !response.data) {
      console.error(`[Equipment Service] Failed to fetch inverter ${inverterId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Search inverters with filters
   */
  async searchInverters(params: EquipmentSearchParams): Promise<EquipmentSearchResult<Inverter>> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.manufacturer) queryParams.append('manufacturer', params.manufacturer);
    if (params.minPower) queryParams.append('minPower', params.minPower.toString());
    if (params.maxPower) queryParams.append('maxPower', params.maxPower.toString());
    if (params.efficiency) queryParams.append('efficiency', params.efficiency.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get<EquipmentSearchResult<Inverter>>(
      `/inverters/search?${queryParams.toString()}`
    );

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to search inverters:', response.error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };
    }

    return response.data;
  }

  /**
   * Get PV panel manufacturers
   */
  async getPVPanelManufacturers(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/pv-panels/manufacturers');

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch PV panel manufacturers:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get inverter manufacturers
   */
  async getInverterManufacturers(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/inverters/manufacturers');

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch inverter manufacturers:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get popular PV panels
   */
  async getPopularPVPanels(limit = 10): Promise<PVPanel[]> {
    const response = await apiClient.get<PVPanel[]>(`/pv-panels/popular?limit=${limit}`);

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch popular PV panels:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get popular inverters
   */
  async getPopularInverters(limit = 10): Promise<Inverter[]> {
    const response = await apiClient.get<Inverter[]>(`/inverters/popular?limit=${limit}`);

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to fetch popular inverters:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get compatible inverters for a PV panel
   */
  async getCompatibleInverters(panelId: number): Promise<Inverter[]> {
    const response = await apiClient.get<Inverter[]>(`/pv-panels/${panelId}/compatible-inverters`);

    if (!response.ok || !response.data) {
      console.error(`[Equipment Service] Failed to fetch compatible inverters for panel ${panelId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get compatible PV panels for an inverter
   */
  async getCompatiblePVPanels(inverterId: number): Promise<PVPanel[]> {
    const response = await apiClient.get<PVPanel[]>(`/inverters/${inverterId}/compatible-panels`);

    if (!response.ok || !response.data) {
      console.error(`[Equipment Service] Failed to fetch compatible panels for inverter ${inverterId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get equipment recommendations based on system requirements
   */
  async getEquipmentRecommendations(requirements: {
    systemSize: number; // in kW
    roofArea?: number; // in m²
    budget?: number; // in local currency
    location?: string;
    orientation?: string;
    tilt?: number;
  }): Promise<{
    recommendedPanels: PVPanel[];
    recommendedInverters: Inverter[];
    systemConfig: {
      optimalPanelCount: number;
      optimalInverter: Inverter;
      estimatedProduction: number;
      estimatedCost: number;
    };
  } | null> {
    const response = await apiClient.post(
      '/equipment/recommendations',
      requirements,
      false // This might not require authentication
    );

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to get equipment recommendations:', response.error);
      return null;
    }

    return response.data as {
      recommendedPanels: PVPanel[];
      recommendedInverters: Inverter[];
      compatibility: Record<string, string[]>;
      reasoning: string[];
      systemConfig: {
        optimalPanelCount: number;
        optimalInverter: Inverter;
        estimatedProduction: number;
        estimatedCost: number;
      };
    };
  }

  /**
   * Compare multiple PV panels
   */
  async comparePVPanels(panelIds: number[]): Promise<{
    comparison: PVPanel[];
    analysis: {
      bestEfficiency: PVPanel;
      bestPower: PVPanel;
      bestValue: PVPanel;
      mostReliable: PVPanel;
    };
  } | null> {
    const response = await apiClient.post('/pv-panels/compare', { panelIds });

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to compare PV panels:', response.error);
      return null;
    }

    return response.data as {
      comparison: PVPanel[];
      analysis: {
        bestEfficiency: PVPanel;
        bestPower: PVPanel;
        bestValue: PVPanel;
        mostReliable: PVPanel;
      };
    };
  }

  /**
   * Compare multiple inverters
   */
  async compareInverters(inverterIds: number[]): Promise<{
    comparison: Inverter[];
    analysis: {
      bestEfficiency: Inverter;
      bestPower: Inverter;
      bestValue: Inverter;
      mostReliable: Inverter;
    };
  } | null> {
    const response = await apiClient.post('/inverters/compare', { inverterIds });

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to compare inverters:', response.error);
      return null;
    }

    return response.data as {
      comparison: Inverter[];
      analysis: {
        bestEfficiency: Inverter;
        bestPower: Inverter;
        bestValue: Inverter;
        mostReliable: Inverter;
      };
    };
  }

  /**
   * Calculate system performance with specific equipment
   */
  async calculateSystemPerformance(config: {
    panelId: number;
    inverterId: number;
    panelCount: number;
    location: {
      latitude: number;
      longitude: number;
    };
    installationDetails: {
      tilt: number;
      azimuth: number;
      shading?: number; // 0-100 percentage
    };
  }): Promise<{
    estimatedAnnualProduction: number;
    monthlyProduction: number[];
    performanceRatio: number;
    specificYield: number;
    co2Savings: number;
  } | null> {
    const response = await apiClient.post('/equipment/calculate-performance', config);

    if (!response.ok || !response.data) {
      console.error('[Equipment Service] Failed to calculate system performance:', response.error);
      return null;
    }

    return response.data as {
      estimatedAnnualProduction: number;
      monthlyProduction: number[];
      performanceRatio: number;
      specificYield: number;
      co2Savings: number;
    };
  }

  /**
   * Validate equipment compatibility
   */
  validateEquipmentCompatibility(panelId: number, inverterId: number): {
    isCompatible: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    // This would typically be done on the backend, but providing a basic client-side validation
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // This is a simplified validation - in real implementation, you'd fetch actual equipment data
    // and perform detailed compatibility checks

    return {
      isCompatible: warnings.length === 0,
      warnings,
      recommendations,
    };
  }

  /**
   * Get equipment specifications summary
   */
  getEquipmentSummary(equipment: PVPanel | Inverter): {
    keySpecs: Record<string, string>;
    highlights: string[];
  } {
    const highlights: string[] = [];
    const keySpecs: Record<string, string> = {};

    if ('power' in equipment) {
      // PV Panel
      const panel = equipment as PVPanel;
      keySpecs['Power'] = `${panel.power} Wp`;
      keySpecs['Efficiency'] = `${panel.efficiency}%`;
      keySpecs['Voc'] = `${panel.openCircuitVoltage} V`;
      keySpecs['Isc'] = `${panel.shortCircuitCurrent} A`;
      keySpecs['Dimensions'] = `${panel.length} × ${panel.width} mm`;

      if (panel.efficiency >= 20) highlights.push('High Efficiency');
      if (panel.power >= 400) highlights.push('High Power');
    } else {
      // Inverter
      const inverter = equipment as Inverter;
      keySpecs['Power'] = `${inverter.nominalOutputPower} W`;
      keySpecs['Efficiency'] = `${inverter.efficiency}%`;
      keySpecs['MPPT Range'] = `${inverter.minInputVoltage} - ${inverter.maxInputVoltage} V`;
      keySpecs['Max DC Input'] = `${inverter.maxStringCurrent} A`;

      if (inverter.efficiency >= 98) highlights.push('High Efficiency');
      if (inverter.nominalOutputPower >= 10000) highlights.push('High Capacity');
    }

    return { keySpecs, highlights };
  }
}

// Create singleton instance
export const equipmentService = new EquipmentService();