import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { handleApiError, isNotFoundError } from '@/utils/error-handling';

// Import shared types from server
import type { User } from '@/types';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchUserByUid: (uid: string) => Promise<User>;
  createUser: (user: Partial<User>) => Promise<User>;
  updateUser: (userId: number, user: Partial<User>) => Promise<User>;
  deleteUser: (userId: number) => Promise<boolean>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const userCache: { [uid: string]: { user: User; timestamp: number } } = {};
const failedLookupCache: { [uid: string]: { timestamp: number } } = {};

const isUser = (data: unknown): data is User => {
  if (!data || typeof data !== 'object') return false;
  const user = data as Record<string, unknown>;
  return (
    typeof user.uid === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.role === 'string'
  );
};


export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getUsers();
      if (Array.isArray(response.data)) {
        set({ users: response.data as User[], isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch users');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchUserByUid: async (uid: string): Promise<User> => {
    if (!uid) {
      throw new Error('User UID is required');
    }

    // Check cache first
    const cachedUser = userCache[uid];
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      return cachedUser.user;
    }

    // Check failed lookup cache
    const failedLookup = failedLookupCache[uid];
    if (failedLookup && Date.now() - failedLookup.timestamp < CACHE_TTL) {
      throw new Error(`USER_NOT_FOUND: User with UID ${uid} not found (cached)`);
    }

    try {
      const response = await apiClient.getUserByUid(uid);

      if (!isUser(response.data)) {
        throw new Error('Invalid user data structure');
      }

      // Update store and cache
      const { users } = get();
      set({ users: [...users.filter(u => u.uid !== uid), response.data] });
      userCache[uid] = { user: response.data, timestamp: Date.now() };

      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        // Cache failed lookup
        failedLookupCache[uid] = { timestamp: Date.now() };
      }
      throw error;
    }
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    if (!userData?.uid || !userData?.email) {
      throw new Error('Cannot create user without UID and email');
    }

    // Check if user already exists
    const { users } = get();
    const existingUser = users.find(u => u.uid === userData.uid || u.email === userData.email);
    if (existingUser) {
      throw new Error(`User already exists with ${existingUser.uid === userData.uid ? 'UID' : 'email'}`);
    }

    try {
      const response = await apiClient.createUser(userData);

      if (!isUser(response.data)) {
        throw new Error('Invalid user data received from server');
      }

      // Update store and cache
      set({ users: [...users, response.data as User] });
      userCache[response.data.uid] = { user: response.data as User, timestamp: Date.now() };

      // Remove from failed lookup cache if present
      delete failedLookupCache[response.data.uid];

      return response.data as User;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create user');
      throw new Error(errorMessage);
    }
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await apiClient.put(`/users/${userId}`, userData);

      if (!response.data || !(response.data as User).id) {
        throw new Error('Invalid user data received from server');
      }

      // Update store
      const { users } = get();
      const updatedUser = { ...response.data } as User;
      set({
        users: users.map(u => u.id === userId ? updatedUser : u)
      });

      // Update cache if user is cached
      if (userCache[updatedUser.uid]) {
        userCache[updatedUser.uid] = { user: updatedUser, timestamp: Date.now() };
      }

      return updatedUser;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update user');
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (userId: number): Promise<boolean> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      await apiClient.delete(`/users/${userId}`);

      // Update store
      const { users } = get();
      const deletedUser = users.find(u => u.id === userId);
      set({
        users: users.filter(u => u.id !== userId)
      });

      // Remove from cache if present
      if (deletedUser && userCache[deletedUser.uid]) {
        delete userCache[deletedUser.uid];
      }

      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete user');
      throw new Error(errorMessage);
    }
  },

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  clearError: () => {
    set({ error: null });
  },
}));