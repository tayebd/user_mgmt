import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for development
export const supabase = {
  auth: {
    getSession: async () => ({
      data: {
        session: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'mock_user_id',
            email: 'mock@example.com',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          }
        }
      },
      error: null
    }),
    onAuthStateChange: (callback: (event: string, session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user: {
        id: string;
        email: string;
        role: string;
        app_metadata: Record<string, string | number | boolean | null>;
        user_metadata: Record<string, string | number | boolean | null>;
        aud: string;
        created_at: string;
      };
    } | null) => void) => {
      // Immediately trigger with mock session
      callback('SIGNED_IN', {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'mock_user_id',
          email: 'mock@example.com',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      });
      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    },
    getUser: async () => ({
      data: {
        user: {
          id: 'mock_user_id',
          email: 'mock@example.com',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      },
      error: null
    }),
    signInWithPassword: async (credentials: { email: string; password: string }) => ({
      data: {
        user: {
          id: 'mock_user_id',
          email: 'mock@example.com',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token'
        }
      },
      error: null
    }),
    signUp: async (credentials: { email: string; password: string; options?: { emailRedirectTo?: string } }) => ({
      data: {
        user: {
          id: 'mock_user_id',
          email: credentials.email,
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      },
      error: null
    }),
    signOut: async () => ({ error: null })
  }
};
