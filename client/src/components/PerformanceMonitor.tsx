'use client';

import { useEffect, useState } from 'react';
import { performanceMonitor, PerformanceBudget } from '@/lib/performance-monitoring';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  bundleSize?: number;
  componentLoadTime?: number;
  apiResponseTime?: number;
}

interface PerformanceStatus {
  passed: boolean;
  violations: string[];
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [status, setStatus] = useState<PerformanceStatus>({ passed: true, violations: [] });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.initialize();

    // Update metrics periodically
    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);

      const budgetCheck = PerformanceBudget.checkBudget(currentMetrics);
      setStatus(budgetCheck);
    }, 2000);

    return () => {
      clearInterval(interval);
      performanceMonitor.disconnect();
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 z-50"
      >
        Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Core Web Vitals */}
        <div className="grid grid-cols-2 gap-2">
          <div>LCP:</div>
          <div className={metrics.lcp && metrics.lcp > 2.5 ? 'text-red-600' : 'text-green-600'}>
            {metrics.lcp ? `${metrics.lcp.toFixed(2)}s` : '—'}
          </div>

          <div>FID:</div>
          <div className={metrics.fid && metrics.fid > 100 ? 'text-red-600' : 'text-green-600'}>
            {metrics.fid ? `${metrics.fid}ms` : '—'}
          </div>

          <div>CLS:</div>
          <div className={metrics.cls && metrics.cls > 0.1 ? 'text-red-600' : 'text-green-600'}>
            {metrics.cls ? metrics.cls.toFixed(3) : '—'}
          </div>
        </div>

        {/* App Metrics */}
        <div className="border-t pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>Bundle Size:</div>
            <div className={metrics.bundleSize && metrics.bundleSize > 500 ? 'text-yellow-600' : 'text-green-600'}>
              {metrics.bundleSize ? `${metrics.bundleSize}KB` : '—'}
            </div>

            <div>Component Load:</div>
            <div className={metrics.componentLoadTime && metrics.componentLoadTime > 1000 ? 'text-yellow-600' : 'text-green-600'}>
              {metrics.componentLoadTime ? `${metrics.componentLoadTime}ms` : '—'}
            </div>

            <div>API Response:</div>
            <div className={metrics.apiResponseTime && metrics.apiResponseTime > 2000 ? 'text-yellow-600' : 'text-green-600'}>
              {metrics.apiResponseTime ? `${metrics.apiResponseTime}ms` : '—'}
            </div>
          </div>
        </div>

        {/* Status */}
        {status.violations.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="text-red-600 font-medium">Performance Issues:</div>
            <ul className="list-disc list-inside text-red-600 text-xs">
              {status.violations.map((violation, index) => (
                <li key={index}>{violation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}