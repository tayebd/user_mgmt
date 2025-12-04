/**
 * ErrorHandler Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorHandler, ErrorBoundary, ErrorToast, ErrorProvider, useError } from '../ErrorHandler';

const mockError = {
  id: 'test-error-1',
  type: 'network' as const,
  title: 'Network Error',
  message: 'Failed to connect to server',
  details: 'HTTP 500: Internal Server Error',
  timestamp: new Date(),
  retryable: true,
  severity: 'high' as const,
  actions: [
    {
      label: 'Retry',
      onClick: jest.fn()
    }
  ]
};

describe('ErrorHandler Component', () => {
  const mockOnRetry = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error with all properties', () => {
    render(
      <ErrorHandler
        error={mockError}
        onRetry={mockOnRetry}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(
      <ErrorHandler
        error={mockError}
        compact={true}
      />
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(
      <ErrorHandler
        error={mockError}
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(
      <ErrorHandler
        error={mockError}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <ErrorHandler
        error={mockError}
        className="custom-class"
      />
    );

    const container = screen.getByText('Network Error').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('shows details when expanded', () => {
    render(
      <ErrorHandler
        error={mockError}
        showDetails={true}
      />
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
    expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument();
  });

  it('hides details when collapsed', () => {
    render(
      <ErrorHandler
        error={mockError}
        showDetails={false}
      />
    );

    expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
  });

  it('auto-dismisses after delay', () => {
    jest.useFakeTimers();

    render(
      <ErrorHandler
        error={mockError}
        autoDismiss={true}
        autoDismissDelay={1000}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    expect(screen.queryByText('Network Error')).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});

describe('ErrorBoundary Component', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Test Component</div>;
  };

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onError when error occurs', () => {
    const mockOnError = jest.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalled();
  });

  it('provides reset functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Reset error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});

describe('ErrorToast Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toast with error', () => {
    render(
      <ErrorToast
        error={mockError}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
  });

  it('calls onDismiss when clicked', () => {
    render(
      <ErrorToast
        error={mockError}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByText('×');
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after delay', () => {
    jest.useFakeTimers();

    render(
      <ErrorToast
        error={mockError}
        onDismiss={mockOnDismiss}
        autoDismiss={true}
        duration={1000}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    expect(screen.queryByText('Network Error')).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});

describe('ErrorProvider and useError Hook', () => {
  const TestComponent = () => {
    const { errors, addError, removeError, clearErrors } = useError();

    return (
      <div>
        <button onClick={() => addError(mockError)}>
          Add Error
        </button>
        <button onClick={() => removeError(mockError.id)}>
          Remove Error
        </button>
        <button onClick={clearErrors}>
          Clear Errors
        </button>
        <div data-testid="error-count">
          {errors.length} errors
        </div>
      </div>
    );
  };

  it('provides error context', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    expect(screen.getByText('Add Error')).toBeInTheDocument();
    expect(screen.getByText('Remove Error')).toBeInTheDocument();
    expect(screen.getByText('Clear Errors')).toBeInTheDocument();
    expect(screen.getByTestId('error-count')).toHaveTextContent('0 errors');
  });

  it('adds error to context', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    const addButton = screen.getByText('Add Error');
    fireEvent.click(addButton);

    expect(screen.getByTestId('error-count')).toHaveTextContent('1 errors');
  });

  it('removes error from context', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    // First add an error
    const addButton = screen.getByText('Add Error');
    fireEvent.click(addButton);

    // Then remove it
    const removeButton = screen.getByText('Remove Error');
    fireEvent.click(removeButton);

    expect(screen.getByTestId('error-count')).toHaveTextContent('0 errors');
  });

  it('clears all errors', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    // First add an error
    const addButton = screen.getByText('Add Error');
    fireEvent.click(addButton);

    // Then clear all
    const clearButton = screen.getByText('Clear Errors');
    fireEvent.click(clearButton);

    expect(screen.getByTestId('error-count')).toHaveTextContent('0 errors');
  });
});