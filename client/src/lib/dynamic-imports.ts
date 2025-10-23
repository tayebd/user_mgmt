/**
 * Dynamic Import Utilities
 * Utilities for optimizing bundle size through dynamic imports and code splitting
 */

import React from 'react';

// Type-safe dynamic import helper
export const dynamicImport = <T>(
  importFn: () => Promise<T>,
  fallback?: T,
  timeout: number = 5000
): Promise<T> => {
  return Promise.race([
    importFn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Dynamic import timeout')), timeout)
    )
  ]).catch((error) => {
    if (fallback !== undefined) {
      return Promise.resolve(fallback);
    }
    throw error;
  });
};

// Preload multiple modules
export const preloadModules = (importFns: Array<() => Promise<any>>) => {
  return Promise.allSettled(importFns.map(fn => fn().catch(() => null)));
};

// Create a lazy component with error boundary
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
  displayName?: string
) => {
  const LazyComponent = React.lazy(() => importFn());

  const WrappedComponent = (props: React.ComponentProps<T>) => {
    return React.createElement(React.Suspense, {
      fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...')
    }, React.createElement(LazyComponent, props));
  };

  if (displayName) {
    WrappedComponent.displayName = displayName;
  }

  return WrappedComponent as T;
};

// Intersection Observer based lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, callback, options]);
};

// Route-based preloading
export const useRoutePreload = (routes: string[]) => {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      routes.forEach(route => {
        // Preload route components
        import(`../app${route}`).catch(() => {
          // Fail silently - route may not exist or may have errors
        });
      });
    }, 3000); // Preload after 3 seconds

    return () => clearTimeout(timeout);
  }, [routes]);
};

// User interaction based preloading
export const useInteractionPreload = (importFn: () => Promise<any>, trigger: 'hover' | 'focus' | 'click' = 'hover') => {
  const [hasInteracted, setHasInteracted] = React.useState(false);

  const handleInteraction = React.useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      importFn().catch(() => {
        // Fail silently
      });
    }
  }, [hasInteracted, importFn]);

  const handlers = {
    hover: { onMouseEnter: handleInteraction },
    focus: { onFocus: handleInteraction },
    click: { onClick: handleInteraction }
  };

  return {
    hasInteracted,
    handlers: handlers[trigger] || {}
  };
};

// Cache for dynamic imports
const importCache = new Map<string, Promise<any>>();

export const cachedDynamicImport = <T>(
  key: string,
  importFn: () => Promise<T>
): Promise<T> => {
  if (importCache.has(key)) {
    return importCache.get(key) as Promise<T>;
  }

  const importPromise = importFn();
  importCache.set(key, importPromise);
  return importPromise;
};

// Bundle size analysis utilities
export const bundleAnalyzer = {
  // Estimate module size (rough approximation)
  estimateModuleSize: (modulePath: string): number => {
    // This is a very rough estimation based on common patterns
    const baseSize = 1024; // 1KB base
    const sizeFactors = {
      'charts': 50 * 1024, // Charts are typically large
      'math': 100 * 1024, // Math rendering libraries are large
      'dnd': 30 * 1024, // Drag and drop libraries
      'editor': 80 * 1024, // Code editors
      'pdf': 200 * 1024, // PDF libraries
      'excel': 150 * 1024, // Excel libraries
    };

    for (const [pattern, size] of Object.entries(sizeFactors)) {
      if (modulePath.toLowerCase().includes(pattern)) {
        return baseSize + size;
      }
    }

    return baseSize;
  },

  // Suggest dynamic imports for heavy modules
  suggestDynamicImports: (modules: string[]): string[] => {
    const heavyPatterns = ['charts', 'math', 'dnd', 'editor', 'pdf', 'excel'];

    return modules.filter(module =>
      heavyPatterns.some(pattern => module.toLowerCase().includes(pattern))
    );
  }
};