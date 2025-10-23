/**
 * Performance Monitoring Utilities
 *
 * Provides tools for tracking Core Web Vitals and application performance metrics
 * to help identify optimization opportunities and ensure good user experience.
 */

// Type definitions for performance entries
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Core Web Vitals metrics
export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint (seconds)
  fid?: number; // First Input Delay (milliseconds)
  cls?: number; // Cumulative Layout Shift (score)
  inp?: number; // Interaction to Next Paint (milliseconds)
  ttfb?: number; // Time to First Byte (milliseconds)
}

// Application performance metrics
export interface AppPerformanceMetrics {
  bundleSize?: number; // Estimated bundle size in KB
  componentLoadTime?: number; // Component load time in ms
  apiResponseTime?: number; // API response time in ms
  renderTime?: number; // Render time in ms
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: CoreWebVitals & AppPerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupCoreWebVitals();
      this.setupBundleSizeTracking();
    }
  }

  /**
   * Set up Core Web Vitals monitoring
   */
  private setupCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime / 1000; // Convert to seconds
      this.logMetric('LCP', this.metrics.lcp);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as PerformanceEventTiming[];
      const firstEntry = entries[0];
      if (firstEntry && 'processingStart' in firstEntry) {
        this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
        this.logMetric('FID', this.metrics.fid);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      const entries = entryList.getEntries() as LayoutShift[];
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
      this.logMetric('CLS', this.metrics.cls);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    this.observers.push(lcpObserver, fidObserver, clsObserver);
  }

  /**
   * Set up bundle size tracking
   */
  private setupBundleSizeTracking(): void {
    // Estimate bundle size based on performance entries
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalSize = 0;

      entries.forEach(entry => {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          totalSize += (entry as PerformanceResourceTiming).transferSize || 0;
        }
      });

      this.metrics.bundleSize = Math.round(totalSize / 1024); // Convert to KB
      this.logMetric('Bundle Size', this.metrics.bundleSize + ' KB');
    });

    observer.observe({ type: 'resource', buffered: true });
    this.observers.push(observer);
  }

  /**
   * Track component load time
   */
  trackComponentLoad(componentName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.metrics.componentLoadTime = loadTime;
    this.logMetric(`Component Load (${componentName})`, loadTime + 'ms');
  }

  /**
   * Track API response time
   */
  trackApiResponse(endpoint: string, startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTime = responseTime;
    this.logMetric(`API Response (${endpoint})`, responseTime + 'ms');
  }

  /**
   * Track render time
   */
  trackRenderTime(componentName: string, startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.renderTime = renderTime;
    this.logMetric(`Render Time (${componentName})`, renderTime + 'ms');
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): CoreWebVitals & AppPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Log performance metric
   */
  private logMetric(name: string, value: number | string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}`);
    }
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startTimer = (componentName: string) => {
    const startTime = performance.now();
    return {
      trackLoad: () => performanceMonitor.trackComponentLoad(componentName, startTime),
      trackRender: () => performanceMonitor.trackRenderTime(componentName, startTime)
    };
  };

  return { startTimer };
};

// Performance budget checker
export class PerformanceBudget {
  private static readonly BUDGETS = {
    lcp: 2.5, // seconds
    fid: 100, // milliseconds
    cls: 0.1, // score
    inp: 200, // milliseconds
    bundleSize: 500, // KB
    componentLoad: 1000, // milliseconds
    apiResponse: 2000, // milliseconds
  };

  /**
   * Check if metrics are within budget
   */
  static checkBudget(metrics: CoreWebVitals & AppPerformanceMetrics): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (metrics.lcp && metrics.lcp > this.BUDGETS.lcp) {
      violations.push(`LCP (${metrics.lcp}s) exceeds budget (${this.BUDGETS.lcp}s)`);
    }

    if (metrics.fid && metrics.fid > this.BUDGETS.fid) {
      violations.push(`FID (${metrics.fid}ms) exceeds budget (${this.BUDGETS.fid}ms)`);
    }

    if (metrics.cls && metrics.cls > this.BUDGETS.cls) {
      violations.push(`CLS (${metrics.cls}) exceeds budget (${this.BUDGETS.cls})`);
    }

    if (metrics.bundleSize && metrics.bundleSize > this.BUDGETS.bundleSize) {
      violations.push(`Bundle size (${metrics.bundleSize}KB) exceeds budget (${this.BUDGETS.bundleSize}KB)`);
    }

    if (metrics.componentLoadTime && metrics.componentLoadTime > this.BUDGETS.componentLoad) {
      violations.push(`Component load (${metrics.componentLoadTime}ms) exceeds budget (${this.BUDGETS.componentLoad}ms)`);
    }

    if (metrics.apiResponseTime && metrics.apiResponseTime > this.BUDGETS.apiResponse) {
      violations.push(`API response (${metrics.apiResponseTime}ms) exceeds budget (${this.BUDGETS.apiResponse}ms)`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  /**
   * Get performance budgets
   */
  static getBudgets() {
    return { ...this.BUDGETS };
  }
}