'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');

      if (user) {
        console.log('User details:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });

        try {
          const token = await user.getIdToken();
          console.log('Token successfully retrieved:', token.substring(0, 10) + '...');
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }

      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful for user:', result.user.uid);
      const token = await result.user.getIdToken();
      console.log('Initial token retrieved:', token.substring(0, 10) + '...');
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting sign up for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful for user:', result.user.uid);
      window.location.href = '/login'; // Redirect to login page after sign-up
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

const signOut = async () => {
  try {
    console.log('Attempting sign out...');
    await firebaseSignOut(auth);
    console.log('Sign out successful');
    window.location.href = '/login'; // Redirect to login page
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
