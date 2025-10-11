import { apiClient, ApiError } from '../api-client';
import { TokenService } from '@/lib/supabase';

// Mock the TokenService
jest.mock('@/lib/supabase', () => ({
  TokenService: {
    getAuthorizationHeader: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('constructor', () => {
    it('should set default base URL and headers', () => {
      expect(apiClient['baseURL']).toBe('http://localhost:5000/api');
      expect(apiClient['defaultHeaders']).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should use environment variable for base URL', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = 'http://custom-api:3000/api';

      // Create a new instance to test environment variable usage
      const { apiClient: newClient } = require('../api-client');
      expect(newClient['baseURL']).toBe('http://custom-api:3000/api');

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('getAuthHeaders', () => {
    it('should include authorization header when token is available', async () => {
      (TokenService.getAuthorizationHeader as jest.Mock).mockResolvedValue('Bearer test-token');

      const headers = await apiClient['getAuthHeaders']();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      });
    });

    it('should return default headers when no token is available', async () => {
      (TokenService.getAuthorizationHeader as jest.Mock).mockResolvedValue(null);

      const headers = await apiClient['getAuthHeaders']();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should return default headers when token service throws error', async () => {
      (TokenService.getAuthorizationHeader as jest.Mock).mockRejectedValue(new Error('Token error'));

      const headers = await apiClient['getAuthHeaders']();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('handleResponse', () => {
    it('should return successful response data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      } as any;

      const result = await apiClient['handleResponse'](mockResponse);

      expect(result).toEqual({
        data: { data: 'test' },
        status: 200,
        success: true,
      });
    });

    it('should handle JSON error response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          message: 'Bad request',
          code: 'VALIDATION_ERROR',
        }),
      } as any;

      await expect(apiClient['handleResponse'](mockResponse)).rejects.toThrow();

      try {
        await apiClient['handleResponse'](mockResponse);
      } catch (error) {
        expect(error).toEqual({
          message: 'Bad request',
          status: 400,
          code: 'VALIDATION_ERROR',
          details: {
            message: 'Bad request',
            code: 'VALIDATION_ERROR',
          },
        });
      }
    });

    it('should handle text error response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Not JSON')),
        text: jest.fn().mockResolvedValue('Internal server error'),
      } as any;

      await expect(apiClient['handleResponse'](mockResponse)).rejects.toThrow();

      try {
        await apiClient['handleResponse'](mockResponse);
      } catch (error) {
        expect(error).toEqual({
          message: 'Internal server error',
          status: 500,
          details: 'Internal server error',
        });
      }
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      (TokenService.getAuthorizationHeader as jest.Mock).mockResolvedValue('Bearer test-token');
    });

    describe('GET', () => {
      it('should make GET request with auth headers', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ data: 'test' }),
        } as any);

        await apiClient.get('/test');

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          credentials: 'include',
        });
      });

      it('should make GET request without auth headers when required', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ data: 'test' }),
        } as any);

        await apiClient.get('/public', false);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/public', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      });
    });

    describe('POST', () => {
      it('should make POST request with data', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: jest.fn().mockResolvedValue({ id: 1 }),
        } as any);

        const data = { name: 'test' };
        await apiClient.post('/test', data);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });
      });
    });

    describe('PUT', () => {
      it('should make PUT request with data', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ updated: true }),
        } as any);

        const data = { name: 'updated' };
        await apiClient.put('/test/1', data);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/test/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });
      });
    });

    describe('DELETE', () => {
      it('should make DELETE request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 204,
          json: jest.fn().mockResolvedValue({}),
        } as any);

        await apiClient.delete('/test/1');

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/test/1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          credentials: 'include',
        });
      });
    });
  });

  describe('domain-specific methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any);
    });

    it('should call getUsers with correct endpoint', async () => {
      await apiClient.getUsers();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/users', {
        method: 'GET',
        headers: expect.any(Object),
        credentials: 'include',
      });
    });

    it('should call getCompanies without auth', async () => {
      await apiClient.getCompanies();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    });

    it('should call createSurveyResponse with custom headers', async () => {
      const responseData = { answer: 'test' };
      await apiClient.createSurveyResponse(1, responseData, 'custom-token');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/surveys/1/surveyResponses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'custom-token',
          },
          body: JSON.stringify(responseData),
        }
      );
    });
  });
});