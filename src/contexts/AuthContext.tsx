// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { useUserStore, User } from '../stores/userStore';

// Create a custom event for cart refresh
export const CART_REFRESH_EVENT = 'cart-refresh';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // If stored user data is invalid, clear everything
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        clearUser();
        
        // Trigger cart refresh to clear cart state
        window.dispatchEvent(new Event(CART_REFRESH_EVENT));
      }
    }
    
    setLoading(false);

    // Listen for auth invalidation events (from API interceptor)
    const handleAuthInvalid = () => {
      console.log('🔓 Auth invalidated - clearing user state');
      clearUser();
      window.dispatchEvent(new Event(CART_REFRESH_EVENT));
    };

    window.addEventListener('auth-invalid', handleAuthInvalid);
    
    return () => {
      window.removeEventListener('auth-invalid', handleAuthInvalid);
    };
  }, [setUser, clearUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login(email, password);
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Store user info using userStore
      setUser(data.user);
      
      // Trigger cart refresh
      window.dispatchEvent(new Event(CART_REFRESH_EVENT));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      await authAPI.register({
        email,
        password,
        firstName,
        lastName,
      });
      
      // Note: After registration, user needs to verify email before logging in
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearUser();
    
    // Trigger cart refresh to clear cart
    window.dispatchEvent(new Event(CART_REFRESH_EVENT));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
