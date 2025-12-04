/**
 * ThemeProvider Component Tests
 * Tests for the advanced theming system component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme, Theme, ThemeMode } from '@/components/shared/theme/ThemeProvider';

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock window.matchMedia to return a valid mock
beforeEach(() => {
  mockMatchMedia.mockReturnValue({
    matches: false,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ThemeProvider Component', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.documentElement.setAttribute('data-theme', '');
    Object.keys(document.documentElement.style).forEach(key => {
      document.documentElement.style.removeProperty(key);
    });
    jest.clearAllMocks();
  });

  it('renders children without crashing', () => {
    render(
      <ThemeProvider>
        <div>Test child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test child')).toBeInTheDocument();
  });

  it('provides default light theme', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-color">{theme.colors.primary}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeColor = screen.getByTestId('theme-color');
    expect(themeColor).toHaveTextContent('#3b82f6'); // light theme primary color
  });

  it('toggles between light and dark modes', () => {
    const TestComponent = () => {
      const { theme, toggleMode, isDark } = useTheme();
      return (
        <div>
          <span data-testid="is-dark">{isDark.toString()}</span>
          <span data-testid="primary-color">{theme.colors.primary}</span>
          <button onClick={toggleMode}>Toggle Theme</button>
        </div>
      );
    };

    render(
      <ThemeProvider defaultMode="light">
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light mode
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#3b82f6');

    // Toggle to dark mode
    fireEvent.click(screen.getByText('Toggle Theme'));

    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#60a5fa'); // dark theme primary color
  });

  it('sets specific mode', () => {
    const TestComponent = () => {
      const { mode, setMode } = useTheme();
      return (
        <div>
          <span data-testid="current-mode">{mode}</span>
          <button onClick={() => setMode('dark')}>Set Dark</button>
          <button onClick={() => setMode('light')}>Set Light</button>
        </div>
      );
    };

    render(
      <ThemeProvider defaultMode="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('system');

    // Set to dark mode
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');

    // Set to light mode
    fireEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
  });

  it('respects system preference when mode is system', () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // Dark mode
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const TestComponent = () => {
      const { isDark } = useTheme();
      return <span data-testid="is-dark">{isDark.toString()}</span>;
    };

    render(
      <ThemeProvider defaultMode="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates CSS variables', () => {
    render(
      <ThemeProvider defaultMode="light">
        <div>Test</div>
      </ThemeProvider>
    );

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary')).toBe('#3b82f6');
    expect(root.style.getPropertyValue('--color-background')).toBe('#ffffff');
    // Note: spacing variables might not be set, so we check the main color ones
  });

  it('updates data-theme attribute', () => {
    const TestComponent = () => {
      const { toggleMode } = useTheme();
      return <button onClick={toggleMode}>Toggle</button>;
    };

    render(
      <ThemeProvider defaultMode="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByText('Toggle'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('listens for system theme changes', () => {
    let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback;
        }
      }),
      removeEventListener: jest.fn(),
    });

    const TestComponent = () => {
      const { isDark } = useTheme();
      return <span data-testid="is-dark">{isDark.toString()}</span>;
    };

    render(
      <ThemeProvider defaultMode="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

    // Simulate system theme change
    if (mediaQueryCallback) {
      mediaQueryCallback({ matches: true } as MediaQueryListEvent);
    }

    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    const TestComponent = () => {
      useTheme();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });

  it('cycles through all modes when toggleMode is called multiple times', () => {
    const TestComponent = () => {
      const { mode, toggleMode } = useTheme();
      return (
        <div>
          <span data-testid="current-mode">{mode}</span>
          <button onClick={toggleMode}>Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider defaultMode="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');

    // Light -> Dark
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');

    // Dark -> System
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('system');

    // System -> Light
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
  });

  it('provides complete theme structure', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return (
        <div>
          <span data-testid="primary">{theme.colors.primary}</span>
          <span data-testid="spacing">{theme.spacing.md}</span>
          <span data-testid="border-radius">{theme.borderRadius.md}</span>
          <span data-testid="shadow">{theme.shadows.sm}</span>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6');
    expect(screen.getByTestId('spacing')).toHaveTextContent('1rem');
    expect(screen.getByTestId('border-radius')).toHaveTextContent('0.375rem');
    expect(screen.getByTestId('shadow')).toHaveTextContent('0 1px 2px 0 rgb(0 0 0 / 0.05)');
  });

  it('handles dark theme colors correctly', () => {
    const TestComponent = () => {
      const { theme, setMode } = useTheme();
      return (
        <div>
          <button onClick={() => setMode('dark')}>Set Dark</button>
          <span data-testid="surface-color">{theme.colors.surface}</span>
          <span data-testid="text-color">{theme.colors.textPrimary}</span>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light theme
    expect(screen.getByTestId('surface-color')).toHaveTextContent('#f8fafc');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#1e293b');

    // Switch to dark theme
    fireEvent.click(screen.getByText('Set Dark'));

    expect(screen.getByTestId('surface-color')).toHaveTextContent('#1f2937');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#f9fafb');
  });

  it('provides all required theme properties', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      const requiredProps = [
        'primary', 'primaryDark', 'secondary', 'success', 'warning', 'error',
        'background', 'surface', 'textPrimary', 'textSecondary', 'border', 'muted'
      ];

      return (
        <div>
          {requiredProps.map(prop => (
            <span key={prop} data-testid={`color-${prop}`}>
              {theme.colors[prop as keyof typeof theme.colors]}
            </span>
          ))}
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check that all color properties are defined
    const colorElements = screen.getAllByTestId(/^color-/);
    expect(colorElements.length).toBeGreaterThanOrEqual(11); // At least the main colors
    colorElements.forEach(element => {
      expect(element).toHaveTextContent(/^#[0-9a-f]{6}$/);
    });
  });
});