/**
 * useQueryParams Hook
 * Manages URL query parameters with type safety
 * Provides easy ways to read, update, and remove query parameters
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';

export interface UseQueryParamsOptions {
  push?: boolean; // Use push instead of replace
  shallow?: boolean; // Shallow routing (default: true)
  scroll?: boolean; // Scroll to top after navigation (default: true)
}

export interface QueryParams {
  [key: string]: string | string[] | number | boolean | null | undefined;
}

export function useQueryParams<T extends QueryParams = QueryParams>(
  options: UseQueryParamsOptions = {}
): [T, (params: Partial<T> | ((prev: T) => Partial<T>)) => void, () => void] {
  const { push = false, shallow = true, scroll = true } = options;
  const router = useRouter();
  const searchParams = useNextSearchParams();
  
  // Parse current query params
  const getCurrentParams = useCallback((): T => {
    const params: any = {};
    
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      // Handle multiple values for the same key
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    
    // Convert string values to appropriate types
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // Handle arrays
      if (Array.isArray(value)) {
        params[key] = value;
        return;
      }
      
      // Handle boolean values
      if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      }
      // Handle numeric values
      else if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      }
      // Handle float values
      else if (/^\d*\.\d+$/.test(value)) {
        params[key] = parseFloat(value);
      }
      // Handle null/undefined
      else if (value === 'null' || value === 'undefined') {
        params[key] = null;
      }
    });
    
    return params as T;
  }, [searchParams]);

  const [params, setParams] = useState<T>(getCurrentParams);

  // Update params when URL changes
  useEffect(() => {
    setParams(getCurrentParams());
  }, [getCurrentParams]);

  // Update URL with new params
  const updateParams = useCallback((
    newParams: Partial<T> | ((prev: T) => Partial<T>)
  ) => {
    const updatedParams = typeof newParams === 'function' 
      ? { ...params, ...newParams(params) }
      : { ...params, ...newParams };
    
    // Build query string
    const searchParams = new URLSearchParams();
    
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return; // Skip null/undefined/empty values
      }
      
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== null && item !== undefined && item !== '') {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.set(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    const newPath = queryString 
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    
    // Navigate to new URL
    if (push) {
      router.push(newPath);
    } else {
      router.replace(newPath);
    }
  }, [params, router, push, shallow, scroll]);

  // Clear all params
  const clearParams = useCallback(() => {
    const newPath = window.location.pathname;
    
    if (push) {
      router.push(newPath);
    } else {
      router.replace(newPath);
    }
  }, [router, push, shallow, scroll]);

  return [params, updateParams, clearParams];
}

// Specialized hooks for common query parameter patterns
export function usePaginationParams(defaultPage = 1, defaultLimit = 10) {
  const [params, setParams, clearParams] = useQueryParams<{
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }>();

  const page = params.page || defaultPage;
  const limit = params.limit || defaultLimit;
  const sort = params.sort;
  const order = params.order;

  const setPage = useCallback((newPage: number | ((prev: number) => number)) => {
    setParams(prev => ({
      ...prev,
      page: typeof newPage === 'function' ? newPage(prev.page || defaultPage) : newPage
    }));
  }, [setParams, defaultPage]);

  const setLimit = useCallback((newLimit: number | ((prev: number) => number)) => {
    setParams(prev => ({
      ...prev,
      limit: typeof newLimit === 'function' ? newLimit(prev.limit || defaultLimit) : newLimit,
      page: 1 // Reset to first page when changing limit
    }));
  }, [setParams, defaultLimit]);

  const setSort = useCallback((newSort: string) => {
    setParams(prev => ({
      ...prev,
      sort: newSort,
      order: prev.order === 'asc' ? 'desc' : 'asc' // Toggle order if same sort field
    }));
  }, [setParams]);

  const setOrder = useCallback((newOrder: 'asc' | 'desc') => {
    setParams(prev => ({ ...prev, order: newOrder }));
  }, [setParams]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, [setPage]);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, [setPage]);

  const resetPagination = useCallback(() => {
    setParams({ page: defaultPage, limit: defaultLimit });
  }, [setParams, defaultPage, defaultLimit]);

  return {
    page,
    limit,
    sort,
    order,
    setPage,
    setLimit,
    setSort,
    setOrder,
    nextPage,
    prevPage,
    resetPagination,
    clearParams
  };
}

export function useFilterParams<T extends Record<string, any>>(defaultFilters: T) {
  const [params, setParams, clearParams] = useQueryParams<T>();

  const filters = { ...defaultFilters, ...params };

  const setFilter = useCallback((key: keyof T, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, [setParams]);

  const setFilters = useCallback((newFilters: Partial<T> | ((prev: T) => Partial<T>)) => {
    setParams(newFilters);
  }, [setParams]);

  const removeFilter = useCallback((key: keyof T) => {
    setParams(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, [setParams]);

  const clearFilters = useCallback(() => {
    setParams(defaultFilters);
  }, [setParams, defaultFilters]);

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key];
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    hasActiveFilters
  };
}

export function useSearchParams(defaultSearch = '') {
  const [params, setParams, clearParams] = useQueryParams<{
    search?: string;
    q?: string; // Alternative search parameter
  }>();

  const search = params.search || params.q || defaultSearch;

  const setSearch = useCallback((newSearch: string | ((prev: string) => string)) => {
    setParams(prev => ({
      ...prev,
      search: typeof newSearch === 'function' ? newSearch(prev.search || prev.q || defaultSearch) : newSearch,
      q: undefined // Clear alternative parameter
    }));
  }, [setParams, defaultSearch]);

  const clearSearch = useCallback(() => {
    setParams(prev => {
      const newParams = { ...prev };
      delete newParams.search;
      delete newParams.q;
      return newParams;
    });
  }, [setParams]);

  return {
    search,
    setSearch,
    clearSearch,
    hasSearch: search.length > 0
  };
}

export default useQueryParams;