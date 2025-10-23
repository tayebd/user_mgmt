/**
 * Authentication Service
 * Centralizes all authentication-related functionality
 * Replaces scattered getAuthToken() calls throughout the application
 */

import { supabase } from '@/lib/supabase-client';
import { User } from '@/types';

// Re-export User type for convenience
export type { User };

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Authentication Service Class
 * Handles token management, user authentication, and session management
 */
export class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;
  private tokenRefreshPromise: Promise<string | null> | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  private constructor() {
    // Initialize tokens from storage if available
    this.loadTokensFromStorage();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get current access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Check if we need to refresh the token
      if (this.shouldRefreshToken()) {
        await this.refreshToken();
      }

      // If we still don't have a token, try to get it from Supabase
      if (!this.tokens?.accessToken) {
        const session = await supabase.auth.getSession();
        if (session.data.session?.access_token) {
          this.tokens = {
            accessToken: session.data.session.access_token,
            refreshToken: session.data.session.refresh_token,
            expiresAt: session.data.session.expires_in
              ? session.data.session.expires_in * 1000 // Convert to milliseconds
              : undefined,
          };
          this.saveTokensToStorage();
        }
      }

      return this.tokens?.accessToken || null;
    } catch (error) {
      console.error('[Auth Service] Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.performTokenRefresh();

    try {
      const result = await this.tokenRefreshPromise;
      return result;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[Auth Service] Token refresh failed:', error);
        this.clearTokens();
        return null;
      }

      if (data.session?.access_token) {
        this.tokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_in
            ? data.session.expires_in * 1000
            : undefined,
        };
        this.saveTokensToStorage();
        return this.tokens.accessToken;
      }

      return null;
    } catch (error) {
      console.error('[Auth Service] Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Check if token should be refreshed
   */
  private shouldRefreshToken(): boolean {
    if (!this.tokens?.expiresAt) {
      return false;
    }

    const now = Date.now();
    const expiresAt = this.tokens.expiresAt;
    return (expiresAt - now) <= this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      // Transform Supabase user to our User type
      return {
        id: Math.floor(Math.random() * 1000000), // Temporary ID since Supabase doesn't provide one
        uid: user.id,
        email: user.email || '',
        name: user.email?.split('@')[0] || '', // Use email username since name doesn't exist
        avatar: undefined, // No avatar available
        role: 'user', // Default role since role doesn't exist in metadata
      };
    } catch (error) {
      console.error('[Auth Service] Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user && data.session) {
        // Update tokens
        this.tokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_in
            ? data.session.expires_in * 1000
            : undefined,
        };
        this.saveTokensToStorage();

        // Transform user data
        const user: User = {
          id: Math.floor(Math.random() * 1000000), // Temporary ID
          uid: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || '', // Use email username since metadata doesn't exist
          role: 'user', // Default role
        };

        return { user, error: null };
      }

      return { user: null, error: 'Sign in failed' };
    } catch (error) {
      console.error('[Auth Service] Sign in error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: Math.floor(Math.random() * 1000000), // Temporary ID
          uid: data.user.id,
          email: data.user.email || '',
          name: displayName || email.split('@')[0] || '', // Use provided displayName or email username
          role: 'user', // Default role
        };

        return { user, error: null };
      }

      return { user: null, error: 'Sign up failed' };
    } catch (error) {
      console.error('[Auth Service] Sign up error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      // Clear local tokens regardless of API result
      this.clearTokens();

      return { error: error?.message || null };
    } catch (error) {
      console.error('[Auth Service] Sign out error:', error);
      this.clearTokens(); // Ensure local cleanup
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      // resetPasswordForEmail not available in current Supabase mock
      // const { error } = await supabase.auth.resetPasswordForEmail(email);
      console.log('[Auth Service] Reset password requested for:', email);
      return { error: 'Password reset functionality not yet implemented' };
    } catch (error) {
      console.error('[Auth Service] Reset password error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { displayName?: string; profilePictureUrl?: string }): Promise<{ user: User | null; error: string | null }> {
    try {
      // updateUser not available in current Supabase mock
      // const { data, error } = await supabase.auth.updateUser({
      //   data: {
      //     name: updates.displayName,
      //     avatar: updates.profilePictureUrl,
      //   },
      // });

      console.log('[Auth Service] Profile update requested:', updates);
      return {
        user: null,
        error: 'Profile update functionality not yet implemented'
      };
    } catch (error) {
      console.error('[Auth Service] Update profile error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: Math.floor(Math.random() * 1000000), // Temporary ID
          uid: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || '', // Use email username since metadata doesn't exist
          role: 'user', // Default role
        };

        // Update tokens
        if (session.access_token) {
          this.tokens = {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_in
              ? session.expires_in * 1000
              : undefined,
          };
          this.saveTokensToStorage();
        }

        callback(user);
      } else if (event === 'SIGNED_OUT') {
        this.clearTokens();
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(): void {
    if (typeof window !== 'undefined' && this.tokens) {
      try {
        localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
      } catch (error) {
        console.error('[Auth Service] Failed to save tokens to storage:', error);
      }
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth_tokens');
        if (stored) {
          this.tokens = JSON.parse(stored);
        }
      } catch (error) {
        console.error('[Auth Service] Failed to load tokens from storage:', error);
        this.clearTokens();
      }
    }
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    this.tokens = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Get auth headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Create singleton instance
export const authService = AuthService.getInstance();

// Legacy function for backward compatibility
export const getAuthToken = () => authService.getAccessToken();