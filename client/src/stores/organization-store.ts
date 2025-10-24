/**
 * Organization Store
 * Zustand store for organization-related state management
 * Extracted from the monolithic API store
 */

import { create } from 'zustand';
import { Organization, Review } from '@/types';
import { organizationService, CreateOrganizationParams, CreateReviewParams } from '@/services/organization-service';

export interface OrganizationState {
  // State
  organizations: Organization[];
  currentOrganization: Organization | null;
  reviews: Review[];
  searchResults: Organization[];
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalOrganizations: number;

  // Filters
  searchQuery: string;
  selectedIndustry: string;
  sortBy: 'name' | 'created_at' | 'rating';
  sortOrder: 'asc' | 'desc';

  // Actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchOrganizations: () => Promise<void>;
  fetchOrganizationById: (organizationId: number) => Promise<Organization | null>;
  createOrganization: (organizationData: CreateOrganizationParams) => Promise<Organization | null>;
  updateOrganization: (organizationId: number, organizationData: Partial<CreateOrganizationParams>) => Promise<Organization | null>;
  deleteOrganization: (organizationId: number) => Promise<boolean>;
  createReview: (organizationId: number, reviewData: CreateReviewParams) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;
  fetchOrganizationReviews: (organizationId: number) => Promise<void>;
  createOrganizationReview: (organizationId: number, reviewData: CreateReviewParams) => Promise<Review | null>;

  // Search actions
  searchOrganizations: (query: string) => Promise<void>;
  clearSearchResults: () => void;

