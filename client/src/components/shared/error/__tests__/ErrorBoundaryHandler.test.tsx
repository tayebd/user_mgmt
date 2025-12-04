/**
 * ErrorBoundaryHandler Component Tests
 * Tests for the robust error boundary component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundaryHandler } from '@/components/shared/error/ErrorBoundaryHandler';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundaryHandler Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundaryHandler>
        <div data-testid="child-component">Child Component</div>
      </ErrorBoundaryHandler>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('catches and displays function fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error message');
    };

    const fallbackFunction = (error: Error | null, errorInfo: any) => (
      <div data-testid="error-fallback">
        <h1>Error occurred</h1>
        <p>{error?.message}</p>
      </div>
    );

    render(
      <ErrorBoundaryHandler fallback={fallbackFunction}>
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('catches and displays ReactNode fallback', () => {
    const ThrowError = () => {
      throw new Error('ReactNode fallback test');
    };

    const fallbackElement = (
      <div data-testid="reactnode-fallback">
        <h2>Default Error UI</h2>
        <p>Something went wrong</p>
      </div>
    );

    render(
      <ErrorBoundaryHandler fallback={fallbackElement}>
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    expect(screen.getByTestId('reactnode-fallback')).toBeInTheDocument();
    expect(screen.getByText('Default Error UI')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Callback test error');
    };

    const onError = jest.fn();

    render(
      <ErrorBoundaryHandler onError={onError}>
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    expect(onError).toHaveBeenCalled();
    const [error] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Callback test error');
  });

  it('handles errors with component stack', () => {
    const ThrowError = () => {
      throw new Error('Stack test error');
    };

    const onError = jest.fn();

    render(
      <ErrorBoundaryHandler onError={onError}>
        <div>
          <ThrowError />
        </div>
      </ErrorBoundaryHandler>
    );

    const [error, errorInfo] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(errorInfo.componentStack).toBeDefined();
    expect(typeof errorInfo.componentStack).toBe('string');
  });

  it('works with different error types', () => {
    const ThrowStringError = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundaryHandler
        fallback={(error) => (
          <div data-testid="string-error-fallback">
            Error: {error?.message}
          </div>
        )}
      >
        <ThrowStringError />
      </ErrorBoundaryHandler>
    );

    expect(screen.getByTestId('string-error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error: String error')).toBeInTheDocument();
  });

  it('handles async errors in useEffect', () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        throw new Error('Async error');
      }, []);
      return <div>Async Component</div>;
    };

    render(
      <ErrorBoundaryHandler
        fallback={(error) => (
          <div data-testid="async-error-fallback">
            Async Error: {error?.message}
          </div>
        )}
      >
        <AsyncErrorComponent />
      </ErrorBoundaryHandler>
    );

    expect(screen.getByTestId('async-error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Async Error: Async error')).toBeInTheDocument();
  });

  it('provides correct error information to fallback function', () => {
    const ThrowError = () => {
      const error = new Error('Detailed error test');
      error.stack = 'Error stack trace';
      throw error;
    };

    const fallbackFunction = jest.fn().mockImplementation((error, errorInfo) => (
      <div data-testid="detailed-error">
        <p>Message: {error?.message}</p>
        <p>Stack: {error?.stack}</p>
        <p>Component Stack: {errorInfo?.componentStack}</p>
      </div>
    ));

    render(
      <ErrorBoundaryHandler fallback={fallbackFunction}>
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    expect(fallbackFunction).toHaveBeenCalled();
    const [error, errorInfo] = fallbackFunction.mock.calls[0];
    expect(error?.message).toBe('Detailed error test');
    expect(error?.stack).toBe('Error stack trace');
    expect(errorInfo?.componentStack).toBeDefined();
  });

  it('resets error boundary when children change', () => {
    const ThrowError = () => {
      throw new Error('Reset test error');
    };

    const SafeComponent = () => <div data-testid="safe-component">Safe Component</div>;

    const { rerender } = render(
      <ErrorBoundaryHandler
        fallback={(error) => (
          <div data-testid="error-fallback">
            Error: {error?.message}
          </div>
        )}
      >
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    // Should show error fallback
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

    // Rerender with safe component
    rerender(
      <ErrorBoundaryHandler
        fallback={(error) => (
          <div data-testid="error-fallback">
            Error: {error?.message}
          </div>
        )}
      >
        <SafeComponent />
      </ErrorBoundaryHandler>
    );

    // Should render safe component
    expect(screen.getByTestId('safe-component')).toBeInTheDocument();
    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
  });

  it('handles null fallback gracefully', () => {
    const ThrowError = () => {
      throw new Error('Null fallback test');
    };

    // This should not crash but just render nothing (fallback to children)
    expect(() => {
      render(
        <ErrorBoundaryHandler>
          <ThrowError />
        </ErrorBoundaryHandler>
      );
    }).not.toThrow();
  });

  it('provides proper error context', () => {
    const NestedThrowError = () => {
      throw new Error('Nested error');
    };

    const fallbackFunction = jest.fn().mockImplementation((error, errorInfo) => (
      <div data-testid="nested-error">
        Nested Error: {error?.message}
      </div>
    ));

    render(
      <ErrorBoundaryHandler fallback={fallbackFunction}>
        <div>
          <span>Parent</span>
          <NestedThrowError />
        </div>
      </ErrorBoundaryHandler>
    );

    expect(fallbackFunction).toHaveBeenCalled();
    const [error] = fallbackFunction.mock.calls[0];
    expect(error?.message).toBe('Nested error');
  });

  it('handles custom error classes', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const ThrowCustomError = () => {
      throw new CustomError('Custom error message');
    };

    const fallbackFunction = jest.fn().mockImplementation((error) => (
      <div data-testid="custom-error">
        Custom Error: {error?.name} - {error?.message}
      </div>
    ));

    render(
      <ErrorBoundaryHandler fallback={fallbackFunction}>
        <ThrowCustomError />
      </ErrorBoundaryHandler>
    );

    expect(fallbackFunction).toHaveBeenCalled();
    const [error] = fallbackFunction.mock.calls[0];
    expect(error).toBeInstanceOf(CustomError);
    expect(error?.name).toBe('CustomError');
    expect(error?.message).toBe('Custom error message');
  });

  it('preserves component identity in error callback', () => {
    const ThrowError = () => {
      throw new Error('Identity test');
    };

    const onError = jest.fn();

    render(
      <ErrorBoundaryHandler onError={onError}>
        <ThrowError />
      </ErrorBoundaryHandler>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, errorInfo] = onError.mock.calls[0];
    expect(errorInfo).toBeDefined();
    expect(typeof errorInfo.componentStack).toBe('string');
  });
});