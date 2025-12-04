/**
 * useDebounce Hook
 * Debounces a value, delaying updates until a specified delay has passed
 * Useful for search inputs, API calls, and other performance-critical operations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): T {
  const { delay = 300, leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [maxTimeoutId, setMaxTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    // Clear max wait timeout if it exists
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      setMaxTimeoutId(null);
    }
    
    // If leading edge is enabled and this is the first call
    if (leading && timeSinceLastCall >= delay) {
      setDebouncedValue(value);
      setLastCallTime(now);
      return;
    }
    
    // Set up new timeout
    const newTimeoutId = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
        setLastCallTime(Date.now());
      }
      setTimeoutId(null);
    }, delay);
    
    setTimeoutId(newTimeoutId);
    
    // Set up max wait timeout if specified
    if (maxWait && maxWait > delay) {
      const newMaxTimeoutId = setTimeout(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        setDebouncedValue(value);
        setLastCallTime(Date.now());
        setMaxTimeoutId(null);
      }, maxWait - timeSinceLastCall);
      
      setMaxTimeoutId(newMaxTimeoutId);
    }
    
    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
      if (maxWait && maxWait > delay) {
        clearTimeout(newTimeoutId);
      }
    };
  }, [value, delay, leading, trailing, maxWait, lastCallTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
    };
  }, [timeoutId, maxTimeoutId]);

  return debouncedValue;
}

// Alternative version that returns a debounced function
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(Date.now());
  const argsRef = useRef<Parameters<T> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (argsRef.current) {
      callback(...argsRef.current);
      argsRef.current = null;
      lastCallTimeRef.current = Date.now();
    }
  }, [callback]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    
    argsRef.current = args;
    
    cancel();
    
    // If leading edge is enabled and enough time has passed
    if (leading && timeSinceLastCall >= delay) {
      callback(...args);
      lastCallTimeRef.current = now;
      argsRef.current = null;
      return;
    }
    
    // Set up timeout for trailing edge
    timeoutRef.current = setTimeout(() => {
      if (trailing && argsRef.current) {
        callback(...argsRef.current);
        argsRef.current = null;
        lastCallTimeRef.current = Date.now();
      }
      timeoutRef.current = null;
    }, delay);
    
    // Set up max wait timeout if specified
    if (maxWait && maxWait > delay) {
      maxTimeoutRef.current = setTimeout(() => {
        cancel();
        if (argsRef.current) {
          callback(...argsRef.current);
          argsRef.current = null;
          lastCallTimeRef.current = Date.now();
        }
      }, maxWait - timeSinceLastCall);
    }
  }, [callback, delay, leading, trailing, maxWait, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  // Attach cancel and flush methods to the function
  (debouncedCallback as any).cancel = cancel;
  (debouncedCallback as any).flush = flush;

  return debouncedCallback as T;
}

export default useDebounce;