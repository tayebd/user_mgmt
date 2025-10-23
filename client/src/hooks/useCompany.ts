'use client';

import { useCallback } from 'react';
import { useCRUD, UseCRUDOptions } from './useCRUD';
import { companyService, CreateCompanyParams } from '@/services/company-service';
import type { Company, Review } from '@/types';

export interface UseCompanyReturn extends ReturnType<typeof useCRUD<Company>> {
  // Company-specific actions
  createReview: (companyId: number, review: Partial<Review>) => Promise<Review | null>;
  getReviews: (companyId: number) => Promise<Review[]>;
  updateReview: (reviewId: number, review: Partial<Review>) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;

  // Search and filtering
  searchCompanies: (query: string) => Promise<Company[]>;
  getCompaniesByIndustry: (industryId: number) => Promise<Company[]>;
}

/**
 * Company-specific CRUD hook with review management
 */
export function useCompany(): UseCompanyReturn {
  // CRUD configuration for companies
  const companyCRUD = useCRUD<Company>({
    create: async (data: Partial<Company>) => {
      const result = await companyService.createCompany(data as CreateCompanyParams);
      return { data: result || undefined, error: undefined };
    },
    read: async () => {
      const companies = await companyService.getCompanies();
      return { data: companies, error: undefined };
    },
    update: async (id: string | number, data: Partial<Company>) => {
      const result = await companyService.updateCompany(Number(id), data);
      return { data: result || undefined, error: undefined };
    },
    delete: async (id: string | number) => {
      const result = await companyService.deleteCompany(Number(id));
      return { data: undefined, error: result ? undefined : 'Failed to delete company' };
    },

    // Success messages
    successMessages: {
      create: 'Company created successfully',
      update: 'Company updated successfully',
      delete: 'Company deleted successfully',
    },

    // Error messages
    errorMessages: {
      create: 'Failed to create company',
      update: 'Failed to update company',
      delete: 'Failed to delete company',
    },

    // Validation
    validateOnCreate: (data) => {
      if (!data.name) return 'Company name is required';
      if (!data.email) return 'Company email is required';
      return null;
    },

    validateOnUpdate: (data) => {
      if (!data.name) return 'Company name is required';
      if (!data.email) return 'Company email is required';
      return null;
    },

    // Optimistic updates for list views
    optimisticUpdates: true,
  });

  // Review management functions
  const createReview = useCallback(async (companyId: number, review: Partial<Review>): Promise<Review | null> => {
    try {
      // Ensure required fields are provided with defaults
      const reviewData = {
        rating: review.rating || 0,
        title: '', // Review type doesn't have title, use empty string
        content: review.comment || '', // Use comment field for content
        pros: [], // Review type doesn't have pros
        cons: [], // Review type doesn't have cons
      };
      const result = await companyService.createCompanyReview(companyId, reviewData);
      if (!result) {
        throw new Error('Failed to create review');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      companyCRUD.setError(errorMessage);
      return null;
    }
  }, [companyCRUD]);

  const getReviews = useCallback(async (companyId: number): Promise<Review[]> => {
    try {
      const reviews = await companyService.getCompanyReviews(companyId);
      return reviews;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      companyCRUD.setError(errorMessage);
      return [];
    }
  }, [companyCRUD]);

  const updateReview = useCallback(async (reviewId: number, review: Partial<Review>): Promise<Review | null> => {
    try {
      const result = await companyService.updateReview(reviewId, review);
      if (!result) {
        throw new Error('Failed to update review');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
      companyCRUD.setError(errorMessage);
      return null;
    }
  }, [companyCRUD]);

  const deleteReview = useCallback(async (reviewId: number): Promise<boolean> => {
    try {
      await companyService.deleteReview(reviewId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      companyCRUD.setError(errorMessage);
      return false;
    }
  }, [companyCRUD]);

  // Search and filtering functions
  const searchCompanies = useCallback(async (query: string): Promise<Company[]> => {
    try {
      const companies = await companyService.searchCompanies(query);
      return companies;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search companies';
      companyCRUD.setError(errorMessage);
      return [];
    }
  }, [companyCRUD]);

  const getCompaniesByIndustry = useCallback(async (industryId: number): Promise<Company[]> => {
    try {
      const companies = await companyService.getCompaniesByIndustry(industryId.toString());
      return companies;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch companies by industry';
      companyCRUD.setError(errorMessage);
      return [];
    }
  }, [companyCRUD]);

  return {
    // CRUD actions from base hook
    ...companyCRUD,

    // Company-specific actions
    createReview,
    getReviews,
    updateReview,
    deleteReview,

    // Search and filtering
    searchCompanies,
    getCompaniesByIndustry,
  };
}

export default useCompany;