import { useEffect, useCallback, useRef, useState } from 'react';
import { useApiStore } from '@/state/api';
import { useAuthStore } from '@/state/auth';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface ApiStore {
  fetchUserByUid: (uid: string) => Promise<User | null>;
  createUser: (params: CreateUserParams) => Promise<User | null>;
  findUserByEmail: (email: string) => Promise<User | null>;
}

interface AuthStore {
  currentUserId: number | null;
  isLoading: boolean;
  setCurrentUserId: (id: number | null) => void;
  setLoading: (loading: boolean) => void;
  userCreationAttempted: Set<string>;
  nonExistentUsers: Set<string>;
  clear: () => void;
}

interface CreateUserParams {
  email: string;
  name: string;
  uid: string;
  role: 'USER' | 'ADMIN';
  photoURL?: string | null;
}

interface UseUserAuthResult {
  currentUserId: number | null;
  isLoading: boolean;
}

const REQUEST_TIMEOUT = 20000; // 20 seconds

// Type guard for User type
const isUser = (data: unknown): data is User => {
  if (!data || typeof data !== 'object') return false;
  const user = data as Partial<User>;
  return typeof user.id === 'number' &&
    typeof user.uid === 'string' &&
    typeof user.email === 'string';
};

/**
 * Custom hook for handling user authentication and database user retrieval.
 * Uses Zustand for state management and caching.
 * @returns An object containing the current user ID and loading state
 */
/**
 * Custom hook for managing user authentication and synchronization with the server.
 * Implements robust error handling and state management.
 */
export const useUserAuth = (): UseUserAuthResult => {
  const { fetchUserByUid, createUser } = useApiStore() as ApiStore;
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.warn('[Auth] Supabase client not configured');
      setAuthLoading(false);
      return;
    }

    console.log('[Auth] Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state changed:', event, session);
      setSession(session);
      setAuthLoading(false);
    });

    // Get initial session
    console.log('[Auth] Getting initial session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Error getting initial session:', error);
      }
      console.log('[Auth] Initial session:', session);
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const supabaseUser = session?.user as SupabaseUser | undefined;
  const {
    currentUserId,
    isLoading,
    setCurrentUserId,
    setLoading,
    userCreationAttempted,
    nonExistentUsers,
    clear
  } = useAuthStore() as AuthStore;

  const initializationRef = useRef(false);

  /**
   * Validates and extracts required user data from Supabase user object
   * @returns Object containing validated user data or null if invalid
   */
  const validateSupabaseUser = useCallback(() => {
    if (!supabaseUser?.id || !supabaseUser?.email) {
      console.warn('[Auth] Invalid Supabase user data:', { id: supabaseUser?.id, email: supabaseUser?.email });
      return null;
    }
    return {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      photoURL: supabaseUser.user_metadata?.avatar_url
    };
  }, [supabaseUser]);

  /**
   * Attempts to fetch an existing user from the server
   * @param uid User's Supabase UID
   * @returns User object if found, null otherwise
   */
  const fetchExistingUser = useCallback(async (uid: string): Promise<User | null> => {
    try {
      return await Promise.race([
        fetchUserByUid(uid),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`)), REQUEST_TIMEOUT)
        )
      ]);
    } catch (error) {
      console.error('[Auth] Error fetching user:', error instanceof Error ? error.message : error);
      return null;
    }
  }, [fetchUserByUid]);

  /**
   * Creates a new user in the database
   * @param userData Validated user data from Supabase
   * @returns Created user object if successful, null otherwise
   */
  const createNewUser = useCallback(async (userData: ReturnType<typeof validateSupabaseUser>) => {
    if (!userData) return null;
    
    try {
      const userParams: CreateUserParams = {
        email: userData.email,
        name: userData.displayName || userData.email.split('@')[0],
        uid: userData.uid,
        role: 'USER',
        photoURL: userData.photoURL || null
      };

      const newUser = await createUser(userParams);
      return newUser && isUser(newUser) ? newUser : null;
    } catch (error) {
      console.error('[Auth] Error creating user:', error instanceof Error ? error.message : error);
      return null;
    }
  }, [createUser]);

  /**
   * Main function to synchronize user data with the server
   */
  const syncUserWithServer = useCallback(async (): Promise<void> => {
    const userData = validateSupabaseUser();
    if (!userData) {
      clear();
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    // Skip if user is known to not exist
    if (nonExistentUsers.has(userData.uid)) {
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try to fetch existing user
      const existingUser = await fetchExistingUser(userData.uid);
      if (existingUser && isUser(existingUser)) {
        setCurrentUserId(existingUser.id);
        return;
      }

      // Create new user if not attempted before
      if (!userCreationAttempted.has(userData.uid)) {
        const newUser = await createNewUser(userData);
        if (newUser) {
          setCurrentUserId(newUser.id);
          return;
        }
      }

      setCurrentUserId(null);
    } catch (error) {
      console.error('[Auth] Error syncing user:', error instanceof Error ? error.message : error);
      setCurrentUserId(null);
    } finally {
      setLoading(false);
    }
  }, [validateSupabaseUser, fetchExistingUser, createNewUser, setCurrentUserId, setLoading, nonExistentUsers, userCreationAttempted, clear]);

  // Initialize user authentication state
  useEffect(() => {
    if (!authLoading && !initializationRef.current) {
      initializationRef.current = true;
      syncUserWithServer();
    }
    return () => {
      initializationRef.current = false;
    };
  }, [authLoading, syncUserWithServer]);

  return { currentUserId, isLoading };
};
