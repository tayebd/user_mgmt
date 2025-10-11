import {
  useErrorHandler,
  ErrorHandler,
  isNetworkError,
  isAuthError,
  isNotFoundError,
  isServerError,
  handleApiError
} from '../error-handling';

describe('ErrorHandler', () => {
  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      const result = handleApiError(networkError, 'Failed to fetch data');

      expect(result).toBe('Network error. Please check your connection and try again.');
    });

    it('should handle authentication errors', () => {
      const authError = { status: 401, message: 'Unauthorized' };
      const result = handleApiError(authError, 'Failed to authenticate');

      expect(result).toBe('Authentication required. Please log in again.');
    });

    it('should handle not found errors', () => {
      const notFoundError = { status: 404, message: 'Not found' };
      const result = handleApiError(notFoundError, 'Failed to find resource');

      expect(result).toBe('The requested resource was not found.');
    });

    it('should handle server errors', () => {
      const serverError = { status: 500, message: 'Internal server error' };
      const result = handleApiError(serverError, 'Failed to process request');

      expect(result).toBe('Server error. Please try again later.');
    });

    it('should handle unknown errors with default message', () => {
      const unknownError = new Error('Some unknown error');
      const result = handleApiError(unknownError);

      expect(result).toBe('An unexpected error occurred');
    });

    it('should handle string errors', () => {
      const stringError = 'String error message';
      const result = handleApiError(stringError, 'Custom operation failed');

      expect(result).toBe('Custom operation failed');
    });

    it('should handle null/undefined errors', () => {
      const result = handleApiError(null, 'Operation failed');

      expect(result).toBe('Operation failed');
    });
  });

  describe('error classification', () => {
    it('should identify network errors', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('Some other error'))).toBe(false);
    });

    it('should identify authentication errors', () => {
      expect(isAuthError({ status: 401 })).toBe(true);
      expect(isAuthError({ status: 403 })).toBe(true);
      expect(isAuthError({ status: 400 })).toBe(false);
      expect(isAuthError(new Error('Unauthorized'))).toBe(true);
    });

    it('should identify not found errors', () => {
      expect(isNotFoundError({ status: 404 })).toBe(true);
      expect(isNotFoundError(new Error('Not found'))).toBe(true);
      expect(isNotFoundError({ status: 400 })).toBe(false);
    });

    it('should identify server errors', () => {
      expect(isServerError({ status: 500 })).toBe(true);
      expect(isServerError({ status: 502 })).toBe(true);
      expect(isServerError({ status: 400 })).toBe(false);
    });
  });

  describe('useErrorHandler hook', () => {
    it('should return error handling functions', () => {
      const handler = useErrorHandler();
      expect(handler).toHaveProperty('handleError');
      expect(handler).toHaveProperty('handleApiError');
      expect(handler).toHaveProperty('isApiError');
      expect(handler).toHaveProperty('isNetworkError');
      expect(handler).toHaveProperty('isAuthenticationError');
      expect(handler).toHaveProperty('isNotFoundError');
    });

    it('should return different instances on subsequent calls', () => {
      const handler1 = useErrorHandler();
      const handler2 = useErrorHandler();
      expect(handler1).not.toBe(handler2);
    });
  });

  describe('error logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log errors when logging is enabled', () => {
      const error = new Error('Test error');
      handleApiError(error, 'Test operation');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});