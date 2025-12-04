/**
 * useLocalStorage Hook Tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage, useLocalStorageBoolean, useLocalStorageNumber, useLocalStorageString, useLocalStorageObject, useLocalStorageWithExpiration } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('returns initial value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('stored value');
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'default value'));
    
    expect(result.current).toBe('stored value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });

  it('returns default value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'default value'));
    
    expect(result.current).toBe('default value');
  });

  it('updates localStorage when value changes', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('testKey', 'default value'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', 'new value');
    expect(result.current).toBe('new value');
  });

  it('handles remove function', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default value'));
    
    act(() => {
      result.current[2]();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
    expect(result.current).toBe('default value');
  });

  it('handles custom serializer', () => {
    const customSerializer = {
      read: (value: string) => JSON.parse(value),
      write: (value: any) => JSON.stringify(value)
    };
    
    localStorageMock.getItem.mockReturnValue('{"key":"value"}');
    
    const { result } = renderHook(() => 
      useLocalStorage('testKey', { default: false }, { serializer: customSerializer })
    );
    
    expect(result.current).toEqual({ default: false });
  });

  it('handles errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'default value'));
    
    expect(result.current).toBe('default value');
  });

  it('handles syncAcrossTabs option', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'default value', { syncAcrossTabs: true })
    );
    
    act(() => {
      result.current[1]('new value');
    });
    
    // Should dispatch custom event
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { key: 'testKey', value: 'new value' }
      })
    );
  });
});

describe('useLocalStorageBoolean Hook', () => {
  it('returns boolean value', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    const { result } = renderHook(() => useLocalStorageBoolean('testKey', false));
    
    expect(result.current).toBe(true);
  });

  it('converts string to boolean', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    const { result } = renderHook(() => useLocalStorageBoolean('testKey', true));
    
    expect(result.current).toBe(false);
  });
});

describe('useLocalStorageNumber Hook', () => {
  it('returns number value', () => {
    localStorageMock.getItem.mockReturnValue('42');
    
    const { result } = renderHook(() => useLocalStorageNumber('testKey', 0));
    
    expect(result.current).toBe(42);
  });

  it('converts string to number', () => {
    localStorageMock.getItem.mockReturnValue('123');
    
    const { result } = renderHook(() => useLocalStorageNumber('testKey', 0));
    
    expect(result.current).toBe(123);
  });
});

describe('useLocalStorageString Hook', () => {
  it('returns string value', () => {
    localStorageMock.getItem.mockReturnValue('test string');
    
    const { result } = renderHook(() => useLocalStorageString('testKey', 'default'));
    
    expect(result.current).toBe('test string');
  });
});

describe('useLocalStorageObject Hook', () => {
  it('returns object value', () => {
    const testObject = { key: 'value', nested: { prop: 'data' } };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testObject));
    
    const { result } = renderHook(() => useLocalStorageObject('testKey', { default: {} }));
    
    expect(result.current).toEqual(testObject);
  });

  it('returns default object when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorageObject('testKey', { default: { key: 'default' } }));
    
    expect(result.current).toEqual({ key: 'default' });
  });
});

describe('useLocalStorageWithExpiration Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns value when not expired', () => {
    const now = Date.now();
    const expiredData = JSON.stringify({
      data: 'test value',
      expiration: now - 1000 // 1 second ago
    });
    localStorageMock.getItem.mockReturnValue(expiredData);
    
    const { result } = renderHook(() => 
      useLocalStorageWithExpiration('testKey', 'default value', 5000)
    );
    
    expect(result.current).toBe('default value');
  });

  it('returns default value when expired', () => {
    const now = Date.now();
    const expiredData = JSON.stringify({
      data: 'test value',
      expiration: now - 10000 // 10 seconds ago
    });
    localStorageMock.getItem.mockReturnValue(expiredData);
    
    const { result } = renderHook(() => 
      useLocalStorageWithExpiration('testKey', 'default value', 5000)
    );
    
    expect(result.current).toBe('default value');
  });

  it('returns value when not expired', () => {
    const now = Date.now();
    const validData = JSON.stringify({
      data: 'test value',
      expiration: now + 10000 // 10 seconds from now
    });
    localStorageMock.getItem.mockReturnValue(validData);
    
    const { result } = renderHook(() => 
      useLocalStorageWithExpiration('testKey', 'default value', 5000)
    );
    
    expect(result.current).toBe('test value');
  });
});