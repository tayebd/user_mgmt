/**
 * Company Store
 * Zustand store for company-related state management
 * Extracted from the monolithic API store
 */

import { create } from 'zustand';
import { Company, Review } from '@/types';
import { companyService, CreateCompanyParams, CreateReviewParams } from '@/services/company-service';

export interface CompanyState {
  // State
  companies: Company[];
  currentCompany: Company | null;
  reviews: Review[];
  searchResults: Company[];
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCompanies: number;

  // Filters
  searchQuery: string;
  selectedIndustry: string;
  sortBy: 'name' | 'created_at' | 'rating';
  sortOrder: 'asc' | 'desc';

  // Actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (companyId: number) => Promise<Company | null>;
  createCompany: (companyData: CreateCompanyParams) => Promise<Company | null>;
  updateCompany: (companyId: number, companyData: Partial<CreateCompanyParams>) => Promise<Company | null>;
  deleteCompany: (companyId: number) => Promise<boolean>;
  createReview: (companyId: number, reviewData: CreateReviewParams) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;
  fetchCompanyReviews: (companyId: number) => Promise<void>;
  createCompanyReview: (companyId: number, reviewData: CreateReviewParams) => Promise<Review | null>;

  // Search actions
  searchCompanies: (query: string) => Promise<void>;
  clearSearchResults: () => void;

  // Filter actions
  setFilters: (filters: { query?: string; industry?: string; sortBy?: string; sortOrder?: string }) => void;
  setPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  companies: [],
  currentCompany: null,
  reviews: [],
  searchResults: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCompanies: 0,
  searchQuery: '',
  selectedIndustry: '',
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
  ...initialState,

  fetchCompanies: async () => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const companies = await companyService.getCompanies();

      set({
        companies,
        isLoading: false,
        error: null,
      });

      console.log(`[Company Store] Fetched ${companies.length} companies`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch companies';
      setError(errorMessage);
      setLoading(false);
      console.error('[Company Store] Failed to fetch companies:', error);
    }
  },

  fetchCompanyById: async (companyId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const company = await companyService.getCompanyById(companyId);

      if (company) {
        set({
          currentCompany: company,
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Fetched company: ${company.name}`);
      } else {
        setError('Company not found');
        setLoading(false);
      }

      return company;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch company';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to fetch company ${companyId}:`, error);
      return null;
    }
  },

  createCompany: async (companyData: CreateCompanyParams) => {
    const { setLoading, setError, fetchCompanies } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = companyService.validateCompanyData(companyData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const company = await companyService.createCompany(companyData);

      if (company) {
        // Refresh the companies list
        await fetchCompanies();
        set({
          currentCompany: company,
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Created company: ${company.name}`);
      }

      return company;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create company';
      setError(errorMessage);
      setLoading(false);
      console.error('[Company Store] Failed to create company:', error);
      return null;
    }
  },

  updateCompany: async (companyId: number, companyData: Partial<CreateCompanyParams>) => {
    const { setLoading, setError, fetchCompanies } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = companyService.validateCompanyData(companyData as CreateCompanyParams);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const updatedCompany = await companyService.updateCompany(companyId, companyData);

      if (updatedCompany) {
        // Refresh the companies list
        await fetchCompanies();
        set({
          currentCompany: updatedCompany,
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Updated company: ${updatedCompany.name}`);
      }

      return updatedCompany;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update company';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to update company ${companyId}:`, error);
      return null;
    }
  },

  deleteCompany: async (companyId: number) => {
    const { setLoading, setError, fetchCompanies, currentCompany } = get();

    try {
      setLoading(true);
      setError(null);

      const success = await companyService.deleteCompany(companyId);

      if (success) {
        // Refresh the companies list
        await fetchCompanies();

        // Clear current company if it was the deleted one
        if (currentCompany?.id === companyId) {
          set({ currentCompany: null });
        }

        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Deleted company: ${companyId}`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete company';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to delete company ${companyId}:`, error);
      return false;
    }
  },

  createReview: async (companyId: number, reviewData: CreateReviewParams) => {
    const { setLoading, setError, fetchCompanyReviews } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = companyService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const review = await companyService.createCompanyReview(companyId, reviewData);

      if (review) {
        // Refresh the reviews list
        await fetchCompanyReviews(companyId);
        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Created review for company ${companyId}`);
      }

      return review;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to create review for company ${companyId}:`, error);
      return null;
    }
  },

  deleteReview: async (reviewId: number) => {
    const { setLoading, setError, reviews } = get();

    try {
      setLoading(true);
      setError(null);

      const success = await companyService.deleteReview(reviewId);

      if (success) {
        // Remove review from local state
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        set({
          reviews: updatedReviews,
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Deleted review: ${reviewId}`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to delete review ${reviewId}:`, error);
      return false;
    }
  },

  fetchCompanyReviews: async (companyId: number) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const reviews = await companyService.getCompanyReviews(companyId);

      set({
        reviews,
        isLoading: false,
        error: null,
      });

      console.log(`[Company Store] Fetched ${reviews.length} reviews for company ${companyId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to fetch reviews for company ${companyId}:`, error);
    }
  },

  createCompanyReview: async (companyId: number, reviewData: CreateReviewParams) => {
    const { setLoading, setError, fetchCompanyReviews } = get();

    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = companyService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const review = await companyService.createCompanyReview(companyId, reviewData);

      if (review) {
        // Refresh the reviews list
        await fetchCompanyReviews(companyId);
        set({
          isLoading: false,
          error: null,
        });
        console.log(`[Company Store] Created review for company ${companyId}`);
      }

      return review;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to create review for company ${companyId}:`, error);
      return null;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  searchCompanies: async (query: string) => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);
      set({ searchQuery: query });

      if (query.trim().length === 0) {
        set({ searchResults: [], isLoading: false });
        return;
      }

      const results = await companyService.searchCompanies(query);

      set({
        searchResults: results,
        isLoading: false,
        error: null,
      });

      console.log(`[Company Store] Found ${results.length} companies for query: "${query}"`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search companies';
      setError(errorMessage);
      setLoading(false);
      console.error(`[Company Store] Failed to search companies with query "${query}":`, error);
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
export const useCompanies = () => useCompanyStore((state) => state.companies);
export const useCurrentCompany = () => useCompanyStore((state) => state.currentCompany);
export const useCompanyReviews = () => useCompanyStore((state) => state.reviews);
export const useCompanySearchResults = () => useCompanyStore((state) => state.searchResults);
export const useCompanyLoading = () => useCompanyStore((state) => state.isLoading);
export const useCompanyError = () => useCompanyStore((state) => state.error);
export const useCompanyFilters = () => useCompanyStore((state) => ({
  searchQuery: state.searchQuery,
  selectedIndustry: state.selectedIndustry,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
  currentPage: state.currentPage,
  totalPages: state.totalPages,
}));