import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { handleApiError, isNotFoundError } from '@/utils/error-handling';

// Import shared types from server
import type { Organization, Review } from '@/types';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrganizations: () => Promise<void>;
  fetchOrganizationById: (organizationId: number) => Promise<Organization>;
  createOrganization: (organization: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (organizationId: number, organization: Partial<Organization>) => Promise<void>;
  deleteOrganization: (organizationId: number) => Promise<void>;
  createReview: (organizationId: number, review: Partial<Review>) => Promise<Review>;
  fetchReviews: (organizationId: number) => Promise<Review[]>;
  clearError: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getOrganizations();
      if (Array.isArray(response.data)) {
        set({ organizations: response.data as Organization[], isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch organizations');
      set({ error: errorMessage, isLoading: false, organizations: [] });
    }
  },

  fetchOrganizationById: async (organizationId: number): Promise<Organization> => {
    try {
      const response = await apiClient.getOrganizationById(organizationId);

      if (!response.data || !(response.data as Organization).id) {
        throw new Error('Invalid organization data received');
      }

      return response.data as Organization;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch organization');
      throw new Error(errorMessage);
    }
  },

  createOrganization: async (organizationData: Partial<Organization>): Promise<Organization> => {
    try {
      const response = await apiClient.createOrganization({
        ...organizationData,
        descriptions: organizationData.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      });

      if (!response.data || !(response.data as Organization).id) {
        throw new Error('Invalid organization data received from server');
      }

      // Update store
      const { organizations } = get();
      set({ organizations: [...organizations, response.data as Organization] });

      return response.data as Organization;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create organization');
      throw new Error(errorMessage);
    }
  },

  updateOrganization: async (organizationId: number, organizationData: Partial<Organization>): Promise<void> => {
    try {
      const response = await apiClient.put(`/organizations/${organizationId}`, {
        ...organizationData,
        descriptions: organizationData.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      });

      if (!response.data) {
        throw new Error('Failed to update organization');
      }

      // Update store
      const { organizations } = get();
      set({
        organizations: organizations.map(c => c.id === organizationId ? response.data as Organization : c)
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update organization');
      throw new Error(errorMessage);
    }
  },

  deleteOrganization: async (organizationId: number): Promise<void> => {
    try {
      await apiClient.delete(`/organizations/${organizationId}`);

      // Update store
      const { organizations } = get();
      set({
        organizations: organizations.filter(c => c.id !== organizationId)
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete organization');
      throw new Error(errorMessage);
    }
  },

  createReview: async (organizationId: number, reviewData: Partial<Review>): Promise<Review> => {
    try {
      const response = await apiClient.post(`/organizations/${organizationId}/reviews`, reviewData);

      if (!response.data || !(response.data as Review).id) {
        throw new Error('Invalid review data received from server');
      }

      return response.data as Review;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create review');
      throw new Error(errorMessage);
    }
  },

  fetchReviews: async (organizationId: number): Promise<Review[]> => {
    try {
      const response = await apiClient.get(`/organizations/${organizationId}/reviews`);

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      return response.data as Review[];
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch reviews');
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));