/**
 * Company Service
 * Handles all company-related API operations
 * Extracted from the monolithic API store
 */

import { apiClient, ApiResponse } from './api-client';
import { Company, Review } from '@/types';

export interface CreateCompanyParams {
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  industry?: string;
  size?: string;
}

export interface UpdateCompanyParams extends Partial<CreateCompanyParams> {
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
 * Company Service Class
 * Provides methods for company CRUD operations and review management
 */
export class CompanyService {
  /**
   * Fetch all companies
   */
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<Company[]>('/companies');

    if (!response.ok || !response.data) {
      console.error('[Company Service] Failed to fetch companies:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Fetch a single company by ID
   */
  async getCompanyById(companyId: number): Promise<Company | null> {
    const response = await apiClient.get<Company>(`/companies/${companyId}`);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to fetch company ${companyId}:`, response.error);
      return null;
    }

    return response.data;
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: CreateCompanyParams): Promise<Company | null> {
    const response = await apiClient.post<Company>('/companies', companyData, true);

    if (!response.ok || !response.data) {
      console.error('[Company Service] Failed to create company:', response.error);
      return null;
    }

    console.log('[Company Service] Company created successfully:', response.data);
    return response.data;
  }

  /**
   * Update an existing company
   */
  async updateCompany(companyId: number, companyData: Partial<CreateCompanyParams>): Promise<Company | null> {
    const response = await apiClient.put<Company>(`/companies/${companyId}`, companyData, true);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to update company ${companyId}:`, response.error);
      return null;
    }

    console.log(`[Company Service] Company ${companyId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a company
   */
  async deleteCompany(companyId: number): Promise<boolean> {
    const response = await apiClient.delete(`/companies/${companyId}`, true);

    if (!response.ok) {
      console.error(`[Company Service] Failed to delete company ${companyId}:`, response.error);
      return false;
    }

    console.log(`[Company Service] Company ${companyId} deleted successfully`);
    return true;
  }

  /**
   * Fetch reviews for a company
   */
  async getCompanyReviews(companyId: number): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/companies/${companyId}/reviews`);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to fetch reviews for company ${companyId}:`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Create a review for a company
   */
  async createCompanyReview(companyId: number, reviewData: CreateReviewParams): Promise<Review | null> {
    const response = await apiClient.post<Review>(`/companies/${companyId}/reviews`, reviewData, true);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to create review for company ${companyId}:`, response.error);
      return null;
    }

    console.log(`[Company Service] Review created for company ${companyId}:`, response.data);
    return response.data;
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: number, reviewData: Partial<CreateReviewParams>): Promise<Review | null> {
    const response = await apiClient.put<Review>(`/reviews/${reviewId}`, reviewData, true);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to update review ${reviewId}:`, response.error);
      return null;
    }

    console.log(`[Company Service] Review ${reviewId} updated successfully:`, response.data);
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number): Promise<boolean> {
    const response = await apiClient.delete(`/reviews/${reviewId}`, true);

    if (!response.ok) {
      console.error(`[Company Service] Failed to delete review ${reviewId}:`, response.error);
      return false;
    }

    console.log(`[Company Service] Review ${reviewId} deleted successfully`);
    return true;
  }

  /**
   * Search companies by name or other criteria
   */
  async searchCompanies(query: string): Promise<Company[]> {
    const response = await apiClient.get<Company[]>(`/companies/search?q=${encodeURIComponent(query)}`);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to search companies with query "${query}":`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    // reviewDistribution: Record<number, number>;
  } | null> {
    const response = await apiClient.get(`/companies/${companyId}/stats`);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to fetch stats for company ${companyId}:`, response.error);
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
   * Get featured companies
   */
  async getFeaturedCompanies(): Promise<Company[]> {
    const response = await apiClient.get<Company[]>('/companies/featured');

    if (!response.ok || !response.data) {
      console.error('[Company Service] Failed to fetch featured companies:', response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Get companies by industry
   */
  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    const response = await apiClient.get<Company[]>(`/companies/industry/${encodeURIComponent(industry)}`);

    if (!response.ok || !response.data) {
      console.error(`[Company Service] Failed to fetch companies in industry "${industry}":`, response.error);
      return [];
    }

    return response.data;
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(companyId: number, file: File): Promise<{ url: string } | null> {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/logo`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: await apiClient.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`[Company Service] Failed to upload logo for company ${companyId}:`, error);
        return null;
      }

      const result = await response.json();
      console.log(`[Company Service] Logo uploaded for company ${companyId}:`, result);
      return result;
    } catch (error) {
      console.error(`[Company Service] Logo upload error for company ${companyId}:`, error);
      return null;
    }
  }

  /**
   * Validate company data
   */
  validateCompanyData(data: CreateCompanyParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Company name is required');
    }

    if (data.name && data.name.length > 200) {
      errors.push('Company name must be less than 200 characters');
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
export const companyService = new CompanyService();