import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure in-memory user state. No tokens are ever stored in localStorage!
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Clear any legacy localStorage tokens from previous sessions for safety
  useEffect(() => {
    try {
      localStorage.removeItem('nexa_auth_token');
      localStorage.removeItem('nexa_auth_user');
    } catch {
      // ignore
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      // Validates session directly with the backend using the browser's HttpOnly cookie
      const res = await apiFetch('/auth/get-session');
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // The browser receives Set-Cookie: __Secure-better-auth.session_token; HttpOnly; Secure; SameSite=None
      const data = await apiFetch('/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data?.user) {
        setUser(data.user);
      } else {
        await refreshSession();
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Tells the backend to destroy the session and clear the HttpOnly cookie
      await apiFetch('/auth/sign-out', { method: 'POST' });
    } catch {
      // ignore
    } finally {
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
