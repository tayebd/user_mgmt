# Testing Guide for New Components

## Overview

This guide explains how to test the new reusable components that have been added to the User Management application.

## Prerequisites

1. **Development Server Running**: Ensure the Next.js development server is running
   ```bash
   cd client
   pnpm dev
   ```

2. **Dependencies Installed**: Verify all required dependencies are installed
   ```bash
   cd client
   pnpm install
   ```

## Testing Methods

### 1. Component Demo Page

The easiest way to test all new components is through the demo page:

1. **Navigate to Demo Page**:
   - Open your browser
   - Go to `http://localhost:3000/components-demo`
   - This page showcases all implemented components

2. **Test Each Component Tab**:
   - **Container Tab**: Test different sizes, padding, and centering options
   - **DataTable Tab**: Test sorting, filtering, pagination, and AI features
   - **Hooks Tab**: Test async operations and error handling
   - **Theme Tab**: Test theme switching and CSS variables

3. **Interactive Testing**:
   - Try the theme toggle button to switch between light/dark modes
   - Use the search bar in the DataTable to filter results
   - Click column headers to sort data
   - Test pagination controls
   - Try the async hook demo to see loading states

### 2. Manual Component Testing

You can also import and test components individually:

#### Container Component Testing
```tsx
// Create a test file: client/src/components/__tests__/Container.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from '../shared/layout/Container';

describe('Container Component', () => {
  it('renders with default props', () => {
    render(<Container><p>Test content</p></Container>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom size class', () => {
    render(<Container size="lg"><p>Large container</p></Container>);
    const container = screen.getByText('Large container').parentElement;
    expect(container).toHaveClass('max-w-6xl');
  });

  it('applies custom padding class', () => {
    render(<Container padding="xl"><p>Extra padding</p></Container>);
    const container = screen.getByText('Extra padding').parentElement;
    expect(container).toHaveClass('px-12');
  });
});
```

#### DataTable Component Testing
```tsx
// Create a test file: client/src/components/__tests__/DataTable.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Column } from '../shared/data/DataTable';

const mockData = [
  { id: 1, name: 'Test User', email: 'test@example.com', role: 'User' },
  { id: 2, name: 'Another User', email: 'another@example.com', role: 'Admin' },
];

const mockColumns: Column<typeof mockData[0]>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Role', sortable: true },
];

describe('DataTable Component', () => {
  it('renders data correctly', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('handles sorting', () => {
    const onSortChange = jest.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onSortChange={onSortChange}
      />
    );
    
    // Click on name column to sort
    fireEvent.click(screen.getByText('Name'));
    
    expect(onSortChange).toHaveBeenCalledWith('name');
  });

  it('shows loading state', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        loading={true}
      />
    );
    
    // Check for loading skeleton rows
    const skeletonRows = screen.getAllByRole('row');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });
});
```

#### ThemeProvider Testing
```tsx
// Create a test file: client/src/components/__tests__/ThemeProvider.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../shared/theme/ThemeProvider';

const TestComponent = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <div data-testid="theme-test">
      <p data-testid="theme-mode">Mode: {isDark ? 'Dark' : 'Light'}</p>
      <p data-testid="primary-color">Primary: {theme.colors.primary}</p>
    </div>
  );
};

describe('ThemeProvider', () => {
  it('provides theme context', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('Mode: Light');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('Primary: #3b82f6');
  });

  it('toggles theme mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider>
          {children}
        </ThemeProvider>
      ),
    });
    
    act(() => {
      result.current.toggleMode();
    });
    
    expect(result.current.isDark).toBe(true);
  });
});
```

#### useAsync Hook Testing
```tsx
// Create a test file: client/src/components/__tests__/useAsync.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../hooks/useAsync';

// Mock function for testing
const mockAsyncFunction = jest.fn()
  .mockImplementationOnce(() => Promise.resolve('Success'))
  .mockImplementationOnce(() => Promise.reject(new Error('Test error')));

describe('useAsync Hook', () => {
  it('handles successful async operation', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncFunction, {
      onSuccess,
    }));
    
    act(() => {
      result.current.execute();
    });
    
    await waitFor(() => {
      expect(result.current.data).toBe('Success');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(onSuccess).toHaveBeenCalledWith('Success');
    });
  });

  it('handles async operation error', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncFunction, {
      onError,
    }));
    
    act(() => {
      result.current.execute();
    });
    
    await waitFor(() => {
      expect(result.current.data).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Test error');
      expect(onError).toHaveBeenCalled();
    });
  });

  it('supports retry functionality', async () => {
    const { result } = renderHook(() => useAsync(mockAsyncFunction, {
      retryCount: 2,
    }));
    
    // First call fails, second succeeds
    act(() => {
      result.current.execute();
    });
    
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.retry).toBeDefined();
    });
  });
});
```