  // Filter actions
  setFilters: (filters: { query?: string; industry?: string; sortBy?: string; sortOrder?: string }) => void;
  setPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  organizations: [],
  currentOrganization: null,
  reviews: [],
  searchResults: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalOrganizations: 0,
  searchQuery: '',
  selectedIndustry: '',
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
};

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  ...initialState,

  fetchOrganizations: async () => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const organizations = await organizationService.getOrganizations();

      set({
        organizations,
        isLoading: false,
        error: null,
      });

      console.log(`[Organization Store] Fetched ${organizations.length} organizations`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizations';
      setError(errorMessage);
      setLoading(false);
      console.error('[Organization Store] Failed to fetch organizations:', error);
    }
  },

  fetchOrganizationById: async (organizationId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const organization = await organizationService.getOrganizationById(organizationId);

      if (organization) {
        set({
          currentOrganization: organization,
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Fetched organization: ${organization.name}`);
      } else {
        setError('Organization not found');
        setLoading(false);
      }

      return organization;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organization';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to fetch organization ${organizationId}:`, error);
      return null;
    }
  },

  createOrganization: async (organizationData: CreateOrganizationParams) => {
    const { setLoading, setError, fetchOrganizations } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = organizationService.validateOrganizationData(organizationData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const organization = await organizationService.createOrganization(organizationData);

      if (organization) {
        // Refresh the organizations list
        await fetchOrganizations();
        set({
          currentOrganization: organization,
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Created organization: ${organization.name}`);
      }

      return organization;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      setError(errorMessage);
      setLoading(false);
      console.error('[Organization Store] Failed to create organization:', error);
      return null;
    }
  },

  updateOrganization: async (organizationId: number, organizationData: Partial<CreateOrganizationParams>) => {
    const { setLoading, setError, fetchOrganizations } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = organizationService.validateOrganizationData(organizationData as CreateOrganizationParams);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const updatedOrganization = await organizationService.updateOrganization(organizationId, organizationData);

      if (updatedOrganization) {
        // Refresh the organizations list
        await fetchOrganizations();
        set({
          currentOrganization: updatedOrganization,
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Updated organization: ${updatedOrganization.name}`);
      }

      return updatedOrganization;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to update organization ${organizationId}:`, error);
      return null;
    }
  },

  deleteOrganization: async (organizationId: number) => {
    const { setLoading, setError, fetchOrganizations, currentOrganization } = get();

    try {
      setLoading(true);
      setError(null);

      const success = await organizationService.deleteOrganization(organizationId);

      if (success) {
        // Refresh the organizations list
        await fetchOrganizations();

        // Clear current organization if it was the deleted one
        if (currentOrganization?.id === organizationId) {
          set({ currentOrganization: null });
        }

        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Deleted organization: ${organizationId}`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete organization';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to delete organization ${organizationId}:`, error);
      return false;
    }
  },

  createReview: async (organizationId: number, reviewData: CreateReviewParams) => {
    const { setLoading, setError, fetchOrganizationReviews } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = organizationService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const review = await organizationService.createOrganizationReview(organizationId, reviewData);

      if (review) {
        // Refresh the reviews list
        await fetchOrganizationReviews(organizationId);
        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Created review for organization ${organizationId}`);
      }

      return review;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to create review for organization ${organizationId}:`, error);
      return null;
    }
  },

  deleteReview: async (reviewId: number) => {
    const { setLoading, setError, reviews } = get();

    try {
      setLoading(true);
      setError(null);

      const success = await organizationService.deleteReview(reviewId);

      if (success) {
        // Remove review from local state
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        set({
          reviews: updatedReviews,
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Deleted review: ${reviewId}`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to delete review ${reviewId}:`, error);
      return false;
    }
  },

  fetchOrganizationReviews: async (organizationId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const reviews = await organizationService.getOrganizationReviews(organizationId);

      set({
        reviews,
        isLoading: false,
        error: null,
      });

      console.log(`[Organization Store] Fetched ${reviews.length} reviews for organization ${organizationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to fetch reviews for organization ${organizationId}:`, error);
    }
  },

  createOrganizationReview: async (organizationId: number, reviewData: CreateReviewParams) => {
    const { setLoading, setError, fetchOrganizationReviews } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = organizationService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const review = await organizationService.createOrganizationReview(organizationId, reviewData);

      if (review) {
        // Refresh the reviews list
        await fetchOrganizationReviews(organizationId);
        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Organization Store] Created review for organization ${organizationId}`);
      }

      return review;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to create review for organization ${organizationId}:`, error);
      return null;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  searchOrganizations: async (query: string) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);
      set({ searchQuery: query });

      if (query.trim().length === 0) {
        set({ searchResults: [], isLoading: false });
        return;
      }

      const results = await organizationService.searchOrganizations(query);

      set({
        searchResults: results,
        isLoading: false,
        error: null,
      });

      console.log(`[Organization Store] Found ${results.length} organizations for query: "${query}"`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search organizations';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Organization Store] Failed to search organizations with query "${query}":`, error);
    }
  },

  clearSearchResults: () => {
    set({
      searchResults: [],
      searchQuery: '',
    });
  },

  setFilters: (filters) => {
    const { searchQuery, selectedIndustry, sortBy, sortOrder } = get();

    set({
      searchQuery: filters.query ?? searchQuery,
      selectedIndustry: filters.industry ?? selectedIndustry,
      sortBy: (filters.sortBy as 'name' | 'rating' | 'created_at') ?? sortBy,
      sortOrder: (filters.sortOrder as 'asc' | 'desc') ?? sortOrder,
      currentPage: 1, // Reset to first page when filters change
    });
  },

  setPage: (page: number) => {
    set({ currentPage: page });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for easier access to specific state
export const useOrganizations = () => useOrganizationStore((state) => state.organizations);
export const useCurrentOrganization = () => useOrganizationStore((state) => state.currentOrganization);
export const useOrganizationReviews = () => useOrganizationStore((state) => state.reviews);
export const useOrganizationSearchResults = () => useOrganizationStore((state) => state.searchResults);
export const useOrganizationLoading = () => useOrganizationStore((state) => state.isLoading);
export const useOrganizationError = () => useOrganizationStore((state) => state.error);
export const useOrganizationFilters = () => useOrganizationStore((state) => ({
  searchQuery: state.searchQuery,
  selectedIndustry: state.selectedIndustry,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
  currentPage: state.currentPage,
  totalPages: state.totalPages,
}));