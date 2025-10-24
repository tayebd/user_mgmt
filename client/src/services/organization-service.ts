/**
 * Organization Service
 * Handles all organization-related API operations
 * Extracted from the monolithic API store
 */

import { apiClient, ApiResponse } from './api-client';
import { Organization, Review } from '@/types';

export interface CreateOrganizationParams {
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  industry?: string;
  size?: string;
}

export interface UpdateOrganizationParams extends Partial<CreateOrganizationParams> {
  id: number;
}

export interface CreateReviewParams {
  rating: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
}

/**
 * Organization Service Class
 * Provides methods for organization CRUD operations and review management
 */
export class OrganizationService {
  /**
   * Fetch all organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>('/organizations');

    if (!response.ok || !response.data) {
      console.error('[Organization Service] Failed to fetch organizations:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single organization by ID
   */
  async getOrganizationById(organizationId: number): Promise<Organization | null> {
    const response = await apiClient.get<Organization>(`/organizations/${organizationId}`);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to fetch organization ${organizationId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Create a new organization
   */
  async createOrganization(organizationData: CreateOrganizationParams): Promise<Organization | null> {
    const response = await apiClient.post<Organization>('/organizations', organizationData, true);

    if (!response.ok || !response.data) {
      console.error('[Organization Service] Failed to create organization:', response.error);
      return null;
    }

    console.log('[Organization Service] Organization created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(organizationId: number, organizationData: Partial<CreateOrganizationParams>): Promise<Organization | null> {
    const response = await apiClient.put<Organization>(`/organizations/${organizationId}`, organizationData, true);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to update organization ${organizationId}:`, response.error);
      return null;
    }

    console.log(`[Organization Service] Organization ${organizationId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a organization
   */
  async deleteOrganization(organizationId: number): Promise<boolean> {
    const response = await apiClient.delete(`/organizations/${organizationId}`, true);

    if (!response.ok) {
      console.error(`[Organization Service] Failed to delete organization ${organizationId}:`, response.error);
      return false;
    }

    console.log(`[Organization Service] Organization ${organizationId} deleted successfully`);
    return true;
  }

  /**
   * Fetch reviews for a organization
   */
  async getOrganizationReviews(organizationId: number): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/organizations/${organizationId}/reviews`);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to fetch reviews for organization ${organizationId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Create a review for a organization
   */
  async createOrganizationReview(organizationId: number, reviewData: CreateReviewParams): Promise<Review | null> {
    const response = await apiClient.post<Review>(`/organizations/${organizationId}/reviews`, reviewData, true);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to create review for organization ${organizationId}:`, response.error);
      return null;
    }

    console.log(`[Organization Service] Review created for organization ${organizationId}:`, response.data);
    return response.data;
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: number, reviewData: Partial<CreateReviewParams>): Promise<Review | null> {
    const response = await apiClient.put<Review>(`/reviews/${reviewId}`, reviewData, true);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to update review ${reviewId}:`, response.error);
      return null;
    }

    console.log(`[Organization Service] Review ${reviewId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number): Promise<boolean> {
    const response = await apiClient.delete(`/reviews/${reviewId}`, true);

    if (!response.ok) {
      console.error(`[Organization Service] Failed to delete review ${reviewId}:`, response.error);
      return false;
    }

    console.log(`[Organization Service] Review ${reviewId} deleted successfully`);
    return true;
  }

  /**
   * Search organizations by name or other criteria
   */
  async searchOrganizations(query: string): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(`/organizations/search?q=${encodeURIComponent(query)}`);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to search organizations with query "${query}":`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(organizationId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    // reviewDistribution: Record<number, number>;
  } | null> {
    const response = await apiClient.get(`/organizations/${organizationId}/stats`);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to fetch stats for organization ${organizationId}:`, response.error);
      return null;
    }

    return response.data as {
      averageRating: number;
      totalReviews: number;
      totalProjects: number;
      createdAt: string;
    };
  }

  /**
   * Get featured organizations
   */
  async getFeaturedOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>('/organizations/featured');

    if (!response.ok || !response.data) {
      console.error('[Organization Service] Failed to fetch featured organizations:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get organizations by industry
   */
  async getOrganizationsByIndustry(industry: string): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(`/organizations/industry/${encodeURIComponent(industry)}`);

    if (!response.ok || !response.data) {
      console.error(`[Organization Service] Failed to fetch organizations in industry "${industry}":`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Upload organization logo
   */
  async uploadOrganizationLogo(organizationId: number, file: File): Promise<{ url: string } | null> {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${organizationId}/logo`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: await apiClient.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`[Organization Service] Failed to upload logo for organization ${organizationId}:`, error);
        return null;
      }

      const result = await response.json();
      console.log(`[Organization Service] Logo uploaded for organization ${organizationId}:`, result);
      return result;
    } catch (error) {
      console.error(`[Organization Service] Logo upload error for organization ${organizationId}:`, error);
      return null;
    }
  }

  /**
   * Validate organization data
   */
  validateOrganizationData(data: CreateOrganizationParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Organization name is required');
    }

    if (data.name && data.name.length > 200) {
      errors.push('Organization name must be less than 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.website && !this.isValidUrl(data.website)) {
      errors.push('Invalid website URL format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate review data
   */
  validateReviewData(data: CreateReviewParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Review title must be less than 200 characters');
    }

    if (data.content && data.content.length > 2000) {
      errors.push('Review content must be less than 2000 characters');
    }

    if (data.pros && data.pros.length > 10) {
      errors.push('Maximum 10 pros allowed');
    }

    if (data.cons && data.cons.length > 10) {
      errors.push('Maximum 10 cons allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper method to validate email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper method to validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}

// Create singleton instance
export const organizationService = new OrganizationService();