/**
 * ErrorHandler Component
 * Centralized error handling with different error types and recovery options
 * Provides consistent error UI and user feedback
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/base-card';
import { cn } from '@/lib/utils';

export interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline';
  icon?: React.ReactNode;
}

export interface ErrorInfo {
  id: string;
  type: 'network' | 'validation' | 'permission' | 'system' | 'business' | 'timeout' | 'unknown';
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
  retryable?: boolean;
  actions?: ErrorAction[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorHandlerProps {
  error: ErrorInfo | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
  compact?: boolean;
  autoDismiss?: boolean;
  autoDismissDelay?: number; // ms
}

const errorTypeConfig = {
  network: {
    icon: '🌐',
    color: 'bg-red-100 text-red-800 border-red-200',
    title: 'Network Error'
  },
  validation: {
    icon: '⚠️',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    title: 'Validation Error'
  },
  permission: {
    icon: '🔒',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    title: 'Permission Error'
  },
  system: {
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    title: 'System Error'
  },
  business: {
    icon: '💼',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    title: 'Business Logic Error'
  },
  timeout: {
    icon: '⏰',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    title: 'Timeout Error'
  },
  unknown: {
    icon: '❓',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    title: 'Unknown Error'
  }
};

const severityConfig = {
  low: { color: 'bg-green-500', label: 'Low' },
  medium: { color: 'bg-yellow-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
  critical: { color: 'bg-red-500', label: 'Critical' }
};

export function ErrorHandler({
  error,
  onRetry,
  onDismiss,
  showDetails = true,
  className,
  compact = false,
  autoDismiss = false,
  autoDismissDelay = 5000
}: ErrorHandlerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const config = error ? errorTypeConfig[error.type] : errorTypeConfig.unknown;
  const severityDetails = error?.severity ? severityConfig[error.severity] : null;

  // Auto-dismiss functionality
  useEffect(() => {
    if (!autoDismiss || !error || dismissed) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissDelay, error, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
    handleDismiss();
  };

  if (!error || dismissed) return null;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 rounded-lg border',
        config.color,
        className
      )}>
        <span className="text-lg">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{error.title}</p>
          <p className="text-xs opacity-75 truncate">{error.message}</p>
        </div>
        <div className="flex gap-1">
          {error.retryable && onRetry && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            ×
          </Button>
        </div>
      </div>
    );
  }

  return (
    <BaseCard className={cn('border-l-4', className)}>
      <div className="flex items-start gap-4">
        {/* Error Icon and Type */}
        <div className="flex-shrink-0">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
            config.color
          )}>
            {config.icon}
          </div>
          {severityDetails && (
            <Badge
              variant="outline"
              className={cn(
                'mt-1 text-xs',
                severityDetails.color
              )}
            >
              {severityDetails.label}
            </Badge>
          )}
        </div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{error.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{error.timestamp.toLocaleTimeString()}</span>
              {error.retryable && (
                <Badge variant="outline">Retryable</Badge>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{error.message}</p>

          {/* Error Details */}
          {showDetails && (error.details || error.context) && (
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:text-blue-700"
              >
                {expanded ? 'Hide' : 'Show'} Details
              </Button>
              
              {expanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  {error.details && (
                    <div className="mb-2">
                      <h4 className="font-medium mb-1">Technical Details</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {error.details}
                      </pre>
                    </div>
                  )}
                  
                  {error.context && (
                    <div>
                      <h4 className="font-medium mb-1">Context</h4>
                      <div className="space-y-1">
                        {Object.entries(error.context).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span>
                            <span className="ml-2 text-gray-600">
                              {typeof value === 'object' 
                                ? JSON.stringify(value, null, 2)
                                : String(value)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Actions */}
          {error.actions && error.actions.length > 0 && (
            <div className="flex gap-2">
              {error.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss/Retry Actions */}
        <div className="flex gap-2">
          {error.retryable && onRetry && (
            <Button onClick={handleRetry}>
              Retry
            </Button>
          )}
          <Button variant="outline" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </BaseCard>
  );
}

// Error Boundary Component
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorInfo: ErrorInfo = {
        id: `error-${Date.now()}`,
        type: 'system',
        title: 'Application Error',
        message: this.state.error?.message || 'An unexpected error occurred',
        details: this.state.error?.stack,
        timestamp: new Date(),
        retryable: this.props.enableRetry || false,
        severity: 'high'
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} errorInfo={this.state.errorInfo!} reset={this.reset} />;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <ErrorHandler
            error={errorInfo}
            onRetry={this.props.enableRetry ? this.reset : undefined}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Toast Component
export interface ErrorToastProps {
  error: ErrorInfo;
  onDismiss: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export function ErrorToast({
  error,
  onDismiss,
  autoDismiss = true,
  duration = 3000
}: ErrorToastProps) {
  const config = errorTypeConfig[error.type];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Allow exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [autoDismiss, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border transform transition-all duration-300',
      config.color,
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{error.title}</p>
          <p className="text-xs opacity-75 mt-1">{error.message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 ml-2"
        >
          ×
        </Button>
      </div>
    </div>
  );
}

// Error Provider Context
export interface ErrorContextType {
  errors: ErrorInfo[];
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = React.createContext<ErrorContextType | null>(null);

export interface ErrorProviderProps {
  children: React.ReactNode;
  maxErrors?: number;
}

export function ErrorProvider({ children, maxErrors = 10 }: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = useCallback((error: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
    const newError: ErrorInfo = {
      ...error,
      id: `error-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    setErrors(prev => {
      const updated = [...prev, newError];
      return updated.slice(-maxErrors); // Keep only last N errors
    });
  }, [maxErrors]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextType {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

export default ErrorHandler;