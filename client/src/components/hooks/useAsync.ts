/**
 * useAsync Hook
 * Handles async operations with loading, error, and data states
 * Provides consistent error handling and retry functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  immediate?: boolean;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => void;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const {
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
    immediate = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const mountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);

  // Update ref when function changes
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!mountedRef.current) return null;

    setLoading(true);
    setError(null);
    setRetryAttempt(0);

    try {
      const result = await asyncFunctionRef.current(...args);
      
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      if (!mountedRef.current) return null;
      
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (retryAttempt < retryCount - 1) {
        // Retry logic
        setRetryAttempt(prev => prev + 1);
        setTimeout(() => {
          execute(...args);
        }, retryDelay * Math.pow(2, retryAttempt)); // Exponential backoff
      } else {
        // Final error
        if (mountedRef.current) {
          setError(error);
          setLoading(false);
          onError?.(error);
        }
      }
      
      return null;
    }
  }, [asyncFunctionRef, onSuccess, onError, retryCount, retryDelay, retryAttempt]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setRetryAttempt(0);
  }, []);

  const retry = useCallback(() => {
    if (error && retryAttempt < retryCount) {
      execute();
    }
  }, [error, retryAttempt, retryCount, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry
  };
}

export default useAsync;