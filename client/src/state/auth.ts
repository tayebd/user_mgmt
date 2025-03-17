import { create } from 'zustand';
import { User } from '@/types';
import { useApiStore } from './api';

interface AuthState {
  currentUserId: number | null;
  isLoading: boolean;
  userLookupAttempts: Record<string, number>;
  userCreationAttempted: Set<string>;
  nonExistentUsers: Set<string>;
  setCurrentUserId: (id: number | null) => void;
  setLoading: (loading: boolean) => void;
  resetLookupAttempts: (uid: string) => void;
  incrementLookupAttempts: (uid: string) => void;
  markUserCreationAttempted: (uid: string) => void;
  markUserNonExistent: (uid: string) => void;
  hasExceededLookupAttempts: (uid: string) => boolean;
  clear: () => void;
}

const MAX_LOOKUP_ATTEMPTS = 2;

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUserId: null,
  isLoading: true,
  userLookupAttempts: {},
  userCreationAttempted: new Set(),
  nonExistentUsers: new Set(),

  setCurrentUserId: (id: number | null) => set({ currentUserId: id }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  resetLookupAttempts: (uid: string) => set(state => ({
    userLookupAttempts: { ...state.userLookupAttempts, [uid]: 0 }
  })),
  
  incrementLookupAttempts: (uid: string) => set(state => ({
    userLookupAttempts: {
      ...state.userLookupAttempts,
      [uid]: (state.userLookupAttempts[uid] || 0) + 1
    }
  })),
  
  markUserCreationAttempted: (uid: string) => set(state => ({
    userCreationAttempted: new Set([...state.userCreationAttempted, uid])
  })),
  
  markUserNonExistent: (uid: string) => set(state => ({
    nonExistentUsers: new Set([...state.nonExistentUsers, uid])
  })),
  
  hasExceededLookupAttempts: (uid: string) => {
    const attempts = get().userLookupAttempts[uid] || 0;
    return attempts > MAX_LOOKUP_ATTEMPTS;
  },
  
  clear: () => set({
    currentUserId: null,
    isLoading: false,
    userLookupAttempts: {},
    userCreationAttempted: new Set(),
    nonExistentUsers: new Set()
  })
}));
