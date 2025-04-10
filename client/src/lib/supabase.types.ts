import { Session, User } from '@supabase/supabase-js';

export type MockSupabaseClient = {
  auth: {
    getSession: () => Promise<{
      data: { session: Session | null };
      error: Error | null;
    }>;
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      data: { subscription: { unsubscribe: () => void } };
      error: Error | null;
    };
    getUser: () => Promise<{
      data: { user: User | null };
      error: Error | null;
    }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: User | null };
      error: Error | null;
    }>;
    signUp: (credentials: {
      email: string;
      password: string;
      options?: { emailRedirectTo?: string };
    }) => Promise<{
      data: { user: User | null };
      error: Error | null;
    }>;
    signOut: () => Promise<{ error: Error | null }>;
  };
};
