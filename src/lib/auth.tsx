import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import api, { tokenStorage } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get<User>('/api/auth/me');
      setUser(data);
    } catch {
      tokenStorage.remove();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    tokenStorage.set(data.token);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/signup', { name, email, password });
    tokenStorage.set(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      tokenStorage.remove();
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    await api.post('/api/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await api.post('/api/auth/reset-password', { token, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
