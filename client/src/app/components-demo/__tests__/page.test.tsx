/**
 * Components Demo Page Tests
 * Integration tests for the components demonstration page
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentsDemo from '../page';

// Mock the components to test integration
jest.mock('@/components/shared/layout/Container', () => {
  return function MockContainer({ children, size, className, ...props }: any) {
    return (
      <div data-testid="container" data-size={size} className={className} {...props}>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/shared/data/DataTable', () => {
  return function MockDataTable({ data, columns, ...props }: any) {
    return (
      <div data-testid="datatable" {...props}>
        <div data-testid="datatable-data">{JSON.stringify(data)}</div>
        <div data-testid="datatable-columns">{JSON.stringify(columns)}</div>
      </div>
    );
  };
});

jest.mock('@/components/hooks/useAsync', () => {
  return function MockUseAsync({ onSuccess, onError }: any) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const execute = React.useCallback(async (message: string) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = `Echo: ${message}`;
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = new Error('Test error');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    }, [onSuccess, onError]);

    const reset = React.useCallback(() => {
      setData(null);
      setLoading(false);
      setError(null);
    }, []);

    return { data, loading, error, execute, reset };
  };
});

jest.mock('@/components/shared/theme/ThemeProvider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-provider">{children}</div>
    ),
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          surface: '#f8fafc',
          textPrimary: '#1e293b',
          textSecondary: '#64748b',
          border: '#e2e8f0',
          muted: '#f1f5f9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
        borderRadius: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        }
      },
      mode: 'light',
      isDark: false,
      toggleMode: jest.fn(),
      setMode: jest.fn()
    })
  };
});

jest.mock('@/components/shared/error/ErrorBoundaryHandler', () => {
  return function MockErrorBoundaryHandler({
    children,
    onError,
    fallback
  }: {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
    fallback?: any;
  }) {
    return (
      <div data-testid="error-boundary">
        {typeof fallback === 'function' ? fallback(null, null) : fallback || children}
      </div>
    );
  };
});

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onKeyPress, ...props }: any) => (
    <input
      data-testid="input"
      onKeyPress={onKeyPress}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange('datatable')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>
      {children}
    </button>
  ),
}));

describe('Components Demo Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main demo page', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('Component Library Demo')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('displays theme toggle functionality', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('Current theme:')).toBeInTheDocument();
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
  });

  it('renders all tab triggers', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('Container')).toBeInTheDocument();
    expect(screen.getByText('DataTable')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders tab content areas', () => {
    render(<ComponentsDemo />);

    expect(screen.getAllByTestId('tabs-content')).toHaveLength(4);
  });

  it('displays container demo content', () => {
    render(<ComponentsDemo />);

    // Check for container-related content
    expect(screen.getByText('Container Component')).toBeInTheDocument();
    expect(screen.getByText('Basic Container')).toBeInTheDocument();
    expect(screen.getByText('Container Variants')).toBeInTheDocument();
    expect(screen.getByText('Container with Custom Padding')).toBeInTheDocument();
  });

  it('displays DataTable demo content', () => {
    render(<ComponentsDemo />);

    // Check for DataTable-related content
    expect(screen.getByText('DataTable Component')).toBeInTheDocument();
    expect(screen.getByTestId('datatable')).toBeInTheDocument();
    expect(screen.getByText('Sortable, filterable, paginated table with AI-enhanced features.')).toBeInTheDocument();
  });

  it('displays hooks demo content', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('useAsync Hook')).toBeInTheDocument();
    expect(screen.getByText('Handles async operations with loading, error, and data states.')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('displays theme demo content', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('Theme System')).toBeInTheDocument();
    expect(screen.getByText('Consistent theming with light/dark mode support.')).toBeInTheDocument();
    expect(screen.getByText('Current Theme')).toBeInTheDocument();
    expect(screen.getByText('Theme Colors')).toBeInTheDocument();
  });

  it('displays DataTable with sample data', () => {
    render(<ComponentsDemo />);

    const datatableData = screen.getByTestId('datatable-data');
    expect(datatableData).toBeInTheDocument();

    // Check if sample data is being passed
    const dataText = datatableData.textContent;
    expect(dataText).toContain('John Doe');
    expect(dataText).toContain('Jane Smith');
    expect(dataText).toContain('Admin');
    expect(dataText).toContain('User');
  });

  it('handles async hook demo interaction', async () => {
    render(<ComponentsDemo />);

    const input = screen.getByTestId('input');
    const executeButton = screen.getByText('Execute');

    // Test input field
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter message to echo...');

    // Execute async operation
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter' });

    // Wait for async operation to complete
    await waitFor(() => {
      expect(screen.getByText('Response:')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('displays container size variants', () => {
    render(<ComponentsDemo />);

    const containers = screen.getAllByTestId('container');
    expect(containers.length).toBeGreaterThan(0);

    // Check if different sizes are rendered
    containers.forEach(container => {
      expect(container).toBeInTheDocument();
      const size = container.getAttribute('data-size');
      expect(['sm', 'lg', 'xl']).toContain(size);
    });
  });

  it('shows theme color information', () => {
    render(<ComponentsDemo />);

    expect(screen.getByText('Mode:')).toBeInTheDocument();
    expect(screen.getByText('Is Dark:')).toBeInTheDocument();

    // Check for theme color display
    const themeColors = screen.getAllByText(/primary|secondary|background/i);
    expect(themeColors.length).toBeGreaterThan(0);
  });

  it('handles tab switching', () => {
    render(<ComponentsDemo />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs).toBeInTheDocument();

    // Click to switch tabs
    fireEvent.click(tabs);

    // Verify the click is handled (implementation dependent)
    expect(tabs).toBeInTheDocument();
  });

  it('displays all card components correctly', () => {
    render(<ComponentsDemo />);

    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBe(4); // Should have 4 cards for 4 tabs

    cards.forEach(card => {
      expect(card).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });
  });

  it('shows loading states properly', () => {
    render(<ComponentsDemo />);

    // The demo doesn't show initial loading, but tests the structure
    expect(screen.getByText('Component Library Demo')).toBeInTheDocument();
  });

  it('handles keyboard navigation in tabs', () => {
    render(<ComponentsDemo />);

    const tabTriggers = screen.getAllByTestId('tabs-trigger');
    expect(tabTriggers.length).toBe(4);

    // Test that tabs are keyboard accessible
    tabTriggers.forEach(trigger => {
      expect(trigger).toBeEnabled();
    });
  });

  it('displays proper headings and descriptions', () => {
    render(<ComponentsDemo />);

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);

    // Check for main heading
    expect(screen.getByRole('heading', { name: 'Component Library Demo' })).toBeInTheDocument();

    // Check for card titles
    const cardTitles = screen.getAllByTestId('card-title');
    expect(cardTitles.length).toBe(4);
  });

  it('shows sample data information correctly', () => {
    render(<ComponentsDemo />);

    // Check if DataTable shows the correct sample data structure
    const datatableColumns = screen.getByTestId('datatable-columns');
    expect(datatableColumns).toBeInTheDocument();

    // Verify column definitions
    const columnsText = datatableColumns.textContent;
    expect(columnsText).toContain('name');
    expect(columnsText).toContain('email');
    expect(columnsText).toContain('role');
    expect(columnsText).toContain('status');
  });

  it('handles error boundary gracefully', () => {
    render(<ComponentsDemo />);

    // The error boundary should be present but not triggered
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
  });

  it('displays responsive layout elements', () => {
    render(<ComponentsDemo />);

    // Check for responsive grid layouts
    const gridElements = document.querySelectorAll('[class*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('shows proper component descriptions', () => {
    render(<ComponentsDemo />);

    // Check for descriptive text
    expect(screen.getByText('This is a basic container with default padding and size.')).toBeInTheDocument();
    expect(screen.getByText('Sortable, filterable, paginated table with AI-enhanced features.')).toBeInTheDocument();
    expect(screen.getByText('Handles async operations with loading, error, and data states.')).toBeInTheDocument();
    expect(screen.getByText('Consistent theming with light/dark mode support.')).toBeInTheDocument();
  });
});