import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import { 
  AuthUser, 
  getStoredToken, 
  setStoredToken, 
  getStoredUser, 
  setStoredUser, 
  clearAuthStorage 
} from '../lib/auth-storage';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token && !user) {
        setLoading(false);
        return;
      }

      const res = await apiFetch('/auth/get-session');
      if (res?.user) {
        setUser(res.user);
        setStoredUser(res.user);
      } else if (!user) {
        clearAuthStorage();
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification fallback:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data?.token) {
        setStoredToken(data.token);
      }
      if (data?.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/sign-out', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
      {children}
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
