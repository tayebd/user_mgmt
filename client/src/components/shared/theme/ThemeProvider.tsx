/**
 * Theme Provider
 * Provides consistent theming across the application
 * Supports light/dark modes and custom themes
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    muted: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    muted: '#f1f5f9',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#60a5fa',
    primaryDark: '#3b82f6',
    secondary: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    background: '#111827',
    surface: '#1f2937',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    muted: '#1e293b',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  },
};

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Determine if dark mode should be used
  const getIsDark = useCallback((mode: ThemeMode): boolean => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    const isDark = getIsDark(mode);
    setTheme(isDark ? darkTheme : lightTheme);
    
    // Update CSS variables
    const root = document.documentElement;
    const colors = isDark ? darkTheme.colors : lightTheme.colors;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Update data attribute for CSS targeting
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [mode, getIsDark]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const isDark = mediaQuery.matches;
      setTheme(isDark ? darkTheme : lightTheme);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  }, []);

  const isDark = theme === darkTheme;

  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    toggleMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility function to get theme-aware class names
export function cnTheme(...classes: (string | undefined | null | false)[]): string {
  const { isDark } = useTheme();
  
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls !== 'string') return cls;
      
      // Handle dark mode variants
      if (cls.includes('dark:')) {
        return isDark ? cls.replace('dark:', '') : null;
      }
      
      // Handle light mode variants
      if (cls.includes('light:')) {
        return !isDark ? cls.replace('light:', '') : null;
      }
      
      return cls;
    })
    .filter(Boolean)
    .join(' ');
}

// Theme-aware CSS variables
export const themeVars = {
  colors: {
    primary: 'var(--color-primary)',
    primaryDark: 'var(--color-primaryDark)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    textPrimary: 'var(--color-textPrimary)',
    textSecondary: 'var(--color-textSecondary)',
    border: 'var(--color-border)',
    muted: 'var(--color-muted)',
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  },
  borderRadius: {
    sm: 'var(--borderRadius-sm)',
    md: 'var(--borderRadius-md)',
    lg: 'var(--borderRadius-lg)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
};

export { lightTheme, darkTheme };
export default ThemeProvider;