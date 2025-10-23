import { createClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variable schema validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

// Validate environment variables
const env = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Create mock client for development
const createMockClient = () => {
  console.warn('Using mock Supabase client for development');
  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer' as const,
    user: {
      id: 'mock-user-id',
      email: 'mock@example.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }
  };

  return {
    auth: {
      signInWithPassword: async () => ({ data: { user: mockSession.user, session: mockSession }, error: null }),
      signUp: async () => ({ data: { user: mockSession.user }, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      getUser: async () => ({ data: { user: mockSession.user }, error: null }),
      refreshSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        // Immediately trigger with mock session
        setTimeout(() => callback('SIGNED_IN', mockSession), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  };
};

// Create Supabase client with proper configuration - use mock for development
export const supabaseClient = env.success && process.env.NODE_ENV === 'production'
  ? createClient(env.data.NEXT_PUBLIC_SUPABASE_URL, env.data.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : createMockClient();

// Authentication utilities
export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async signUp(email: string, password: string, userMetadata?: Record<string, unknown>) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  static async getUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }

  static async refreshSession() {
    const { data, error } = await supabaseClient.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
}

// Token management utilities
export class TokenService {
  static async getAccessToken(): Promise<string | null> {
    const session = await AuthService.getSession();
    return session?.access_token || null;
  }

  static async getAuthorizationHeader(): Promise<string | null> {
    const token = await TokenService.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// Export the client for direct use
export { supabaseClient as supabase };