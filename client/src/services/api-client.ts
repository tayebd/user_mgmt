/**
 * Base HTTP Client with interceptors for API communication
 * Replaces repetitive fetch patterns across the application
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  requireAuth?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.defaultTimeout = 10000; // 10 seconds
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Makes an HTTP request with automatic token injection and error handling
   */
  async request<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.defaultTimeout,
      requireAuth = false
    } = config;

    const url = `${this.baseUrl}${endpoint}`;

    try {
      // Build request headers
      const requestHeaders = new Headers({
        ...this.defaultHeaders,
        ...headers,
      });

      // Add authentication token if required
      if (requireAuth) {
        const token = await this.getAuthToken();
        if (token) {
          requestHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      // Prepare request body
      const requestBody = body ? JSON.stringify(body) : undefined;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      console.log(`[API Client] ${method} ${url}`, { body, requireAuth });

      // Make the request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      const data = await response.json();

      const result: ApiResponse<T> = {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || data.error || 'Request failed',
        status: response.status,
        ok: response.ok,
      };

      console.log(`[API Client] Response ${method} ${url}`, {
        status: response.status,
        ok: response.ok,
        hasData: !!data,
        error: result.error,
      });

      return result;

    } catch (error) {
      console.error(`[API Client] Error ${method} ${url}`, error);

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: `Request timeout after ${timeout}ms`,
            status: 408,
            ok: false,
          };
        }

        if (error.message.includes('Failed to fetch')) {
          return {
            error: 'Network error - please check your connection',
            status: 0,
            ok: false,
          };
        }
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
        ok: false,
      };
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<T = unknown>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requireAuth });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requireAuth });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requireAuth });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T = unknown>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth });
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requireAuth });
  }

  /**
   * Gets authentication token - will be replaced with auth service
   * @private
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // This will be replaced with the auth service
      const { getAuthToken } = await import('@/utils/auth');
      return await getAuthToken();
    } catch (error) {
      console.error('[API Client] Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Sets a default header for all requests
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Removes a default header
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Updates the base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { getAuthToken } = await import('@/utils/auth');
      const token = await getAuthToken();

      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }

      return { 'Content-Type': 'application/json' };
    } catch (error) {
      console.error('[API Client] Failed to get auth headers:', error);
      return { 'Content-Type': 'application/json' };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Interfaces are already exported above when declared