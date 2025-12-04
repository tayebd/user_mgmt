/**
 * useAsync Hook Tests
 * Tests for the async operation management hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/components/hooks/useAsync';

describe('useAsync Hook', () => {
  const mockAsyncFunction = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction)
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.retry).toBe('function');
  });

  it('should execute async function successfully', async () => {
    const mockData = { id: 1, name: 'test' };
    mockAsyncFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction, { onSuccess: mockSuccess })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await mockAsyncFunction.mock.results[0].value;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should handle async function errors', async () => {
    const mockErrorObj = new Error('Test error');
    mockAsyncFunction.mockRejectedValue(mockErrorObj);

    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction, { onError: mockError, retryCount: 0 })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      try {
        await mockAsyncFunction.mock.results[0].value;
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockErrorObj);
    expect(mockError).toHaveBeenCalledWith(mockErrorObj);
  });

  it('should reset state', async () => {
    const mockData = { success: true };
    mockAsyncFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction)
    );

    // Execute and get data
    act(() => {
      result.current.execute();
    });

    await act(async () => {
      await mockAsyncFunction.mock.results[0].value;
    });

    expect(result.current.data).toEqual(mockData);

    // Reset state
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should execute immediately when immediate option is true', () => {
    mockAsyncFunction.mockResolvedValue({ success: true });

    renderHook(() =>
      useAsync(mockAsyncFunction, { immediate: true })
    );

    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it('should not execute immediately when immediate option is false', () => {
    mockAsyncFunction.mockResolvedValue({ success: true });

    renderHook(() =>
      useAsync(mockAsyncFunction, { immediate: false })
    );

    expect(mockAsyncFunction).not.toHaveBeenCalled();
  });

  it('should pass arguments to async function', async () => {
    const mockData = { result: 'success' };
    mockAsyncFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction)
    );

    const testArgs = ['arg1', 'arg2', 'arg3'];

    act(() => {
      result.current.execute(...testArgs);
    });

    await act(async () => {
      await mockAsyncFunction.mock.results[0].value;
    });

    expect(mockAsyncFunction).toHaveBeenCalledWith(...testArgs);
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle non-Error errors', async () => {
    mockAsyncFunction.mockRejectedValue('String error');

    const { result } = renderHook(() =>
      useAsync(mockAsyncFunction, { retryCount: 0 })
    );

    act(() => {
      result.current.execute();
    });

    await act(async () => {
      try {
        await mockAsyncFunction.mock.results[0].value;
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
  });

  it('should handle undefined async function', async () => {
    const { result } = renderHook(() =>
      useAsync(undefined as any, { retryCount: 0 })
    );

    act(() => {
      result.current.execute();
    });

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should handle component unmount', async () => {
    const mockData = { success: true };
    mockAsyncFunction.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockData), 1000))
    );

    const { result, unmount } = renderHook(() =>
      useAsync(mockAsyncFunction)
    );

    act(() => {
      result.current.execute();
    });

    // Unmount component before async function completes
    unmount();

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });
});