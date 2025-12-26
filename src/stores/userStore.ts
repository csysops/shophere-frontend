import { create } from 'zustand';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; avatar?: string }) => Promise<void>;
  clearUser: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user: User | null) => {
    set({ user, error: null });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.getProfile();
      get().setUser(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
      set({ error: errorMessage, loading: false });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; avatar?: string }) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      get().setUser(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      set({ error: errorMessage, loading: false });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearUser: () => {
    set({ user: null, error: null, loading: false });
    localStorage.removeItem('user');
  },

  clearError: () => {
    set({ error: null });
  },
}));

