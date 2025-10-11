import { TokenService } from '@/lib/supabase';

// Import shared types from server
import type { PVPanel, Inverter, PVProject } from '@/shared/types';

// Server response types based on existing patterns
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
}

// API endpoints based on server routes
const API_ENDPOINTS = {
  USERS: '/users',
  COMPANIES: '/companies',
  SURVEYS: '/surveys',
  PV_PANELS: '/pv-panels',
  INVERTERS: '/inverters',
  PROJECTS: '/projects',
  PV_PROJECTS: '/pv-projects',
  TASKS: '/tasks',
} as const;

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const authHeader = await TokenService.getAuthorizationHeader();
      if (authHeader) {
        return {
          ...this.defaultHeaders,
          Authorization: authHeader,
        };
      }
      // Return headers without auth if no token available
      return this.defaultHeaders;
    } catch (error) {
      // Return headers without auth for public endpoints
      return this.defaultHeaders;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const error: ApiError = {
        message: typeof errorData === 'string' ? errorData :
                 (errorData as { message?: string })?.message || 'Unknown error occurred',
        status: response.status,
        code: (errorData as { code?: string })?.code,
        details: errorData,
      };

      throw error;
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      success: true,
    };
  }

  // Generic HTTP methods
  async get<T>(url: string, requiresAuth = true): Promise<ApiResponse<T>> {
    const headers = requiresAuth ? await this.getAuthHeaders() : this.defaultHeaders;

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    const headers = requiresAuth ? await this.getAuthHeaders() : this.defaultHeaders;

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    const headers = requiresAuth ? await this.getAuthHeaders() : this.defaultHeaders;

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, requiresAuth = true): Promise<ApiResponse<T>> {
    const headers = requiresAuth ? await this.getAuthHeaders() : this.defaultHeaders;

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  // Domain-specific methods

  // Users
  async getUsers() {
    return this.get<Array<unknown>>(API_ENDPOINTS.USERS);
  }

  async getUserByUid(uid: string) {
    return this.get<unknown>(`${API_ENDPOINTS.USERS}/uid/${uid}`);
  }

  async createUser(user: unknown) {
    return this.post<unknown>(API_ENDPOINTS.USERS, user);
  }

  // Companies
  async getCompanies() {
    return this.get<Array<unknown>>(API_ENDPOINTS.COMPANIES, false);
  }

  async getCompanyById(id: number) {
    return this.get<unknown>(`${API_ENDPOINTS.COMPANIES}/${id}`, false);
  }

  async createCompany(company: unknown) {
    return this.post<unknown>(API_ENDPOINTS.COMPANIES, company);
  }

  // Surveys
  async getSurveys() {
    return this.get<Array<unknown>>(API_ENDPOINTS.SURVEYS, false);
  }

  async getSurveyById(id: number) {
    return this.get<unknown>(`${API_ENDPOINTS.SURVEYS}/${id}`, false);
  }

  async createSurvey(survey: unknown) {
    return this.post<unknown>(API_ENDPOINTS.SURVEYS, survey);
  }

  async createSurveyResponse(surveyId: number, response: unknown, authToken?: string) {
    const headers = {
      ...this.defaultHeaders,
      Authorization: authToken || (await TokenService.getAuthorizationHeader()) || '',
    };

    const fetchResponse = await fetch(
      `${this.baseURL}${API_ENDPOINTS.SURVEYS}/${surveyId}/surveyResponses`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(response),
      }
    );

    return this.handleResponse<unknown>(fetchResponse);
  }

  // PV Panels
  async getPVPanels(page = 1, limit = 50) {
    return this.get<PVPanel[]>(`${API_ENDPOINTS.PV_PANELS}?page=${page}&limit=${limit}`, false);
  }

  async getPVPanelById(id: number) {
    return this.get<PVPanel>(`${API_ENDPOINTS.PV_PANELS}/${id}`, false);
  }

  // Inverters
  async getInverters(page = 1, limit = 50) {
    return this.get<Inverter[]>(`${API_ENDPOINTS.INVERTERS}?page=${page}&limit=${limit}`, false);
  }

  // PV Projects
  async createPVProject(project: PVProject) {
    return this.post<PVProject>(API_ENDPOINTS.PV_PROJECTS, project);
  }

  async getPVProject() {
    return this.get<PVProject>(API_ENDPOINTS.PV_PROJECTS);
  }

  async updatePVProject(id: number, project: Partial<PVProject>) {
    return this.put<PVProject>(`${API_ENDPOINTS.PV_PROJECTS}/${id}`, project);
  }

  async deletePVProject(id: number) {
    return this.delete<void>(`${API_ENDPOINTS.PV_PROJECTS}/${id}`);
  }
}

export const apiClient = new ApiClient();