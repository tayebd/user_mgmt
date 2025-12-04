/**
 * useDebounce Hook Tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce, useDebouncedCallback } from '../useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', { delay: 100 }));

    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(() => useDebounce('initial', { delay: 100 }));

    act(() => {
      rerender('updated');
    });

    // Should still be initial value before delay
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be updated after delay
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on new value', () => {
    const { result, rerender } = renderHook(() => useDebounce('initial', { delay: 100 }));

    act(() => {
      rerender('first update');
    });

    act(() => {
      jest.advanceTimersByTime(50);
      rerender('second update');
    });

    // Fast-forward past first delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be second update, not first
    expect(result.current).toBe('second update');
  });

  it('handles leading edge option', () => {
    const { result, rerender } = renderHook(() => useDebounce('initial', { delay: 100, leading: true }));

    act(() => {
      rerender('updated');
    });

    // Should update immediately with leading edge
    expect(result.current).toBe('updated');
  });

  it('handles trailing edge option', () => {
    const { result, rerender } = renderHook(() => useDebounce('initial', { delay: 100, trailing: false }));

    act(() => {
      rerender('updated');
    });

    // Fast-forward past delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should not update with trailing disabled
    expect(result.current).toBe('initial');
  });

  it('handles max wait option', () => {
    const { result, rerender } = renderHook(() => useDebounce('initial', { delay: 100, maxWait: 200 }));

    act(() => {
      rerender('first update');
    });

    act(() => {
      jest.advanceTimersByTime(50);
      rerender('second update');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be first update
    expect(result.current).toBe('first update');

    act(() => {
      jest.advanceTimersByTime(150);
      rerender('third update');
    });

    // Should be third update (max wait triggered)
    expect(result.current).toBe('third update');
  });
});

describe('useDebouncedCallback Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns debounced callback function', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, { delay: 100 }));

    expect(typeof result.current).toBe('function');
  });

  it('delays callback execution', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, { delay: 100 }));

    act(() => {
      result.current('arg1');
    });

    // Should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should have been called after delay
    expect(mockCallback).toHaveBeenCalledWith('arg1');
  });

  it('cancels previous timeout', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, { delay: 100 }));

    act(() => {
      result.current('arg1');
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current('arg2');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should only have been called with second arg
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('arg2');
  });

  it('provides cancel method', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, { delay: 100 }));

    act(() => {
      result.current('arg1');
      result.current.cancel();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should not have been called due to cancellation
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('provides flush method', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, { delay: 100 }));

    act(() => {
      result.current('arg1');
      result.current.flush();
    });

    // Should have been called immediately
    expect(mockCallback).toHaveBeenCalledWith('arg1');
  });
});