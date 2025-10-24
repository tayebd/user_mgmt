'use client';

import { useCallback } from 'react';
import { useCRUD, UseCRUDOptions } from './useCRUD';
import { organizationService, CreateOrganizationParams } from '@/services/organization-service';
import type { Organization, Review } from '@/types';

export interface UseOrganizationReturn extends ReturnType<typeof useCRUD<Organization>> {
  // Organization-specific actions
  createReview: (organizationId: number, review: Partial<Review>) => Promise<Review | null>;
  getReviews: (organizationId: number) => Promise<Review[]>;
  updateReview: (reviewId: number, review: Partial<Review>) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;

  // Search and filtering
  searchOrganizations: (query: string) => Promise<Organization[]>;
  getOrganizationsByIndustry: (industryId: number) => Promise<Organization[]>;
}

/**
 * Organization-specific CRUD hook with review management
 */
export function useOrganization(): UseOrganizationReturn {
  // CRUD configuration for organizations
  const organizationCRUD = useCRUD<Organization>({
    create: async (data: Partial<Organization>) => {
      const result = await organizationService.createOrganization(data as CreateOrganizationParams);
      return { data: result || undefined, error: undefined };
    },
    read: async () => {
      const organizations = await organizationService.getOrganizations();
      return { data: organizations, error: undefined };
    },
    update: async (id: string | number, data: Partial<Organization>) => {
      const result = await organizationService.updateOrganization(Number(id), data);
      return { data: result || undefined, error: undefined };
    },
    delete: async (id: string | number) => {
      const result = await organizationService.deleteOrganization(Number(id));
      return { data: undefined, error: result ? undefined : 'Failed to delete organization' };
    },

    // Success messages
    successMessages: {
      create: 'Organization created successfully',
      update: 'Organization updated successfully',
      delete: 'Organization deleted successfully',
    },

    // Error messages
    errorMessages: {
      create: 'Failed to create organization',
      update: 'Failed to update organization',
      delete: 'Failed to delete organization',
    },

    // Validation
    validateOnCreate: (data) => {
      if (!data.name) return 'Organization name is required';
      if (!data.email) return 'Organization email is required';
      return null;
    },

    validateOnUpdate: (data) => {
      if (!data.name) return 'Organization name is required';
      if (!data.email) return 'Organization email is required';
      return null;
    },

    // Optimistic updates for list views
    optimisticUpdates: true,
  });

  // Review management functions
  const createReview = useCallback(async (organizationId: number, review: Partial<Review>): Promise<Review | null> => {
    try {
      // Ensure required fields are provided with defaults
      const reviewData = {
        rating: review.rating || 0,
        title: '', // Review type doesn't have title, use empty string
        content: review.comment || '', // Use comment field for content
        pros: [], // Review type doesn't have pros
        cons: [], // Review type doesn't have cons
      };
      const result = await organizationService.createOrganizationReview(organizationId, reviewData);
      if (!result) {
        throw new Error('Failed to create review');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      organizationCRUD.setError(errorMessage);
      return null;
    }
  }, [organizationCRUD]);

  const getReviews = useCallback(async (organizationId: number): Promise<Review[]> => {
    try {
      const reviews = await organizationService.getOrganizationReviews(organizationId);
      return reviews;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      organizationCRUD.setError(errorMessage);
      return [];
    }
  }, [organizationCRUD]);

  const updateReview = useCallback(async (reviewId: number, review: Partial<Review>): Promise<Review | null> => {
    try {
      const result = await organizationService.updateReview(reviewId, review);
      if (!result) {
        throw new Error('Failed to update review');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
      organizationCRUD.setError(errorMessage);
      return null;
    }
  }, [organizationCRUD]);

  const deleteReview = useCallback(async (reviewId: number): Promise<boolean> => {
    try {
      await organizationService.deleteReview(reviewId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      organizationCRUD.setError(errorMessage);
      return false;
    }
  }, [organizationCRUD]);

  // Search and filtering functions
  const searchOrganizations = useCallback(async (query: string): Promise<Organization[]> => {
    try {
      const organizations = await organizationService.searchOrganizations(query);
      return organizations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search organizations';
      organizationCRUD.setError(errorMessage);
      return [];
    }
  }, [organizationCRUD]);

  const getOrganizationsByIndustry = useCallback(async (industryId: number): Promise<Organization[]> => {
    try {
      const organizations = await organizationService.getOrganizationsByIndustry(industryId.toString());
      return organizations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizations by industry';
      organizationCRUD.setError(errorMessage);
      return [];
    }
  }, [organizationCRUD]);

  return {
    // CRUD actions from base hook
    ...organizationCRUD,

    // Organization-specific actions
    createReview,
    getReviews,
    updateReview,
    deleteReview,

    // Search and filtering
    searchOrganizations,
    getOrganizationsByIndustry,
  };
}

export default useOrganization;