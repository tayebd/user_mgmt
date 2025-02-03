import { create } from 'zustand';
import { User, Company } from '@/types';
import { auth } from '@/lib/firebase';

export interface SearchResults {
  users?: User[];
}

// Helper function to get the current auth token
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken(true);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

interface ApiState {
  users: User[];
  companies: Company[];
  searchResults: SearchResults;
  fetchUsers: () => Promise<void>;
  fetchUser: (userId: string) => Promise<User>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (userId: string, user: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchItems: (searchTerm: string) => Promise<void>;
  fetchCompanies: () => Promise<void>;
  createCompany: (company: Partial<Company>) => Promise<void>;
  updateCompany: (companyId: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
}

const apiStore = create<ApiState>((set) => ({
  users: [],
  companies: [],
  searchResults: {},
  fetchUsers: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await response.json();
    set({ users: data });
  },
  fetchUser: async (userId: string) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  createUser: async (user: Partial<User>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ users: [...state.users, data] }));
  },
  updateUser: async (userId: string, user: Partial<User>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? data : u)),
    }));
  },
  deleteUser: async (userId: string) => {
    const token = await getAuthToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  },
  searchItems: async (searchTerm: string) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await response.json();
    set({ searchResults: data });
  },
  fetchCompanies: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await response.json();
    set({ companies: data });
  },
  createCompany: async (company: Partial<Company>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(company),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ companies: [...state.companies, data] }));
  },
  updateCompany: async (companyId: string, company: Partial<Company>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(company),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      companies: state.companies.map((c) => (c.id === companyId ? data : c)),
    }));
  },
  deleteCompany: async (companyId: string) => {
    const token = await getAuthToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== companyId),
    }));
  },
}));

export const useApiStore = apiStore;
