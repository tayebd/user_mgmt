/**
 * useLocalStorage Hook
 * Synchronizes state with localStorage
 * Provides automatic serialization/deserialization and error handling
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  onError?: (error: Error) => void;
  syncAcrossTabs?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serializer, onError, syncAcrossTabs = false } = options;
  
  // Default serializers
  const defaultSerializer = {
    read: (value: string): T => {
      try {
        return JSON.parse(value);
      } catch {
        return initialValue;
      }
    },
    write: (value: T): string => JSON.stringify(value)
  };
  
  const finalSerializer = serializer || defaultSerializer;
  
  // Get initial value from localStorage or use provided initial value
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return finalSerializer.read(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      onError?.(error as Error);
      return initialValue;
    }
  }, [key, initialValue, finalSerializer, onError]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Set value in localStorage and state
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, finalSerializer.write(valueToStore));
      
      // Dispatch custom event for cross-tab synchronization
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('localStorage-update', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      onError?.(error as Error);
    }
  }, [key, storedValue, finalSerializer, onError, syncAcrossTabs]);

  // Remove value from localStorage and reset state
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('localStorage-update', {
          detail: { key, value: initialValue }
        }));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      onError?.(error as Error);
    }
  }, [key, initialValue, onError, syncAcrossTabs]);

  // Listen for storage events (for cross-tab synchronization)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = finalSerializer.read(event.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
          onError?.(error as Error);
        }
      }
    };

    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail.key === key) {
        setStoredValue(event.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-update', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-update', handleCustomEvent as EventListener);
    };
  }, [key, finalSerializer, onError, syncAcrossTabs]);

  // Update state when key or initial value changes
  useEffect(() => {
    setStoredValue(getStoredValue());
  }, [getStoredValue]);

  return [storedValue, setValue, removeValue];
}

// Specialized hooks for common use cases
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean,
  options?: Omit<UseLocalStorageOptions<boolean>, 'serializer'>
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void, () => void] {
  return useLocalStorage(key, initialValue, options);
}

export function useLocalStorageNumber(
  key: string,
  initialValue: number,
  options?: Omit<UseLocalStorageOptions<number>, 'serializer'>
): [number, (value: number | ((prev: number) => number)) => void, () => void] {
  return useLocalStorage(key, initialValue, options);
}

export function useLocalStorageString(
  key: string,
  initialValue: string,
  options?: Omit<UseLocalStorageOptions<string>, 'serializer'>
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  return useLocalStorage(key, initialValue, options);
}

export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T,
  options?: Omit<UseLocalStorageOptions<T>, 'serializer'>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useLocalStorage(key, initialValue, options);
}

// Hook for managing localStorage with expiration
export function useLocalStorageWithExpiration<T>(
  key: string,
  initialValue: T,
  ttl: number, // Time to live in milliseconds
  options?: Omit<UseLocalStorageOptions<T>, 'serializer'>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = `${key}_with_expiration`;
  
  const serializer = {
    read: (value: string): T => {
      try {
        const parsed = JSON.parse(value);
        if (parsed.expiration && Date.now() > parsed.expiration) {
          return initialValue;
        }
        return parsed.data;
      } catch {
        return initialValue;
      }
    },
    write: (value: T): string => {
      return JSON.stringify({
        data: value,
        expiration: Date.now() + ttl
      });
    }
  };

  return useLocalStorage(storageKey, initialValue, { ...options, serializer });
}

export default useLocalStorage;