### 3. Running Tests

Execute the test commands:

```bash
# Run all component tests
cd client
pnpm test

# Run specific test file
pnpm test Container.test.tsx

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
```

### 4. Integration Testing

Test components in the context of the actual application:

#### 1. Update Existing Pages
```tsx
// Example: Update an existing page to use new Container
import { Container } from '@/components/shared/layout/Container';

export default function ExistingPage() {
  return (
    <Container size="lg" padding="xl">
      <h1>Page Title</h1>
      <p>Page content using new Container component</p>
    </Container>
  );
}
```

#### 2. Replace Existing Components
```tsx
// Example: Replace existing table with new DataTable
import { DataTable, Column } from '@/components/shared/data/DataTable';

const columns: Column<User>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Role', sortable: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  
  return (
    <DataTable
      data={users}
      columns={columns}
      pagination={{
        current: 1,
        pageSize: 10,
        total: users.length,
        onChange: (page, pageSize) => console.log('Page changed:', page, pageSize),
      }}
    />
  );
}
```

#### 3. Add Theme Support
```tsx
// Example: Add theme support to existing layout
import { ThemeProvider, useTheme } from '@/components/shared/theme/ThemeProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}

// In child component
import { useTheme } from '@/components/shared/theme/ThemeProvider';

export default function ThemedComponent() {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'}>
      <h1>Themed Content</h1>
    </div>
  );
}
```

## Visual Testing Checklist

### Container Component
- [ ] Renders with default props
- [ ] Applies size variants correctly
- [ ] Applies padding variants correctly
- [ ] Centers content when centered prop is true
- [ ] Responsive behavior works on different screen sizes

### DataTable Component
- [ ] Renders data correctly
- [ ] Sorting works on all sortable columns
- [ ] Filtering works with text and select filters
- [ ] Pagination controls work correctly
- [ ] Row selection works properly
- [ ] Loading state shows skeleton rows
- [ ] Empty state shows appropriate message
- [ ] AI insights display correctly
- [ ] Search functionality works

### ThemeProvider Component
- [ ] Provides theme context to children
- [ ] Detects system theme preference
- [ ] Toggles between light/dark modes
- [ ] Updates CSS variables correctly
- [ ] Persists theme choice

### useAsync Hook
- [ ] Handles successful async operations
- [ ] Handles async operation errors
- [ ] Shows loading state during operation
- [ ] Implements retry logic correctly
- [ ] Cleans up on unmount
- [ ] Calls success/error callbacks

## Performance Testing

### 1. Bundle Size Analysis
```bash
# Analyze bundle size
cd client
pnpm build
pnpm analyze
```

### 2. Component Rendering Performance
```bash
# Use React DevTools Profiler
# 1. Open React DevTools
# 2. Go to Components tab
# 3. Enable Profiler
# 4. Interact with components
# 5. Analyze render times
```

### 3. Memory Usage
```bash
# Monitor memory usage in browser DevTools
# Check for memory leaks when unmounting components
# Verify proper cleanup in useEffect
```

## Accessibility Testing

### 1. Keyboard Navigation
- [ ] Tab navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Escape key works for modals and dropdowns
- [ ] Arrow keys work for data tables

### 2. Screen Reader Support
- [ ] All interactive elements have ARIA labels
- [ ] Form fields have proper descriptions
- [ ] Page announcements for dynamic content
- [ ] Semantic HTML elements used correctly

### 3. Color Contrast
- [ ] Text meets WCAG AA contrast ratios (4.5:1)
- [ ] Interactive elements have sufficient contrast
- [ ] Focus indicators are visible
- [ ] Dark mode maintains contrast

## Troubleshooting

### Common Issues

#### Import Errors
```bash
# Error: Cannot find module '@/components/shared/layout/Container'
# Solution: Check import path and file location
# Verify tsconfig.json includes correct paths
```

#### TypeScript Errors
```bash
# Error: Property 'x' does not exist on type 'Y'
# Solution: Check component props interface
# Verify all required props are defined
```

#### Styling Issues
```bash
# Error: CSS classes not applying
# Solution: Check Tailwind CSS configuration
# Verify CSS variables are defined
# Check for conflicting styles
```

#### Runtime Errors
```bash
# Error: Cannot read property 'undefined' of null
# Solution: Add proper null checks
# Use optional chaining for nested properties
# Implement proper error boundaries
```

## Continuous Testing

### 1. Automated Testing
```bash
# Set up CI/CD pipeline
# Run tests on every commit
# Fail builds on test failures
# Monitor test coverage over time
```

### 2. Manual Testing
```bash
# Create test checklist for each component
# Perform regression testing before releases
# Test on multiple browsers and devices
# Get user feedback on new components
```

This testing guide provides comprehensive instructions for validating all new components and ensuring they work correctly in the application.