/**
 * useQueryParams Hook Tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQueryParams, usePaginationParams, useFilterParams, useSearchParams } from '../useQueryParams';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  }),
  useSearchParams: mockUseSearchParams
}));

describe('useQueryParams Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams('param1=value1&param2=value2');
    mockUseSearchParams.mockReturnValue(mockSearchParams);
  });

  it('returns initial query params', () => {
    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      param1: 'value1',
      param2: 'value2'
    });
  });

  it('updates query params when URL changes', () => {
    const { result, rerender } = renderHook(() => useQueryParams());

    // Simulate URL change
    const newSearchParams = new URLSearchParams('param1=newValue');
    mockUseSearchParams.mockReturnValue(newSearchParams);

    act(() => {
      rerender();
    });

    expect(result.current).toEqual({
      param1: 'newValue'
    });
  });

  it('calls router.push when params change', () => {
    const { result, rerender } = renderHook(() => useQueryParams());

    act(() => {
      result.current[1]({ newParam: 'newValue' });
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('newParam=newValue')
    );
  });

  it('handles array values', () => {
    const mockSearchParams = new URLSearchParams('array=value1&array=value2');
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      array: ['value1', 'value2']
    });
  });

  it('converts string values to appropriate types', () => {
    const mockSearchParams = new URLSearchParams('bool=true&num=123&float=1.5');
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      bool: true,
      num: 123,
      float: 1.5
    });
  });
});

describe('usePaginationParams Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams('page=2&limit=20');
    mockUseSearchParams.mockReturnValue(mockSearchParams);
  });

  it('returns pagination params', () => {
    const { result } = renderHook(() => usePaginationParams());

    expect(result.current).toEqual({
      page: 2,
      limit: 20
    });
  });

  it('provides pagination helpers', () => {
    const { result } = renderHook(() => usePaginationParams());

    expect(typeof result.current.setPage).toBe('function');
    expect(typeof result.current.setLimit).toBe('function');
    expect(typeof result.current.nextPage).toBe('function');
    expect(typeof result.current.prevPage).toBe('function');
    expect(typeof result.current.resetPagination).toBe('function');
  });

  it('resets page when limit changes', () => {
    const { result, rerender } = renderHook(() => usePaginationParams());

    act(() => {
      result.current.setLimit(10);
    });

    expect(result.current.page).toBe(1);
  });
});

describe('useFilterParams Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams('status=active&category=electronics');
    mockUseSearchParams.mockReturnValue(mockSearchParams);
  });

  it('returns filter params', () => {
    const { result } = renderHook(() => useFilterParams({
      status: 'all',
      category: 'all'
    }));

    expect(result.current).toEqual({
      status: 'active',
      category: 'electronics'
    });
  });

  it('provides filter helpers', () => {
    const { result } = renderHook(() => useFilterParams({
      status: 'all',
      category: 'all'
    }));

    expect(typeof result.current.setFilter).toBe('function');
    expect(typeof result.current.removeFilter).toBe('function');
    expect(typeof result.current.clearFilters).toBe('function');
    expect(typeof result.current.hasActiveFilters).toBe('function');
  });

  it('detects active filters', () => {
    const { result } = renderHook(() => useFilterParams({
      status: 'all',
      category: 'all'
    }));

    expect(result.current.hasActiveFilters()).toBe(true);
  });
});

describe('useSearchParams Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams('q=test+query');
    mockUseSearchParams.mockReturnValue(mockSearchParams);
  });

  it('returns search params', () => {
    const { result } = renderHook(() => useSearchParams());

    expect(result.current).toEqual({
      q: 'test query'
    });
  });

  it('provides search helpers', () => {
    const { result } = renderHook(() => useSearchParams());

    expect(typeof result.current.setSearch).toBe('function');
    expect(typeof result.current.clearSearch).toBe('function');
    expect(typeof result.current.hasSearch).toBe('function');
  });

  it('detects active search', () => {
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.hasSearch()).toBe(true);
  });
});