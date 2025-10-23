/**
 * Enhanced Authentication Context
 * Centralized authentication state management for the application
 * Replaces scattered getAuthToken() calls throughout the codebase
 * Integrates with the new auth service for better token management
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type AuthState, type User } from '@/services/auth-service';

export interface AuthContextType extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthProvider({ children, fallback }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check current authentication status
        const isAuth = await authService.isAuthenticated();

        if (isAuth && mounted) {
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: !!user,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('[Auth Context] Failed to initialize auth:', error);
        if (mounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: error instanceof Error ? error.message : 'Authentication initialization failed',
          });
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (mounted) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Sign in action
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.signIn(email, password);

      if (result.user) {
        setAuthState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: result.error || 'Sign in failed',
        });
        return { success: false, error: result.error || undefined };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Sign up action
  const signUp = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.signUp(email, password, displayName);

      if (result.user) {
        setAuthState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: result.error || 'Sign up failed',
        });
        return { success: false, error: result.error || undefined };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Sign out action
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.signOut();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: result.error,
      });

      return { success: !result.error, error: result.error || undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Reset password action
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.resetPassword(email);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      return { success: !result.error, error: result.error || undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Update profile action
  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.updateProfile(updates);

      if (result.user) {
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          isLoading: false,
          error: null,
        }));
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Profile update failed',
        }));
        return { success: false, error: result.error || undefined };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        error: null,
      }));
    } catch (error) {
      console.error('[Auth Context] Failed to refresh user:', error);
    }
  };

  // Clear error
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser,
    clearError,
  };

  // Show loading state while initializing
  if (authState.isLoading && !authState.user) {
    return <>{fallback || <div>Loading authentication...</div>}</>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * @returns AuthContextType - Authentication state and actions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get current authenticated user
 * @returns User | null - Current user or null if not authenticated
 */
export function useAuthenticatedUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 * @returns boolean - True if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get authentication loading state
 * @returns boolean - True if authentication is loading
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

/**
 * Hook to get authentication error
 * @returns string | null - Current authentication error or null
 */
export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

/**
 * Hook to get authentication token for API calls
 * @returns Promise<string | null> - Authentication token or null
 */
export function useAuthToken(): () => Promise<string | null> {
  const { isAuthenticated } = useAuth();

  return async () => {
    if (!isAuthenticated) {
      return null;
    }
    return await authService.getAccessToken();
  };
}

/**
 * Hook to get auth headers for API requests
 * @returns Promise<Record<string, string>> - Auth headers or empty object
 */
export function useAuthHeaders(): () => Promise<Record<string, string>> {
  const { isAuthenticated } = useAuth();

  return async () => {
    if (!isAuthenticated) {
      return {};
    }
    return await authService.getAuthHeaders();
  };
}

/**
 * Higher-order component for protected routes
 */
export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, fallback, redirectTo = '/auth/signin' }: ProtectedRouteProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback || <div>Checking authentication...</div>}</>;
  }

  if (!isAuthenticated) {
    // Redirect logic would be handled by the router
    // For now, we'll return the fallback
    return <>{fallback || <div>Please sign in to continue</div>}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for role-based access control
 */
export function useRequireRole(requiredRole: string): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  return user.role === requiredRole;
}

/**
 * Hook for permission-based access control
 */
export function useRequirePermission(permission: string): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  // This would be implemented based on your permission system
  // For now, we'll check against user role
  switch (permission) {
    case 'admin':
      return user.role === 'admin';
    case 'user':
      return ['admin', 'user'].includes(user.role);
    case 'guest':
      return true; // Everyone has guest access
    default:
      return false;
  }
}

/**
 * Hook to get user-friendly display name
 */
export function useUserDisplayName(): string {
  const { user } = useAuth();

  if (!user) {
    return 'Guest';
  }

  return user.name || user.email?.split('@')[0] || 'User';
}

/**
 * Hook to get user avatar URL
 */
export function useUserAvatar(): string | null {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.avatar || user.profilePictureUrl || null;
}

/**
 * Hook for authentication status checking
 */
export function useAuthStatus(): {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  isGuest: boolean;
} {
  const { isAuthenticated, isLoading, error } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    hasError: !!error,
    isGuest: !isAuthenticated && !isLoading,
  };
}

// Legacy export for backward compatibility
export default AuthContext;