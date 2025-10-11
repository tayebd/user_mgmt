import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { handleApiError, isNotFoundError } from '@/utils/error-handling';

// Import shared types from server
import type { Company, Review } from '@/types';

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (companyId: number) => Promise<Company>;
  createCompany: (company: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: number) => Promise<void>;
  createReview: (companyId: number, review: Partial<Review>) => Promise<Review>;
  fetchReviews: (companyId: number) => Promise<Review[]>;
  clearError: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,

  fetchCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCompanies();
      if (Array.isArray(response.data)) {
        set({ companies: response.data as Company[], isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch companies');
      set({ error: errorMessage, isLoading: false, companies: [] });
    }
  },

  fetchCompanyById: async (companyId: number): Promise<Company> => {
    try {
      const response = await apiClient.getCompanyById(companyId);

      if (!response.data || !(response.data as Company).id) {
        throw new Error('Invalid company data received');
      }

      return response.data as Company;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch company');
      throw new Error(errorMessage);
    }
  },

  createCompany: async (companyData: Partial<Company>): Promise<Company> => {
    try {
      const response = await apiClient.createCompany({
        ...companyData,
        descriptions: companyData.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      });

      if (!response.data || !(response.data as Company).id) {
        throw new Error('Invalid company data received from server');
      }

      // Update store
      const { companies } = get();
      set({ companies: [...companies, response.data as Company] });

      return response.data as Company;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create company');
      throw new Error(errorMessage);
    }
  },

  updateCompany: async (companyId: number, companyData: Partial<Company>): Promise<void> => {
    try {
      const response = await apiClient.put(`/companies/${companyId}`, {
        ...companyData,
        descriptions: companyData.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      });

      if (!response.data) {
        throw new Error('Failed to update company');
      }

      // Update store
      const { companies } = get();
      set({
        companies: companies.map(c => c.id === companyId ? response.data as Company : c)
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update company');
      throw new Error(errorMessage);
    }
  },

  deleteCompany: async (companyId: number): Promise<void> => {
    try {
      await apiClient.delete(`/companies/${companyId}`);

      // Update store
      const { companies } = get();
      set({
        companies: companies.filter(c => c.id !== companyId)
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete company');
      throw new Error(errorMessage);
    }
  },

  createReview: async (companyId: number, reviewData: Partial<Review>): Promise<Review> => {
    try {
      const response = await apiClient.post(`/companies/${companyId}/reviews`, reviewData);

      if (!response.data || !(response.data as Review).id) {
        throw new Error('Invalid review data received from server');
      }

      return response.data as Review;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create review');
      throw new Error(errorMessage);
    }
  },

  fetchReviews: async (companyId: number): Promise<Review[]> => {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reviews`);

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