/**
 * Error Boundary Handler
 * Catches React errors and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryHandlerProps {
  children: ReactNode;
  fallback?: ((error: Error | null, errorInfo: ErrorInfo | null) => ReactNode) | ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundaryHandler extends Component<
  ErrorBoundaryHandlerProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryHandlerProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: {
        componentStack: error.stack || '',
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.props.fallback) {
      // Check if fallback is a function
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }
      // Otherwise, treat it as a ReactNode
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundaryHandler;