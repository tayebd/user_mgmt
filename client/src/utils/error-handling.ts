import { ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  logError?: boolean;
}

export class ErrorHandler {
  static handle(
    error: unknown,
    options: ErrorHandlerOptions = { showToast: true, logError: true }
  ): string {
    let errorMessage = options.fallbackMessage || 'An unexpected error occurred';

    // Handle ApiError from our API client
    if (this.isApiError(error)) {
      errorMessage = error.message;

      // Handle specific error codes
      switch (error.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    // Handle network errors
    else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    // Handle generic errors
    else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Log error if enabled
    if (options.logError) {
      console.error('Error handled:', {
        message: errorMessage,
        originalError: error,
        timestamp: new Date().toISOString(),
      });
    }

    // Show toast if enabled
    if (options.showToast) {
      toast.error(errorMessage);
    }

    return errorMessage;
  }

  static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'status' in error
    );
  }

  static isNetworkError(error: unknown): boolean {
    return (
      error instanceof TypeError &&
      (error.message.includes('fetch') || error.message.includes('network'))
    );
  }

  static isAuthenticationError(error: unknown): boolean {
    return (
      this.isApiError(error) &&
      (error.status === 401 || error.message.includes('authentication'))
    );
  }

  static isNotFoundError(error: unknown): boolean {
    return this.isApiError(error) && error.status === 404;
  }
}

// Hook for consistent error handling in components
export function useErrorHandler() {
  const handleError = (
    error: unknown,
    options?: ErrorHandlerOptions
  ): string => {
    return ErrorHandler.handle(error, options);
  };

  const handleApiError = (
    error: unknown,
    fallbackMessage?: string
  ): string => {
    return ErrorHandler.handle(error, {
      showToast: true,
      logError: true,
      fallbackMessage,
    });
  };

  return {
    handleError,
    handleApiError,
    isApiError: ErrorHandler.isApiError,
    isNetworkError: ErrorHandler.isNetworkError,
    isAuthenticationError: ErrorHandler.isAuthenticationError,
    isNotFoundError: ErrorHandler.isNotFoundError,
  };
}

// Export static methods for use in non-React contexts (like Zustand stores)
export const {
  handle: handleError,
  isApiError,
  isNetworkError,
  isAuthenticationError,
  isNotFoundError,
} = ErrorHandler;

// Export aliases for compatibility
export const isAuthError = isAuthenticationError;
export const isServerError = (error: unknown): boolean => {
  return isApiError(error) && error.status >= 500;
};

export function handleApiError(error: unknown, fallbackMessage?: string): string {
  return ErrorHandler.handle(error, {
    showToast: true,
    logError: true,
    fallbackMessage,
  });
}